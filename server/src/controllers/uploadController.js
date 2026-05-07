import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Image file is required');
  }

  res.status(201).json({
    image: {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    },
  });
});
