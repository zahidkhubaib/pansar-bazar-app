import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  safelySendEmail,
  sendAdminOrderNotificationEmail,
  sendOrderConfirmationEmail,
} from '../utils/emailService.js';

const buildWhatsappUrl = (order) => {
  const phone = process.env.WHATSAPP_PHONE;

  if (!phone) {
    return '';
  }

  const items = order.items
    .map((item) => `${item.name} x ${item.quantity} (${item.unit})`)
    .join(', ');
  const text = [
    `New Pansar Bazar order #${order._id}`,
    `Customer: ${order.address.name}`,
    `Phone: ${order.address.phone}`,
    `Address: ${order.address.line1}, ${order.address.city}`,
    `Items: ${items}`,
    `Total: PKR ${order.total}`,
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

export const createOrder = asyncHandler(async (req, res) => {
  const { items = [], address, paymentMethod = 'COD' } = req.body;

  if (!items.length) {
    throw new ApiError(422, 'Order items are required');
  }

  const quantityByProduct = items.reduce((acc, item) => {
    const quantity = Number(item.quantity);
    acc.set(item.product, (acc.get(item.product) || 0) + quantity);
    return acc;
  }, new Map());
  const ids = [...quantityByProduct.keys()];
  const products = await Product.find({ _id: { $in: ids } });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const orderItems = ids.map((productId) => {
    const product = productMap.get(productId);
    const quantity = quantityByProduct.get(productId);

    if (!product) {
      throw new ApiError(404, 'One or more products were not found');
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiError(422, 'Quantity must be at least 1');
    }

    if (product.stock < quantity) {
      throw new ApiError(409, `${product.name} has only ${product.stock} in stock`);
    }

    return {
      product: product._id,
      name: product.name,
      image: product.image?.url || '',
      price: product.price,
      quantity,
      unit: product.unit,
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    total,
    address,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'unpaid' : 'paid',
  });

  await Promise.all(
    orderItems.map((item) =>
      Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
      ),
    ),
  );

  order.whatsappUrl = buildWhatsappUrl(order);
  await order.save();

  await Promise.all([
    safelySendEmail(() => sendOrderConfirmationEmail({ order, user: req.user })),
    safelySendEmail(() => sendAdminOrderNotificationEmail({ order, user: req.user })),
  ]);

  res.status(201).json({ order });
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

export const getAdminOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.status = req.body.status || order.status;
  order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
  await order.save();

  res.json({ order });
});

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [ordersCount, usersCount, revenueAgg, recentOrders, lowStockProducts] =
    await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, revenue: { $sum: '$total' } } },
      ]),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(8),
    ]);

  res.json({
    stats: {
      orders: ordersCount,
      users: usersCount,
      revenue: revenueAgg[0]?.revenue || 0,
      recentOrders,
      lowStockProducts,
    },
  });
});
