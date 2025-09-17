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
    console.error("Missing required parameters for syncUserRole:", { userId, email, supabaseAdmin: !!supabaseAdmin })
    return
  }

  const normalizedEmail = email.trim().toLowerCase()
  const displayName = name?.trim() || normalizedEmail
  const role = isAdminEmail(normalizedEmail) ? "admin" : "user"

  try {
    // First, ensure the user exists in the users table
    const { error: userError } = await supabaseAdmin
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

    if (userError) {
      console.error("Failed to upsert user:", userError)
      throw userError
    }

    // Then, ensure the profile exists in the profiles table
    const { error: profileError } = await supabaseAdmin
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

    if (profileError) {
      console.error("Failed to upsert profile:", profileError)
      throw profileError
    }

    console.log("Successfully synced user role:", { userId, email: normalizedEmail, role })
  } catch (error) {
    console.error("Failed to sync user role:", error)
    throw error // Re-throw to let the caller handle it
  }
}

export async function ensureUserProfile(userId: string, email?: string | null, name?: string | null) {
  if (!supabaseAdmin || !userId || !email) {
    return false
  }

  try {
    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (existingProfile) {
      return true // Profile already exists
    }

    // Profile doesn't exist, create it
    await syncUserRole(userId, email, name)
    return true
  } catch (error) {
    console.error("Failed to ensure user profile:", error)
    return false
  }
}
