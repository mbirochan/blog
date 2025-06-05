import { signIn } from 'next-auth/react';

// This needs to be the same instance as in send-otp/route.ts
// In production, use Redis or DB instead
declare global {
  var otpStore: Map<string, { code: string; expires: number }>;
}

if (!global.otpStore) {
  global.otpStore = new Map();
}

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    const entry = global.otpStore.get(email);

    if (!entry || entry.code !== otp || Date.now() > entry.expires) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        { status: 400 }
      );
    }

    // Clear the OTP after successful verification
    global.otpStore.delete(email);

    // Here you would typically create a session or token
    // For now, we'll just return success
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to verify OTP' }),
      { status: 500 }
    );
  }
} 