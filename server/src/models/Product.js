import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  {
    timestamps: true,
  },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 140,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 5000,
    },
    image: {
      url: { type: String, default: '' },
      filename: { type: String, default: '' },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      trim: true,
      default: '100g',
    },
    tags: [{ type: String, trim: true }],
    featured: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

productSchema.pre('validate', function buildSlug(next) {
  if (!this.slug && this.name) {
    this.slug = `${slugify(this.name)}-${Date.now().toString(36)}`;
  }

  next();
});

productSchema.methods.recalculateRating = function recalculateRating() {
  this.ratingCount = this.reviews.length;
  this.ratingAverage = this.ratingCount
    ? Number(
        (
          this.reviews.reduce((sum, review) => sum + review.rating, 0) /
          this.ratingCount
        ).toFixed(1),
      )
    : 0;
};

export const Product = mongoose.model('Product', productSchema);
