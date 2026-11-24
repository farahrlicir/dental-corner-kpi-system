
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Reset your Dental Corner account password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Password Reset</h2>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to choose a new password:</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 20px;background:#245B86;color:white;text-decoration:none;border-radius:6px;">
          Reset Password
        </a>
        <p>This link expires in 30 minutes.</p>
        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error details:", error);
    throw new Error("EMAIL_SEND_FAILED");
  }

  console.log("Password reset email sent:", data?.id);
}
