import nodemailer from 'nodemailer';

// Use a global store so the OTP can be verified by verify-otp/route.ts
// In production, replace this with a persistent store (e.g. Redis or DB)
declare global {
  // eslint-disable-next-line no-var
  var otpStore: Map<string, { code: string; expires: number }>;
}

if (!global.otpStore) {
  global.otpStore = new Map();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      console.error("Email validation failed: Email is missing");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400 }
      );
    }

    if (!process.env.SENDGRID_API_KEY) {
      console.error("Environment variable missing: SENDGRID_API_KEY");
      return new Response(
        JSON.stringify({ error: "Email service configuration error" }),
        { status: 500 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP for ${email}: ${otp}`);

    // Store OTP temporarily (expires in 5 minutes)
    global.otpStore.set(email, { code: otp, expires: Date.now() + 5 * 60 * 1000 });

    console.log("Creating nodemailer transporter...");
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    console.log("Sending email...");
    await transporter.sendMail({
      to: email,
      from: `"Birochan Mainali" <mbirochan@gmail.com>`,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Your OTP Code</h1>
          <p style="font-size: 18px;">Your one-time password is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${otp}</strong>
          </div>
          <p style="color: #666;">This code will expire in 5 minutes.</p>
          <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    console.log("Email sent successfully");
    return Response.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return new Response(
      JSON.stringify({ 
        error: "Failed to send OTP",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500 }
    );
  }
} 