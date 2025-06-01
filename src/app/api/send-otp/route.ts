import { NextResponse } from 'next/server';
import { sendOtpAction } from '@/app/actions/authActions';

export async function POST(req: Request) {
  const { email } = await req.json();
  const result = await sendOtpAction(email);
  return NextResponse.json(result);
}
