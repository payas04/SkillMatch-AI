import transporter from "./transporter.js";

const sendVerificationEmail = async (email, username, code) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "SkillMatch AI",
        email: process.env.EMAIL_USER,
      },
      to: [
        {
          email,
          name: username,
        },
      ],
      subject: "Verify your SkillMatch AI account",
      textContent: `Hi ${username},

Your SkillMatch AI verification code is: ${code}

This code expires in 10 minutes.

If you did not create this account, you can ignore this email.`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo email failed: ${error}`);
  }
};

export default sendVerificationEmail;
