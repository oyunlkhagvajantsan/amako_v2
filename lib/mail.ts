import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

// Dynamic configuration for Gmail vs others
const mailConfig: SMTPTransport.Options = {
    // If it's Gmail, we use the 'service' shortcut for better reliability
    ...(process.env.SMTP_HOST?.includes("gmail")
        ? { service: "gmail" }
        : {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
        }
    ),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000,     // 60 seconds
    debug: true,
    logger: true,
};

// Console log config for Railway debugging (Masing password)
if (process.env.NODE_ENV !== "development") {
    console.log("[Mail Config] Initializing with Settings:", {
        service: (mailConfig as any).service || "manual",
        host: mailConfig.host || "gmail-internal",
        port: mailConfig.port || 465,
        user: process.env.SMTP_USER,
        hasPass: !!process.env.SMTP_PASS,
    });
}

const transporter = nodemailer.createTransport(mailConfig);

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

    console.log(`[Mail] Sending email to ${to}...`);
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
