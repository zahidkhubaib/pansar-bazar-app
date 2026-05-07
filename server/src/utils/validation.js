import { validationResult } from 'express-validator';
import { ApiError } from './ApiError.js';

export const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(422, 'Validation failed', errors.array());
  }

  next();
};
