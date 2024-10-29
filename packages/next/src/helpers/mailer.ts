import nodemailer from "nodemailer";
import { clerk } from "@/configs/clerk-server";
import bcrypt from "bcryptjs";
import { EMAIL_TYPE } from "@/constants/email";

export async function sendMail(
  userId: string,
  emailType: string
) {
  try {
    const user = await clerk.users.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
    if (!email) {
      throw new Error("User email not found");
    }

    const hashToken = await bcrypt.hash(userId, 10);

    // Update user metadata in Clerk
    const metadata = { ...user.publicMetadata };
    if (emailType === EMAIL_TYPE.VERIFY) {
      metadata.verificationToken = hashToken;
      metadata.verificationTokenExpire = Date.now() + 3600000;
    } else if (emailType === EMAIL_TYPE.RESET_PASSWORD) {
      metadata.forgotPasswordToken = hashToken;
      metadata.forgotPasswordTokenExpire = Date.now() + 3600000;
    }
    await clerk.users.updateUser(userId, { publicMetadata: metadata });

    const transporter = nodemailer.createTransport({
      service: process.env.SMPT_HOST || "",
      port: Number(process.env.SMPT_PORT) || 0,
      auth: {
        user: process.env.SMPT_USER || "",
        pass: process.env.SMPT_PASSWORD || "",
      },
    });

    console.log("mailer", email, userId, emailType);

    const mailOptions = {
      from: process.env.SMPT_USER || "",
      to: email,
      subject: emailType === EMAIL_TYPE.VERIFY ? "Verify your email" : "Reset your password",
      html: `<p>Click <a href="${
        process.env.DOMAIN
      }/verifymail?token=${hashToken}">here</a> to ${
        emailType === EMAIL_TYPE.VERIFY
          ? "verify your email"
          : "reset your password"
      }
      or copy and paste the link below in your browser. <br> ${
        process.env.DOMAIN
      }/verifymail?token=${hashToken}
      </p>`,
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          reject(error);
        } else {
          console.log(`Email sent: ${info.response}`);
          resolve(info);
        }
      });
    });

  } catch (error: any) {
    console.error("Error in sendMail:", error);
    throw new Error(error.message || "An error occurred while sending the email");
  }
}