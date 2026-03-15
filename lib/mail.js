/**
 * AETHEL MAIL SYSTEM (SIMULATED)
 * In production, replace this with Resend, SendGrid, or Nodemailer.
 */
export const sendRecoveryEmail = async ({ name, email, orderNumber, discount, timeLeft, items }) => {
    const logEntry = `
[RECOVERY EMAIL SENT]
TO: ${name} <${email}>
SUBJECT: Final Chance! Your ${discount}% Aethel discount expires in ${timeLeft} ⏳
CONTENT:
Hello ${name},
We noticed you left something exquisite in your cart (Order #${orderNumber}).
Our current promotion is ending soon. You have ${timeLeft} remaining to secure your collection at ${discount}% off.

ITEMS RECOVERABLE:
${items.map(i => `- ${i.product.name} (Qty: ${i.quantity})`).join('\n')}

COMPLETE YOUR ORDER: http://aethel.perfume/checkout/${orderNumber}
--------------------------------------------------
`;
    // We log it to the console for development visibility
    console.log(logEntry);
    return { success: true, timestamp: new Date().toISOString() };
};

export const sendRewardNotification = async ({ name, email, phone, amount, newBalance, type = 'REFERRAL' }) => {
    // Email Simulation
    console.log(`
[REWARD EMAIL]
TO: ${name} <${email}>
SUBJECT: Luxury Credit Earned! 💎
CONTENT: Congratulations ${name}! You've just earned ₹${amount} in Aethel credit.
New Ambassador Balance: ₹${newBalance}
    `);

    // WhatsApp Simulation
    if (phone) {
        console.log(`
[WHATSAPP NOTIFICATION]
TO: ${phone}
MESSAGE: Aethel: High-velocity credit alert! ₹${amount} has been added to your vault. Your new balance is ₹${newBalance}. Keep sharing the essence!
        `);
    }

    return { success: true };
};
