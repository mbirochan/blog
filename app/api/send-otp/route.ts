import nodemailer from "nodemailer"
import { supabaseAdmin } from "@/lib/supabase-admin"

const gmailUser = process.env.GMAIL_USER
const gmailPassword = process.env.GMAIL_APP_PASSWORD

// In-memory rate limiter: max 3 OTP requests per email per 5 minutes
const RATE_LIMIT_WINDOW = 5 * 60_000
const RATE_LIMIT_MAX = 3
const otpAttempts = new Map<string, number[]>()

function isRateLimited(email: string): boolean {
  const now = Date.now()
  const timestamps = (otpAttempts.get(email) || []).filter((t) => now - t < RATE_LIMIT_WINDOW)
  if (timestamps.length >= RATE_LIMIT_MAX) {
    otpAttempts.set(email, timestamps)
    return true
  }
  timestamps.push(now)
  otpAttempts.set(email, timestamps)
  return false
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rawEmail = typeof body.email === "string" ? body.email : ""
    const email = rawEmail.trim().toLowerCase()

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 })
    }

    if (isRateLimited(email)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a few minutes before trying again." }),
        { status: 429 },
      )
    }

    if (!gmailUser || !gmailPassword) {
      console.error("Missing Gmail SMTP credentials")
      return new Response(JSON.stringify({ error: "Email service configuration error" }), { status: 500 })
    }

    if (!supabaseAdmin) {
      console.error("Supabase admin client is not configured")
      return new Response(JSON.stringify({ error: "Database not available" }), { status: 500 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const { error: dbError } = await supabaseAdmin
      .from("auth_email_otps")
      .upsert({
        email,
        code: otp,
        expires_at: new Date(Date.now() + 5 * 60_000),
      })

    if (dbError) {
      console.error("Error storing OTP:", dbError)
      return new Response(JSON.stringify({ error: "Failed to store OTP" }), { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    })

    await transporter.sendMail({
      to: email,
      from: `"Sign-in" <${gmailUser}>`,
      subject: "Your sign-in code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; margin-bottom: 8px;">Your sign-in code</h1>
          <p style="font-size: 16px; margin: 0;">Use this one-time code to sign in:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; letter-spacing: 6px; margin: 16px 0; font-weight: bold;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 14px; margin: 0 0 8px 0;">This code expires in 5 minutes.</p>
          <p style="color: #666; font-size: 14px; margin: 0;">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    })

    return Response.json({ message: "OTP sent successfully. Please also check your spam folder." })
  } catch (error) {
    console.error("SEND OTP ERROR:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to send OTP",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    )
  }
}
