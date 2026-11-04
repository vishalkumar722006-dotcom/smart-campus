const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
};

const emailStyles = `
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
  .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 40px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; }
  .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
  .body { padding: 40px; }
  .otp-box { background: #f0f4ff; border: 2px dashed #4f46e5; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
  .otp-code { font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #4f46e5; font-family: monospace; }
  .footer { background: #f8fafc; padding: 24px 40px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
`;

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
    return { success: true };
  } catch (error) {
    console.error('Email error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendVerificationOTP = async (email, name, otp) => {
  const html = `<!DOCTYPE html><html><head><style>${emailStyles}</style></head><body>
    <div class="container">
      <div class="header"><h1>Smart Campus</h1><p>Email Verification</p></div>
      <div class="body">
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your email verification code is:</p>
        <div class="otp-box"><div class="otp-code">${otp}</div><p style="margin:8px 0 0;color:#64748b;font-size:13px;">Valid for 5 minutes</p></div>
        <p style="color:#64748b;font-size:13px;">Do not share this code with anyone.</p>
      </div>
      <div class="footer">© 2024 Smart Campus. University Resource Booking Portal.</div>
    </div></body></html>`;
  return sendEmail(email, 'Verify Your Email - Smart Campus', html);
};

const sendAdminOTP = async (email, name, otp) => {
  const html = `<!DOCTYPE html><html><head><style>${emailStyles}</style></head><body>
    <div class="container">
      <div class="header"><h1>Smart Campus Admin</h1><p>Two-Factor Authentication</p></div>
      <div class="body">
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your admin login verification code is:</p>
        <div class="otp-box"><div class="otp-code">${otp}</div><p style="margin:8px 0 0;color:#64748b;font-size:13px;">Valid for 5 minutes</p></div>
        <p style="color:#ef4444;font-size:13px;"><strong>If you did not request this, secure your account immediately.</strong></p>
      </div>
      <div class="footer">© 2024 Smart Campus. Admin Security.</div>
    </div></body></html>`;
  return sendEmail(email, 'Admin Login OTP - Smart Campus', html);
};

const sendPasswordResetOTP = async (email, name, otp) => {
  const html = `<!DOCTYPE html><html><head><style>${emailStyles}</style></head><body>
    <div class="container">
      <div class="header"><h1>Smart Campus</h1><p>Password Reset</p></div>
      <div class="body">
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your password reset code is:</p>
        <div class="otp-box"><div class="otp-code">${otp}</div><p style="margin:8px 0 0;color:#64748b;font-size:13px;">Valid for 5 minutes</p></div>
        <p style="color:#64748b;font-size:13px;">If you did not request this, ignore this email.</p>
      </div>
      <div class="footer">© 2024 Smart Campus.</div>
    </div></body></html>`;
  return sendEmail(email, 'Password Reset OTP - Smart Campus', html);
};

const sendBookingConfirmation = async (email, name, booking) => {
  const html = `<!DOCTYPE html><html><head><style>${emailStyles}</style></head><body>
    <div class="container">
      <div class="header"><h1>Booking Confirmed</h1><p>Smart Campus</p></div>
      <div class="body">
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your booking has been submitted:</p>
        <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
          <p><strong>Resource:</strong> ${booking.resourceName}</p>
          <p><strong>Date:</strong> ${booking.date}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Status:</strong> Pending Approval</p>
        </div>
        <p style="color:#64748b;font-size:13px;">You will be notified when your booking is approved.</p>
      </div>
      <div class="footer">© 2024 Smart Campus.</div>
    </div></body></html>`;
  return sendEmail(email, 'Booking Submitted - Smart Campus', html);
};

const sendBookingStatusUpdate = async (email, name, booking, status) => {
  const statusConfig = {
    approved: { icon: '✅', title: 'Booking Approved', color: '#22c55e', msg: 'Your booking has been approved. See you there!' },
    rejected: { icon: '❌', title: 'Booking Rejected', color: '#ef4444', msg: 'Unfortunately, your booking was not approved. Please contact admin for details.' },
    cancelled: { icon: '🚫', title: 'Booking Cancelled', color: '#94a3b8', msg: 'Your booking has been cancelled.' },
    completed: { icon: '🎓', title: 'Booking Completed', color: '#3b82f6', msg: 'Your booking session is complete. Thank you for using Smart Campus!' },
  };
  const cfg = statusConfig[status] || { icon: 'ℹ️', title: `Booking ${status}`, color: '#64748b', msg: '' };
  const html = `<!DOCTYPE html><html><head><style>${emailStyles}</style></head><body>
    <div class="container">
      <div class="header" style="background:linear-gradient(135deg,${cfg.color},${cfg.color}cc)">
        <h1>${cfg.icon} ${cfg.title}</h1><p>Smart Campus</p>
      </div>
      <div class="body">
        <p>Hello <strong>${name}</strong>,</p>
        <p>${cfg.msg}</p>
        <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
          <p><strong>Resource:</strong> ${booking.resourceName}</p>
          <p><strong>Date:</strong> ${booking.date}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Status:</strong> <span style="color:${cfg.color};font-weight:700;text-transform:capitalize;">${status}</span></p>
        </div>
      </div>
      <div class="footer">© 2024 Smart Campus.</div>
    </div></body></html>`;
  return sendEmail(email, `${cfg.title} - Smart Campus`, html);
};

module.exports = { sendVerificationOTP, sendAdminOTP, sendPasswordResetOTP, sendBookingConfirmation, sendBookingStatusUpdate };
