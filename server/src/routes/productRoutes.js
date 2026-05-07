import express from 'express';
import { body } from 'express-validator';
import {
  addReview,
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/productController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../utils/validation.js';

const router = express.Router();

const productValidators = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
  body('unit').optional().trim(),
  body('featured').optional().toBoolean().isBoolean(),
  body('imageUrl').optional().isString(),
];

router
  .route('/')
  .get(getProducts)
  .post(protect, adminOnly, upload.single('image'), productValidators, validate, createProduct);

router.post(
  '/:id/reviews',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be from 1 to 5'),
    body('comment').trim().isLength({ min: 3 }).withMessage('Comment is required'),
  ],
  validate,
  addReview,
);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, adminOnly, upload.single('image'), updateProduct)
  .delete(protect, adminOnly, deleteProduct);

export default router;
