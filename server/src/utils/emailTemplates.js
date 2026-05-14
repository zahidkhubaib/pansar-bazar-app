const brand = {
  name: process.env.EMAIL_BRAND_NAME || 'Pansar Bazar',
  url: process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173',
  supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || '',
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const money = (amount) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const layout = ({ title, previewText, content }) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f5f7f4;font-family:Arial,Helvetica,sans-serif;color:#1f2a24;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(previewText)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f4;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8df;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:#21412f;color:#ffffff;padding:24px 28px;">
                <div style="font-size:22px;font-weight:700;letter-spacing:.2px;">${escapeHtml(brand.name)}</div>
                <div style="font-size:13px;color:#dce8df;margin-top:4px;">Fresh herbs, pansari essentials, and wellness products</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="background:#f0f4ef;color:#607065;font-size:12px;line-height:1.6;padding:18px 28px;">
                You are receiving this email from ${escapeHtml(brand.name)}.
                ${brand.supportEmail ? `For support, contact <a href="mailto:${escapeHtml(brand.supportEmail)}" style="color:#21412f;">${escapeHtml(brand.supportEmail)}</a>.` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const button = (label, href) => `
  <a href="${escapeHtml(href)}" style="display:inline-block;background:#2f6b45;color:#ffffff;text-decoration:none;border-radius:8px;padding:12px 18px;font-weight:700;font-size:14px;">
    ${escapeHtml(label)}
  </a>`;

const orderRows = (items = []) =>
  items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #edf1eb;">
            <div style="font-weight:700;color:#213126;">${escapeHtml(item.name)}</div>
            <div style="font-size:13px;color:#66756a;">${escapeHtml(item.quantity)} x ${escapeHtml(item.unit)}</div>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #edf1eb;font-weight:700;color:#213126;">
            ${money(item.price * item.quantity)}
          </td>
        </tr>`,
    )
    .join('');

export const welcomeEmailTemplate = ({ user }) =>
  layout({
    title: `Welcome to ${brand.name}`,
    previewText: `Welcome to ${brand.name}, ${user.name}.`,
    content: `
      <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;color:#1f2a24;">Welcome, ${escapeHtml(user.name)}.</h1>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#425048;">
        Your ${escapeHtml(brand.name)} account is ready. You can now save addresses, place orders, and track your purchases from your profile.
      </p>
      ${button('Start Shopping', brand.url)}
    `,
  });

export const orderConfirmationTemplate = ({ order, user }) =>
  layout({
    title: `Order confirmation #${order._id}`,
    previewText: `We received your ${brand.name} order for ${money(order.total)}.`,
    content: `
      <h1 style="margin:0 0 10px;font-size:24px;line-height:1.3;color:#1f2a24;">Thanks for your order, ${escapeHtml(user.name)}.</h1>
      <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#425048;">
        We received order <strong>#${escapeHtml(order._id)}</strong> and will contact you before dispatch if anything needs confirmation.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
        ${orderRows(order.items)}
        <tr>
          <td style="padding:16px 0 0;font-size:16px;font-weight:700;">Total</td>
          <td align="right" style="padding:16px 0 0;font-size:18px;font-weight:800;color:#21412f;">${money(order.total)}</td>
        </tr>
      </table>
      <div style="background:#f7faf6;border:1px solid #e3ebe0;border-radius:10px;padding:14px;margin-top:18px;">
        <div style="font-weight:700;margin-bottom:6px;">Delivery address</div>
        <div style="font-size:14px;line-height:1.6;color:#425048;">
          ${escapeHtml(order.address.name)}<br>
          ${escapeHtml(order.address.phone)}<br>
          ${escapeHtml(order.address.line1)}, ${escapeHtml(order.address.city)}
        </div>
      </div>
    `,
  });

export const adminOrderNotificationTemplate = ({ order, user }) =>
  layout({
    title: `New order #${order._id}`,
    previewText: `New order from ${user.name} worth ${money(order.total)}.`,
    content: `
      <h1 style="margin:0 0 10px;font-size:24px;line-height:1.3;color:#1f2a24;">New order received</h1>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#425048;">
        <strong>${escapeHtml(user.name)}</strong> placed order <strong>#${escapeHtml(order._id)}</strong>.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${orderRows(order.items)}
        <tr>
          <td style="padding:16px 0 0;font-size:16px;font-weight:700;">Order total</td>
          <td align="right" style="padding:16px 0 0;font-size:18px;font-weight:800;color:#21412f;">${money(order.total)}</td>
        </tr>
      </table>
      <div style="background:#f7faf6;border:1px solid #e3ebe0;border-radius:10px;padding:14px;margin-top:18px;font-size:14px;line-height:1.7;color:#425048;">
        <strong>Customer:</strong> ${escapeHtml(user.email)}<br>
        <strong>Phone:</strong> ${escapeHtml(order.address.phone)}<br>
        <strong>Address:</strong> ${escapeHtml(order.address.line1)}, ${escapeHtml(order.address.city)}
      </div>
    `,
  });

export const contactSubmissionTemplate = ({ name, email, phone, subject, message }) =>
  layout({
    title: `Contact form: ${subject}`,
    previewText: `${name} sent a contact form submission.`,
    content: `
      <h1 style="margin:0 0 10px;font-size:24px;line-height:1.3;color:#1f2a24;">New contact message</h1>
      <div style="background:#f7faf6;border:1px solid #e3ebe0;border-radius:10px;padding:14px;margin:18px 0;font-size:14px;line-height:1.7;color:#425048;">
        <strong>Name:</strong> ${escapeHtml(name)}<br>
        <strong>Email:</strong> ${escapeHtml(email)}<br>
        ${phone ? `<strong>Phone:</strong> ${escapeHtml(phone)}<br>` : ''}
        <strong>Subject:</strong> ${escapeHtml(subject)}
      </div>
      <p style="white-space:pre-wrap;margin:0;font-size:15px;line-height:1.7;color:#425048;">${escapeHtml(message)}</p>
    `,
  });
