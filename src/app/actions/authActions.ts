"use server";

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(email: string, otp: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'FaceLocker Account Activation OTP',
      text: `Your OTP is: ${otp}. Expires in 5 minutes.`,
      html: `<p>Your OTP is: <strong>${otp}</strong>. Expires in 5 minutes.</p>`,
    });
    console.log(`Email sent to ${email} with OTP: ${otp}`);
  } catch (error: any) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send email. Please check your email address.');
  }
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpAction(email: string) {
  try {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 300 * 1000);
    const otpDoc = doc(db, 'otps', email);
    console.log('Attempting to store OTP for:', email);
    await setDoc(otpDoc, {
      otp,
      email,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });
    console.log('OTP stored for:', email, 'OTP:', otp);
    await sendEmail(email, otp);
    return {
      success: true,
      message: `OTP sent to ${email}`,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error: any) {
    console.error('Error sending OTP:', error.message, error.code);
    return {
      success: false,
      message: error.message || 'Failed to send OTP',
    };
  }
}

export async function verifyOtpAction(email: string, otp: string) {
  try {
    const otpDoc = doc(db, 'otps', email);
    console.log('Attempting to read OTP for:', email);
    const docSnap = await getDoc(otpDoc);
    console.log('OTP doc exists:', docSnap.exists());
    if (!docSnap.exists()) {
      console.log('No OTP found for:', email);
      return { success: false, message: 'Invalid or expired OTP' };
    }
    const data = docSnap.data();
    const storedOtp = data.otp;
    const expiresAt = new Date(data.expiresAt);
    if (new Date() > expiresAt) {
      console.log('OTP expired for:', email);
      return { success: false, message: 'OTP has expired' };
    }
    if (storedOtp !== otp) {
      console.log('Invalid OTP for:', email);
      return { success: false, message: 'Invalid OTP' };
    }
    console.log('OTP verified for:', email);
    return { success: true, message: 'OTP verified successfully' };
  } catch (error: any) {
    console.error('Error verifying OTP:', error.message, error.code);
    return {
      success: false,
      message: error.message || 'Failed to verify OTP',
    };
  }
}
