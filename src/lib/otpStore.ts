// For a real application, use a proper database or a distributed cache like Redis.
// This is a simple in-memory store for simulation purposes.

interface OtpEntry {
  otp: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpEntry>();
const OTP_EXPIRY_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function setOtp(email: string, otp: string): void {
  const expiresAt = Date.now() + OTP_EXPIRY_DURATION_MS;
  otpStore.set(email, { otp, expiresAt });
  console.log(`OTP for ${email} stored: ${otp}, expires at ${new Date(expiresAt).toLocaleTimeString()}`);
}

export function getOtp(email: string): string | null {
  const entry = otpStore.get(email);
  if (!entry) {
    console.log(`No OTP found for ${email}`);
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    console.log(`OTP for ${email} has expired.`);
    otpStore.delete(email);
    return null;
  }
  console.log(`OTP for ${email} retrieved: ${entry.otp}`);
  return entry.otp;
}

export function clearOtp(email: string): void {
  otpStore.delete(email);
  console.log(`OTP for ${email} cleared.`);
}

// Periodically clean up expired OTPs (optional, good practice)
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of otpStore.entries()) {
    if (now > entry.expiresAt) {
      otpStore.delete(email);
      console.log(`Expired OTP for ${email} cleaned up.`);
    }
  }
}, 60 * 1000); // Check every minute
