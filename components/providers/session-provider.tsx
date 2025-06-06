"use client"

import type React from "react"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
