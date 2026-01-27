import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
            role: "USER" | "ADMIN" | "MODERATOR";
            ageVerified: boolean;
        };
    }

    interface User {
        id: string;
        email: string;
        name: string | null;
        role: "USER" | "ADMIN" | "MODERATOR";
        ageVerified: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "USER" | "ADMIN" | "MODERATOR";
        ageVerified: boolean;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    debug: true,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const userAgent = req?.headers?.['user-agent'] || 'unknown';
                console.log(`[NextAuth] Authorize attempt from: ${userAgent}, Email: ${credentials?.email}`);

                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials");
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user) {
                    console.log("User not found:", credentials.email);
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    console.log("Invalid password for user:", credentials.email);
                    return null;
                }

                console.log("User authenticated successfully:", user.id);
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    ageVerified: user.ageVerified,
                };
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.ageVerified = token.ageVerified;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.ageVerified = user.ageVerified;
            }

            if (trigger === "update" && session?.user) {
                token.ageVerified = session.user.ageVerified;
            }

            return token;
        }
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    }
};
