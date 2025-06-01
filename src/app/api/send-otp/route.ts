import { NextResponse } from 'next/server';
import { sendOtpAction } from '@/app/auth/authAction';

export async function POST(req: Request) {
  const { email } = await req.json();
  const result = await sendOtpAction(email);
  return NextResponse.json(result);
}
