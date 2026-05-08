import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const REAL_SMTP_HOST = process.env.REAL_SMTP_HOST;
const REAL_SMTP_PORT = parseInt(process.env.REAL_SMTP_PORT || '587', 10);
const REAL_SMTP_USER = process.env.REAL_SMTP_USER;
const REAL_SMTP_PASS = process.env.REAL_SMTP_PASS;
const REAL_SENDER_ADDRESS = process.env.REAL_SENDER_ADDRESS || 'noreply@smartplate.com';
const MAILTRAP_USERNAME = process.env.MAILTRAP_USERNAME;
const MAILTRAP_PASSWORD = process.env.MAILTRAP_PASSWORD;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Nodemailer Real SMTP Transport
const realSmtpTransport = nodemailer.createTransport({
  host: REAL_SMTP_HOST,
  port: REAL_SMTP_PORT,
  secure: REAL_SMTP_PORT === 465,
  auth: {
    user: REAL_SMTP_USER,
    pass: REAL_SMTP_PASS,
  },
});

// Nodemailer Mailtrap Sandbox Transport
const mailtrapTransport = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: MAILTRAP_USERNAME,
    pass: MAILTRAP_PASSWORD,
  },
});

export const sendResetEmail = async (toEmail: string, code: string) => {
  const subject = 'Your SmartPlate Password Reset Code';
  const text = `Your password reset code is: ${code}\n\nThis code expires in 15 minutes.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #1B4332;">SmartPlate</h2>
      <p>You requested a password reset. Here is your 6-digit code:</p>
      <h1 style="background: #E8F8F0; padding: 15px; color: #1B4332; text-align: center; border-radius: 8px; letter-spacing: 2px;">
        ${code}
      </h1>
      <p>This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  // Tier 1: SendGrid
  if (SENDGRID_API_KEY) {
    try {
      console.log(`[MAILER] Attempting to send via SendGrid API to ${toEmail}`);
      await sgMail.send({
        to: toEmail,
        from: REAL_SENDER_ADDRESS,
        subject,
        text,
        html,
      });
      console.log('[MAILER] SendGrid success!');
      return;
    } catch (e: any) {
      console.error('[MAILER] SendGrid failed:', e.response?.body || e.message);
      console.log('[MAILER] Falling back to Tier 2 (Real SMTP)...');
    }
  }

  // Tier 2: Real SMTP (Gmail App Password)
  if (REAL_SMTP_USER && REAL_SMTP_PASS) {
    try {
      console.log(`[MAILER] Attempting to send via Real SMTP to ${toEmail}`);
      await realSmtpTransport.sendMail({
        from: \`SmartPlate <\${REAL_SENDER_ADDRESS}>\`,
        to: toEmail,
        subject,
        text,
        html,
      });
      console.log('[MAILER] Real SMTP success!');
      return;
    } catch (e: any) {
      console.error('[MAILER] Real SMTP failed:', e.message);
      console.log('[MAILER] Falling back to Tier 3 (Mailtrap Sandbox)...');
    }
  }

  // Tier 3: Mailtrap Sandbox
  if (MAILTRAP_USERNAME && MAILTRAP_PASSWORD) {
    try {
      console.log(`[MAILER] Attempting to send via Mailtrap Sandbox to ${toEmail}`);
      await mailtrapTransport.sendMail({
        from: \`SmartPlate <\${REAL_SENDER_ADDRESS}>\`,
        to: toEmail,
        subject,
        text,
        html,
      });
      console.log('[MAILER] Mailtrap Sandbox success!');
      return;
    } catch (e: any) {
      console.error('[MAILER] Mailtrap Sandbox failed:', e.message);
      throw new Error('All 3 email tiers failed. Could not deliver email.');
    }
  }

  console.warn('[MAILER] No email credentials configured. Dumping to console:');
  console.log(`\n\n[MOCK EMAIL] To: ${toEmail}\n[MOCK EMAIL] Subject: ${subject}\n[MOCK EMAIL] Your code is: ${code}\n\n`);
};
