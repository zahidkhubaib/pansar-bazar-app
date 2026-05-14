import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendContactSubmissionEmail } from '../utils/emailService.js';

export const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone = '', subject = 'Website enquiry', message } = req.body;

  try {
    await sendContactSubmissionEmail({
      name,
      email,
      phone,
      subject,
      message,
    });
  } catch {
    throw new ApiError(503, 'Could not send your message right now. Please try again later.');
  }

  res.status(202).json({ message: 'Message sent successfully' });
});
