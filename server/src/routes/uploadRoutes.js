import express from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/image', protect, adminOnly, upload.single('image'), uploadImage);

export default router;
