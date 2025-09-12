import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  
  session: { strategy: "jwt" },
  
  callbacks: {
    async signIn({ user, account }) {
      console.log('🚀 GOOGLE SIGNIN:', user.email, account?.provider)
      
      if (account?.provider === 'google' && user.email) {
        try {
          // Find or create user
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (!existingUser) {
            console.log('🎉 CREATING NEW USER:', user.email)
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || '',
                image: user.image || null,
              }
            })
            console.log('✅ USER CREATED SUCCESSFULLY')
          } else {
            console.log('👤 USER EXISTS:', user.email)
          }
          
          return true
        } catch (error) {
          console.error('❌ DATABASE ERROR:', error)
          return false
        }
      }
      
      return true
    },
    
    async jwt({ token, user }) {
      console.log('🔑 JWT:', { hasUser: !!user, email: token.email })
      
      if (user) {
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string }
          })
          if (dbUser) {
            token.sub = dbUser.id
          }
        } catch (error) {
          console.error('❌ JWT ERROR:', error)
        }
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      console.log('🔐 SESSION:', { hasUser: !!session.user, email: session.user?.email })
      return session
    }
  }
})
