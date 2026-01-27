import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
    NEXTAUTH_SECRET: z.string().min(1),
    ADMIN_DOMAIN: z.string().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("❌ Invalid environment variables:", _env.error.format());
    // In production, we might want to throw an error
    // throw new Error("Invalid environment variables");
}

export const env = _env.success ? _env.data : process.env as any;
