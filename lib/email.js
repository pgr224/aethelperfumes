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
 * Send a branded password reset email with a clickable link and OTP code.
 * @param {string} toEmail - Recipient email
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} resetUrl - Full password reset URL with token
 */
export async function sendPasswordResetEmail(toEmail, otpCode, resetUrl) {
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
                                    Click the button below to reset your password. This link expires in 15 minutes.
                                </p>

                                <!-- Reset Button -->
                                <div style="text-align: center; margin: 0 0 30px;">
                                    <a href="${resetUrl}" 
                                       style="display: inline-block; background: linear-gradient(135deg, #c9a96e 0%, #e8d5a3 50%, #c9a96e 100%); color: #0a0a0a; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; text-transform: uppercase;"
                                       target="_blank">
                                        Reset Your Password
                                    </a>
                                </div>

                                <p style="color: #666; font-size: 12px; line-height: 1.6; margin: 0 0 25px; text-align: center;">
                                    Or copy and paste this link into your browser:
                                </p>
                                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 12px 16px; margin: 0 0 30px; word-break: break-all;">
                                    <a href="${resetUrl}" style="color: #c9a96e; font-size: 12px; text-decoration: none; font-family: 'Courier New', monospace;">${resetUrl}</a>
                                </div>

                                <!-- Divider -->
                                <div style="border-top: 1px solid rgba(255,255,255,0.06); margin: 0 0 25px;"></div>

                                <!-- OTP Fallback -->
                                <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0 0 15px; text-align: center;">
                                    Alternatively, use this verification code:
                                </p>
                                <div style="background: rgba(201, 169, 110, 0.08); border: 2px solid rgba(201, 169, 110, 0.3); border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 30px;">
                                    <p style="color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 10px;">Verification Code</p>
                                    <p style="color: #c9a96e; font-size: 32px; font-weight: 700; letter-spacing: 12px; margin: 0; font-family: 'Courier New', monospace;">${otpCode}</p>
                                </div>

                                <p style="color: #666; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                                    If you did not request a password reset, please ignore this email. Your account remains secure.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 40px; border-top: 1px solid rgba(201, 169, 110, 0.1); text-align: center;">
                                <p style="color: #555; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} AETHEL PARFUMS. All rights reserved.</p>
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
        subject: 'AETHEL PARFUMS — Reset Your Password',
        html,
    });
}
