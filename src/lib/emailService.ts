import nodemailer from 'nodemailer';

interface EmailContent {
  to: string;
  subject: string;
  html: string;
}

export const sendCustomEmail = async (emailContent: EmailContent): Promise<void> => {
  try {
    // Configure Nodemailer transport (replace with your SMTP settings)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'your-email@example.com',
        pass: process.env.SMTP_PASS || 'your-password',
      },
    });

    // Send email
    await transporter.sendMail({
      from: '"Item Retriever" <your-email@example.com>',
      to: emailContent.to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log(`Email sent to ${emailContent.to}`);
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
};