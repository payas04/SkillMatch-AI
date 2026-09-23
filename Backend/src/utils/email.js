import transporter from "./transporter.js";

const sendVerificationEmail = async (email, username, code) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your SkillMatch AI account",
    text: `Hi ${username},

Your SkillMatch AI verification code is: ${code}

This code expires in 10 minutes.

If you did not create this account, you can ignore this email.`,
  });
};

export default sendVerificationEmail;
