import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    ageVerified: (user as any).ageVerified,
                };
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            console.log("Session Callback - Token:", {
                id: token.id,
                role: token.role,
                ageVerified: token.ageVerified
            });

            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as "USER" | "ADMIN" | "MODERATOR";
                session.user.ageVerified = token.ageVerified as boolean;
            }

            console.log("Session Callback - Result:", {
                id: session.user?.id,
                ageVerified: session.user?.ageVerified
            });

            return session;
        },
        async jwt({ token, user, trigger, session }) {
            console.log("JWT Callback - Start:", {
                trigger,
                hasUser: !!user,
                tokenAgeVerified: token.ageVerified
            });

            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.ageVerified = user.ageVerified;
                console.log("JWT Callback - User attached:", { ageVerified: user.ageVerified });
            }

            // Handle session update
            if (trigger === "update" && session?.user) {
                token.ageVerified = session.user.ageVerified;
                console.log("JWT Callback - Update trigger:", { ageVerified: token.ageVerified });
            }

            return token;
        }
    }
};
