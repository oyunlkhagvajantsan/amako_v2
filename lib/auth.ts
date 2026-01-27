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
                const host = req?.headers?.['host'] || 'unknown';
                console.log(`[NextAuth] Authorize attempt:
                    User-Agent: ${userAgent}
                    Host: ${host}
                    Email: ${credentials?.email}`);

                if (!credentials?.email || !credentials?.password) {
                    console.log("[NextAuth] Missing credentials");
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user) {
                    console.log(`[NextAuth] User not found: ${credentials.email}`);
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    console.log(`[NextAuth] Invalid password for: ${credentials.email}`);
                    return null;
                }

                console.log(`[NextAuth] Auth Success: ${user.id} (${user.role})`);
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
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    }
};
