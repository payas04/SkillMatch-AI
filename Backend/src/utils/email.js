const RESEND_API_URL = "https://api.resend.com/emails";

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error("RESEND_API_KEY and EMAIL_FROM must be configured");
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Email provider error: ${response.status} ${errorBody}`);
  }

  return response.json();
};

const sendVerificationEmail = async (email, username, code) => {
  const safeUsername = escapeHtml(username);
  await sendEmail({
    to: email,
    subject: "Verify your SkillMatch AI account",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <h2>Verify your SkillMatch AI account</h2>
        <p>Hi ${safeUsername},</p>
        <p>Use this verification code to verify your email address:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0">${code}</div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, username, resetUrl) => {
  const safeUsername = escapeHtml(username);
  const safeResetUrl = escapeHtml(resetUrl);

  await sendEmail({
    to: email,
    subject: "Reset your SkillMatch AI password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <h2>Reset your SkillMatch AI password</h2>
        <p>Hi ${safeUsername},</p>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${safeResetUrl}"
             style="display:inline-block;padding:12px 18px;background:#4f46e5;color:white;text-decoration:none;border-radius:8px">
            Reset password
          </a>
        </p>
        <p>This link expires in 15 minutes and can only be used once.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>
    `,
  });
};

export { sendVerificationEmail, sendPasswordResetEmail };
