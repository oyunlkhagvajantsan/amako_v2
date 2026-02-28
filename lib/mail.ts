import nodemailer from "nodemailer";

// Create a singleton transporter for better performance (pooling)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
});

interface SendEmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

/**
 * Send a standardized email with improved error logging for production debugging
 */
export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
    const from = process.env.SMTP_FROM || '"Amako" <noreply@amako.mn>';

    try {
        const info = await transporter.sendMail({
            from,
            to,
            subject,
            text,
            html,
        });

        if (process.env.NODE_ENV === "development") {
            console.log(`[Mail] Email sent to ${to}: ${info.messageId}`);
        }

        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        // Detailed error logging for production (Railway)
        console.error(`[Mail Error] Detailed failure for ${to}:`, {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            stack: error.stack
        });

        return { success: false, error: error.message };
    }
}
