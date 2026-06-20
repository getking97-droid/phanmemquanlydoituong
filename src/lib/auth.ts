import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Authorize called with email:", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null
        }
        
        try {
          let user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })
          
          console.log("User found:", user ? "YES" : "NO");

          if (!user) {
            console.log("Creating new user...");
            const hashedPassword = await bcrypt.hash(credentials.password, 10)
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                password: hashedPassword,
                name: "Admin User",
                role: "ADMIN"
              }
            })
            console.log("User created successfully");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log("Is password valid?", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        const u = session.user as { role?: string; id?: string; name?: string | null; email?: string | null; image?: string | null }
        u.role = token.role as string
        u.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
}
