import { z } from 'zod';

export const registerSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits').regex(/^\d+$/, 'Mobile number must contain only digits'),
  dob: z.string().min(1, 'Date of birth is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  gender: z.enum(['male', 'female', 'other'], { message: 'Please select a valid gender' }),
  address: z.string().min(1, 'Address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  lockerPassword: z.string().min(8, 'Locker password must be at least 8 characters'),
});

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});


export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});



export const lockerAccessSchema = z.object({
  password: z.string().min(8, 'Locker password must be at least 8 characters'),
});

export const reviewSchema = z.object({
  reviewText: z.string().min(10, 'Review must be at least 10 characters').max(500, 'Review must not exceed 500 characters'),
});
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type LockerAccessFormData = z.infer<typeof lockerAccessSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;