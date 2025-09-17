import nodemailer from "nodemailer"
import { isAdminEmail } from "@/lib/admin"
import { supabase } from "@/lib/supabase"

const gmailUser = process.env.GMAIL_USER
const gmailPassword = process.env.GMAIL_APP_PASSWORD

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rawEmail = typeof body.email === "string" ? body.email : ""
    const email = rawEmail.trim().toLowerCase()

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 })
    }

    if (!isAdminEmail(email)) {
      return new Response(JSON.stringify({ error: "Email not authorized" }), { status: 403 })
    }

    if (!gmailUser || !gmailPassword) {
      console.error("Missing Gmail SMTP credentials")
      return new Response(JSON.stringify({ error: "Email service configuration error" }), { status: 500 })
    }

    if (!supabase) {
      console.error("Supabase client is not configured")
      return new Response(JSON.stringify({ error: "Database not available" }), { status: 500 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`Generated OTP for ${email}: ${otp}`)

    const { error: dbError } = await supabase
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
      from: `"Birochan Mainali" <${gmailUser}>`,
      subject: "Your OTP Code for Logging into Birochan Mainali's Blog site",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Your OTP Code for Logging into Birochan Mainali's Blog site is:</h1>
          <p style="font-size: 18px;">Your one-time password is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
            <strong>${otp}</strong>
          </div>
          <p style="color: #666;">This code will expire in 5 minutes.</p>
          <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
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
