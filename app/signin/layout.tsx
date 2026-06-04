import type React from "react"
import { noIndexMetadata } from "@/lib/seo"

export const metadata = noIndexMetadata

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children
}
