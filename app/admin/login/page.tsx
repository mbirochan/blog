import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin"

export default async function AdminLoginPage() {
  const session = await auth()

  if (session?.user && isAdminEmail(session.user.email)) {
    redirect("/admin")
  }

  // If user is signed in but not admin, redirect to home page
  if (session?.user) {
    redirect("/")
  }

  // If not signed in, redirect to signin without admin callback
  redirect("/signin")
}
