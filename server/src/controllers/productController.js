import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveCategory = async (categoryValue) => {
  if (!categoryValue) {
    return null;
  }

  if (mongoose.isValidObjectId(categoryValue)) {
    return categoryValue;
  }

  const category = await Category.findOne({
    $or: [{ slug: categoryValue }, { name: new RegExp(`^${escapeRegex(categoryValue)}$`, 'i') }],
  });

  return category?._id || null;
};

const parseTags = (tags) => {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags.flatMap(parseTags).filter(Boolean);
  }

  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const normalizeImage = (body, req) => {
  if (req.file) {
    return {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    };
  }

  if (body.imageUrl) {
    return {
      url: body.imageUrl,
      filename: '',
    };
  }

  if (body.image?.url) {
    return body.image;
  }

  return undefined;
};

export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    featured,
    sort = '-createdAt',
    page = 1,
    limit = 12,
  } = req.query;

  const filter = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    const categoryId = await resolveCategory(category);
    filter.category = categoryId || null;
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true';
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const currentPage = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 48);
  const skip = (currentPage - 1) * pageSize;
  const sortMap = {
    newest: '-createdAt',
    price_asc: 'price',
    price_desc: '-price',
    rating: '-ratingAverage',
  };
  const sortValue = sortMap[sort] || sort;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(search ? { score: { $meta: 'textScore' } } : sortValue)
      .skip(skip)
      .limit(pageSize),
    Product.countDocuments(filter),
  ]);

  res.json({
    products,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      pages: Math.ceil(total / pageSize),
    },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const query = mongoose.isValidObjectId(req.params.id)
    ? { _id: req.params.id }
    : { slug: req.params.id };
  const product = await Product.findOne(query)
    .populate('category', 'name slug')
    .populate('reviews.user', 'name');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({ product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const categoryId = await resolveCategory(req.body.category);

  if (!categoryId) {
    throw new ApiError(422, 'Valid category is required');
  }

  const image = normalizeImage(req.body, req);
  const product = await Product.create({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    category: categoryId,
    stock: req.body.stock,
    unit: req.body.unit,
    tags: parseTags(req.body.tags),
    featured: req.body.featured,
    image,
  });

  const populated = await product.populate('category', 'name slug');
  res.status(201).json({ product: populated });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  if (updates.tags !== undefined) {
    updates.tags = parseTags(updates.tags);
  }

  if (updates.category) {
    const categoryId = await resolveCategory(updates.category);
    if (!categoryId) {
      throw new ApiError(422, 'Valid category is required');
    }
    updates.category = categoryId;
  }

  const image = normalizeImage(req.body, req);
  if (image) {
    updates.image = image;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({ message: 'Product deleted' });
});

export const addReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const alreadyReviewed = product.reviews.some(
    (review) => review.user.toString() === req.user._id.toString(),
  );

  if (alreadyReviewed) {
    throw new ApiError(409, 'You have already reviewed this product');
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  product.recalculateRating();

  await product.save();
  res.status(201).json({ product });
});
