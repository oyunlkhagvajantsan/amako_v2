import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "USER" | "ADMIN" | "MODERATOR";
            ageVerified: boolean;
        } & DefaultSession["user"]
    }

    interface User {
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
