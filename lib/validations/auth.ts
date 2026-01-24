import { z } from "zod";

export const passwordSchema = z.string()
    .min(8, "Нууц үг дор хаяж 8 тэмдэгттэй байх ёстой")
    .regex(/[A-Z]/, "Дор хаяж нэг том үсэг орсон байх ёстой")
    .regex(/[a-z]/, "Дор хаяж нэг жижиг үсэг орсон байх ёстой")
    .regex(/[0-9]/, "Дор хаяж нэг тоо орсон байх ёстой")
    .regex(/[^A-Za-z0-9]/, "Дор хаяж нэг тусгай тэмдэгт орсон байх ёстой");

export const registerSchema = z.object({
    name: z.string().min(2, "Нэр дор хаяж 2 тэмдэгттэй байх ёстой").max(50),
    email: z.string().email("Имэйл хаяг буруу байна"),
    password: passwordSchema,
});

export const loginSchema = z.object({
    email: z.string().email("Имэйл хаяг буруу байна"),
    password: z.string().min(1, "Нууц үг оруулна уу"),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Одоогийн нууц үгээ оруулна уу"),
    newPassword: passwordSchema,
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token required"),
    password: passwordSchema,
});
