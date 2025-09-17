import { supabaseAdmin } from "./supabase-admin"

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

const adminEmailSet = new Set(adminEmails)

export const ADMIN_SUPABASE_USER_ID =
  process.env.ADMIN_SUPABASE_USER_ID || "d0630843-57ef-4ec1-bee0-407efd99aff1"

export function getAdminEmails() {
  return Array.from(adminEmailSet)
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false
  return adminEmailSet.has(email.trim().toLowerCase())
}

export async function syncUserRole(userId: string, email?: string | null, name?: string | null) {
  if (!supabaseAdmin || !userId || !email) {
    return
  }

  const normalizedEmail = email.trim().toLowerCase()
  const displayName = name?.trim() || normalizedEmail
  const role = isAdminEmail(normalizedEmail) ? "admin" : "user"

  try {
    await supabaseAdmin
      .from("users")
      .upsert(
        {
          id: userId,
          email: normalizedEmail,
          name: displayName,
          email_verified: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

    await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: normalizedEmail,
          name: displayName,
          role,
        },
        { onConflict: "id" },
      )
  } catch (error) {
    console.error("Failed to sync user role", error)
  }
}
