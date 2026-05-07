import express from 'express';
import { body } from 'express-validator';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../controllers/categoryController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { validate } from '../utils/validation.js';

const router = express.Router();

router
  .route('/')
  .get(getCategories)
  .post(
    protect,
    adminOnly,
    [
      body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
      body('description').optional().trim(),
      body('isActive').optional().isBoolean(),
    ],
    validate,
    createCategory,
  );

router
  .route('/:id')
  .put(
    protect,
    adminOnly,
    [
      body('name').optional().trim().isLength({ min: 2 }),
      body('description').optional().trim(),
      body('isActive').optional().isBoolean(),
    ],
    validate,
    updateCategory,
  )
  .delete(protect, adminOnly, deleteCategory);

export default router;
