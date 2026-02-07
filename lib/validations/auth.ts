import { z } from "zod";

export const passwordSchema = z.string()
    .min(6, "Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой")
    .regex(/[A-Z]/, "Дор хаяж нэг том үсэг орсон байх ёстой")
    .regex(/[a-z]/, "Дор хаяж нэг жижиг үсэг орсон байх ёстой")
    .regex(/[0-9]/, "Дор хаяж нэг тоо орсон байх ёстой");

export const registerSchema = z.object({
    username: z.string().min(3, "Хэрэглэгчийн нэр дор хаяж 3 тэмдэгттэй байх ёстой").max(20).regex(/^[a-zA-Z0-9_]+$/, "Хэрэглэгчийн нэр зөвхөн латин үсэг, тоо болон доогуур зураас агуулж болно"),
    email: z.string().email("Имэйл хаяг буруу байна"),
    password: passwordSchema,
});

export const loginSchema = z.object({
    identifier: z.string().min(1, "Имэйл эсвэл хэрэглэгчийн нэрээ оруулна уу"),
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
