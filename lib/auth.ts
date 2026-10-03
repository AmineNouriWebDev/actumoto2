import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) return null;

        if (user.role === "CLIENT" && !user.emailVerified) {
          throw new Error("Email non vérifié. Veuillez vérifier votre adresse email pour activer votre compte.");
        }

        if (user.role === "ADMIN") {
          const otp = credentials.otp as string;
          if (!otp) {
            throw new Error("OTP_REQUIRED");
          }

          const verificationToken = await prisma.verificationToken.findFirst({
            where: {
              identifier: `admin-otp:${email}`,
              token: otp,
              expires: { gt: new Date() }
            }
          });

          if (!verificationToken) {
            throw new Error("Code incorrect ou expiré.");
          }

          // Delete token after successful use
          await prisma.verificationToken.deleteMany({
            where: {
              identifier: `admin-otp:${email}`,
              token: otp
            }
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          role: user.role, // Inject role here
        } as any;
      },
    }),
  ],
});
