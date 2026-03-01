import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

/**
 * Send a standardized email via Resend HTTP API.
 * Using Resend instead of SMTP because Railway blocks all outbound
 * SMTP connections (ports 465 & 587) at the network level.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
    const from = process.env.SMTP_FROM || '"Amako" <noreply@amako.mn>';

    console.log(`[Mail] Sending email to ${to} via Resend...`);

    const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        text,
        html,
    });

    if (error) {
        console.error(`[Mail Error] Resend failed for ${to}:`, {
            name: error.name,
            message: error.message,
        });
        return { success: false, error: error.message };
    }

    console.log(`[Mail] Email sent to ${to}: ${data?.id}`);
    return { success: true, messageId: data?.id };
}
