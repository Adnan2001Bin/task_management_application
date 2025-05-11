import { createTransporter } from "@/lib/nodemailer";

interface VerificationEmailOptions {
  name: string;
  verificationCode: string;
  email:string
}

export async function sendVerificationEmail({
  email,
  name,
  verificationCode,
}: VerificationEmailOptions) {
  try {
    const transporter = await createTransporter();

    await transporter.sendMail({
      from: `"Your App Name" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: 'Verify Your Email',
      html: `
         <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4a90e2; color: white; padding: 10px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .code { font-size: 24px; font-weight: bold; color: #4a90e2; }
            .footer { margin-top: 20px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Welcome to Task Management App, ${name}!</h2>
            </div>
            <div class="content">
              <p>Please verify your email address by using the code below:</p>
              <p class="code">${verificationCode}</p>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn’t request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Task Management App. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Verification email sent to ${email}`);
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, message: 'Failed to send verification email.' };
  }
}
