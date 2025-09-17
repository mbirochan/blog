import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin"

export default async function AdminLoginPage() {
  const session = await auth()

  if (session?.user && isAdminEmail(session.user.email)) {
    redirect("/admin")
  }

  redirect("/signin?callbackUrl=/admin")
}
