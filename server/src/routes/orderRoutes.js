import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getAdminOrders,
  getDashboardStats,
  getUserOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { validate } from '../utils/validation.js';

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('items').isArray({ min: 1 }).withMessage('Items are required'),
    body('items.*.product').isMongoId().withMessage('Valid product id is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('address.name').trim().notEmpty().withMessage('Address name is required'),
    body('address.phone').trim().notEmpty().withMessage('Phone is required'),
    body('address.line1').trim().notEmpty().withMessage('Address line is required'),
    body('address.city').trim().notEmpty().withMessage('City is required'),
    body('paymentMethod').optional().isIn(['COD', 'Stripe']),
  ],
  validate,
  createOrder,
);

router.get('/user', protect, getUserOrders);
router.get('/admin', protect, adminOnly, getAdminOrders);
router.get('/admin/stats', protect, adminOnly, getDashboardStats);
router.put(
  '/:id/status',
  protect,
  adminOnly,
  [
    body('status')
      .optional()
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    body('paymentStatus').optional().isIn(['unpaid', 'paid', 'refunded']),
  ],
  validate,
  updateOrderStatus,
);

export default router;
