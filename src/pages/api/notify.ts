// src/pages/api/notify.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API: Received request to /api/notify', { method: req.method });

  if (req.method !== 'POST') {
    console.error('API: Invalid method:', req.method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, imageDataUrl } = req.body;

  if (!email || !imageDataUrl) {
    console.error('API: Missing required fields:', { email, imageDataUrl });
    return res.status(400).json({ message: 'Missing required fields: email and imageDataUrl' });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('API: Missing SMTP environment variables');
    return res.status(500).json({ message: 'Server configuration error: Missing SMTP credentials' });
  }

  // Validate and extract base64 data
  const base64Match = imageDataUrl.match(/^data:image\/jpeg;base64,(.+)$/);
  if (!base64Match) {
    console.error('API: Invalid imageDataUrl format');
    return res.status(400).json({ message: 'Invalid image data format' });
  }
  const base64Data = base64Match[1];

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"FaceLocker Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Unauthorized Locker Access Attempt',
      html: `
        <p>Dear User,</p>
        <p>An unauthorized attempt was made to access your FaceLocker at ${new Date().toLocaleString()}.</p>
        <p><img src="cid:image1" alt="Unauthorized Attempt" style="max-width: 300px;" /></p>
        <p>If images are not displayed, please enable images in your email client or check your dashboard.</p>
        <p>Please review this attempt in your dashboard.</p>
        <p>Best regards,<br>FaceLocker Team</p>
      `,
      attachments: [
        {
          filename: 'intruder.jpg',
          content: Buffer.from(base64Data, 'base64'),
          contentType: 'image/jpeg',
          cid: 'image1', // Referenced in HTML <img src="cid:image1">
        },
      ],
    });
    console.log(`API: Intruder alert email sent to ${email}`);
    res.status(200).json({ success: true, message: 'Notification sent' });
  } catch (error: any) {
    console.error('API: Error sending email:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({ message: 'Failed to send notification', error: error.message });
  }
}
