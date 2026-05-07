import express from 'express';
import { body } from 'express-validator';
import { deleteUser, getUsers, updateUser } from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { validate } from '../utils/validation.js';

const router = express.Router();

router.use(protect, adminOnly);

router.route('/').get(getUsers);

router
  .route('/:id')
  .put(
    [
      body('name').optional().trim().isLength({ min: 2 }),
      body('email').optional().isEmail().normalizeEmail(),
      body('role').optional().isIn(['user', 'admin']),
      body('phone').optional().trim(),
    ],
    validate,
    updateUser,
  )
  .delete(deleteUser);

export default router;
