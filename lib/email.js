import prisma from '@/lib/prisma';

/**
 * Send an email using the Resend REST API.
 * Works on Cloudflare Edge Runtime (no Node.js dependencies).
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 */
export async function sendEmail({ to, subject, html }) {
    // Get email config from SiteSetting
    let apiKey = null;
    let senderEmail = 'noreply@aethelperfumes.com';
    let senderName = 'AETHEL PARFUMS';

    try {
        const settings = await prisma.siteSetting.findMany({
            where: {
                key: { in: ['resend_api_key', 'smtp_sender_email', 'smtp_sender_name'] }
            }
        });

        for (const s of settings) {
            if (s.key === 'resend_api_key') apiKey = s.value;
            if (s.key === 'smtp_sender_email') senderEmail = s.value;
            if (s.key === 'smtp_sender_name') senderName = s.value;
        }
    } catch (err) {
        console.error('Failed to load email settings:', err);
    }

    // Fallback to env var
    if (!apiKey) {
        apiKey = typeof process !== 'undefined' ? process.env.RESEND_API_KEY : null;
    }

    if (!apiKey) {
        console.error('No Resend API key configured. Set it in Admin Dashboard > Settings or as RESEND_API_KEY env var.');
        throw new Error('Email service not configured. Please set up the Resend API key in Admin Settings.');
    }

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: `${senderName} <${senderEmail}>`,
            to: [to],
            subject,
            html,
        }),
    });

    if (!res.ok) {
        const errBody = await res.text();
        console.error('Resend API error:', res.status, errBody);
        throw new Error(`Failed to send email: ${res.status}`);
    }

    return await res.json();
}

/**
 * Send a branded password reset email with OTP code.
 */
export async function sendPasswordResetEmail(toEmail, otpCode) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background: linear-gradient(145deg, #1a1a1a, #111111); border: 1px solid rgba(201, 169, 110, 0.3); border-radius: 12px; overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(201, 169, 110, 0.15);">
                                <h1 style="font-family: Georgia, 'Times New Roman', serif; color: #c9a96e; font-size: 28px; letter-spacing: 6px; margin: 0; font-weight: 400;">AETHEL</h1>
                                <p style="color: #888; font-size: 10px; letter-spacing: 4px; margin: 8px 0 0; text-transform: uppercase;">PARFUMS</p>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="color: #ffffff; font-family: Georgia, serif; font-size: 22px; font-weight: 400; margin: 0 0 15px; text-align: center;">Password Reset</h2>
                                <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 0 0 30px; text-align: center;">
                                    Use the verification code below to reset your password. This code expires in 15 minutes.
                                </p>
                                <!-- OTP Code -->
                                <div style="background: rgba(201, 169, 110, 0.08); border: 2px solid rgba(201, 169, 110, 0.3); border-radius: 8px; padding: 25px; text-align: center; margin: 0 0 30px;">
                                    <p style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 12px;">Verification Code</p>
                                    <p style="color: #c9a96e; font-size: 36px; font-weight: 700; letter-spacing: 12px; margin: 0; font-family: 'Courier New', monospace;">${otpCode}</p>
                                </div>
                                <p style="color: #666; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                                    If you did not request a password reset, please ignore this email. Your account remains secure.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 40px; border-top: 1px solid rgba(201, 169, 110, 0.1); text-align: center;">
                                <p style="color: #555; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} AETHEL PARFUMS. All rights reserved.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    return sendEmail({
        to: toEmail,
        subject: 'AETHEL PARFUMS — Password Reset Code',
        html,
    });
}
