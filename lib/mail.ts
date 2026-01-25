import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface SendEmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

/**
 * Send a standardized email
 */
export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Amako" <noreply@amako.mn>',
            to,
            subject,
            text,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error(`[Mail] Error sending email to ${to}:`, error);
        return { success: false, error };
    }
}
