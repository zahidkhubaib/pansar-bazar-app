import express from 'express';
import { body } from 'express-validator';
import { submitContactForm } from '../controllers/contactController.js';
import { validate } from '../utils/validation.js';

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim().isLength({ max: 30 }),
    body('subject').optional().trim().isLength({ max: 120 }),
    body('message').trim().isLength({ min: 10, max: 3000 }).withMessage('Message is required'),
  ],
  validate,
  submitContactForm,
);

export default router;
