import nodemailer from 'nodemailer';
import {
  adminOrderNotificationTemplate,
  contactSubmissionTemplate,
  orderConfirmationTemplate,
  welcomeEmailTemplate,
} from './emailTemplates.js';

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn('Email skipped: SMTP credentials are not configured.');
    return { skipped: true };
  }

  const from = process.env.EMAIL_FROM;

  if (!from) {
    console.warn('Email skipped: EMAIL_FROM is not configured.');
    return { skipped: true };
  }

  try {
    const info = await mailer.sendMail({
      from,
      to,
      subject,
      html,
      text,
      replyTo,
    });

    return { messageId: info.messageId };
  } catch (error) {
    console.error('Email delivery failed:', error.message);
    throw error;
  }
};

export const sendWelcomeEmail = async (user) =>
  sendEmail({
    to: user.email,
    subject: `Welcome to ${process.env.EMAIL_BRAND_NAME || 'Pansar Bazar'}`,
    html: welcomeEmailTemplate({ user }),
    text: `Welcome to ${process.env.EMAIL_BRAND_NAME || 'Pansar Bazar'}, ${user.name}.`,
  });

export const sendOrderConfirmationEmail = async ({ order, user }) =>
  sendEmail({
    to: user.email,
    subject: `Order confirmation #${order._id}`,
    html: orderConfirmationTemplate({ order, user }),
    text: `Your order #${order._id} has been received. Total: PKR ${order.total}.`,
  });

export const sendAdminOrderNotificationEmail = async ({ order, user }) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;

  return sendEmail({
    to: adminEmail,
    subject: `New Pansar Bazar order #${order._id}`,
    html: adminOrderNotificationTemplate({ order, user }),
    text: `New order #${order._id} from ${user.name}. Total: PKR ${order.total}.`,
  });
};

export const sendContactSubmissionEmail = async (payload) => {
  const adminEmail = process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;

  return sendEmail({
    to: adminEmail,
    subject: `Contact form: ${payload.subject}`,
    html: contactSubmissionTemplate(payload),
    text: `${payload.name} (${payload.email}) wrote:\n\n${payload.message}`,
    replyTo: payload.email,
  });
};

export const safelySendEmail = async (emailTask) => {
  try {
    return await emailTask();
  } catch (error) {
    console.error('Non-blocking email task failed:', error.message);
    return { error: error.message };
  }
};
