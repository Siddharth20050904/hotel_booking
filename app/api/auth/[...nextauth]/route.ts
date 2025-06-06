import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        try {
          console.log("🔍 Attempting to authenticate user:", credentials.email)

          // Test database connection first
          await sql`SELECT 1 as test`
          console.log("✅ Database connection successful for auth")

          const users = await sql`
            SELECT * FROM users WHERE email = ${credentials.email}
          `

          if (users.length === 0) {
            console.log("❌ User not found:", credentials.email)
            return null
          }

          const user = users[0]

          // Check if user has a password (for credential-based login)
          if (!user.password) {
            console.log("❌ User has no password set:", credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log("❌ Invalid password for user:", credentials.email)
            return null
          }

          console.log("✅ User authenticated successfully:", credentials.email)

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            firstName: user.first_name,
            lastName: user.last_name,
          }
        } catch (error) {
          console.error("❌ Auth error:", error)
          // Return null instead of throwing to prevent 500 errors
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id
          token.firstName = user.firstName
          token.lastName = user.lastName
        }
        return token
      } catch (error) {
        console.error("❌ JWT callback error:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (token) {
          session.user.id = token.id as string
          session.user.firstName = token.firstName as string
          session.user.lastName = token.lastName as string
        }
        return session
      } catch (error) {
        console.error("❌ Session callback error:", error)
        return session
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error", // Add custom error page
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-key-change-in-production",
  debug: process.env.NODE_ENV === "development",
  // Add error handling
  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", code, metadata)
    },
    warn(code) {
      console.warn("NextAuth Warning:", code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log("NextAuth Debug:", code, metadata)
      }
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
