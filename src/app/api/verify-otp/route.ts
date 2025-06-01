import { NextResponse } from 'next/server';
import { verifyOtpAction } from '@/app/auth/authAction';

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  const result = await verifyOtpAction(email, otp);
  return NextResponse.json(result);
}
