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
            username: string;
            image?: string;
            role: "USER" | "ADMIN" | "MODERATOR";
            ageVerified: boolean;
        };
    }

    interface User {
        id: string;
        email: string;
        username: string;
        role: "USER" | "ADMIN" | "MODERATOR";
        ageVerified: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        role: "USER" | "ADMIN" | "MODERATOR";
        ageVerified: boolean;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma as any),
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
        updateAge: 60 * 60, // 1 hour
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
                identifier: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const userAgent = req?.headers?.['user-agent'] || 'unknown';
                const host = req?.headers?.['host'] || 'unknown';
                console.log(`[NextAuth] Authorize attempt:
                    Identifier: '${credentials?.identifier}' (len: ${credentials?.identifier?.length})
                    Password len: ${credentials?.password?.length}
                    Password first/last chars: ${credentials?.password?.charCodeAt(0)}/${credentials?.password?.charCodeAt(credentials.password.length - 1)}
                `);

                if (!credentials?.identifier || !credentials?.password) {
                    console.log("[NextAuth] Missing credentials");
                    return null;
                }

                // Check for email or username
                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    }
                });

                if (!user) {
                    console.log(`[NextAuth] User not found: ${credentials.identifier}`);
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    console.log(`[NextAuth] Invalid password for: ${credentials.identifier}`);
                    return null;
                }

                console.log(`[NextAuth] Auth Success: ${user.id} (${user.role})`);
                return {
                    id: user.id,
                    email: user.email,
                    username: user.username,
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
                session.user.username = token.username;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.ageVerified = user.ageVerified;
                token.username = user.username;
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
