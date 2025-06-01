"use server";

import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import nodemailer from "nodemailer";

export async function sendMessageNotification(
  chatId: string,
  senderId: string,
  message: string,
  image?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const chatDoc = await getDoc(doc(db, "chats", chatId));
    if (!chatDoc.exists()) {
      return { success: false, message: "Chat not found" };
    }

    const chatData = chatDoc.data();
    const recipientId = chatData.participants.find((uid: string) => uid !== senderId);
    if (!recipientId) {
      return { success: false, message: "Recipient not found" };
    }

    const senderDoc = await getDoc(doc(db, "users", senderId));
    const recipientDoc = await getDoc(doc(db, "users", recipientId));
    if (!senderDoc.exists() || !recipientDoc.exists()) {
      return { success: false, message: "User data not found" };
    }

    const senderName = senderDoc.data().name || `User_${senderId.slice(0, 8)}`;
    const recipientEmail = recipientDoc.data().email;
    const notificationsEnabled = recipientDoc.data().notifications?.email ?? true;

    if (!notificationsEnabled) {
      return { success: true, message: "Notifications disabled for recipient" };
    }

    const messageContent = image ? "You received a new image message." : message;

    // Validate SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("Missing SMTP configuration:", {
        SMTP_USER: !!process.env.SMTP_USER,
        SMTP_PASS: !!process.env.SMTP_PASS,
      });
      throw new Error("SMTP configuration missing");
    }

    // Configure Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify transporter
    await transporter.verify();
    console.log("Nodemailer transport verified for", process.env.SMTP_USER);

    // Send email
    await transporter.sendMail({
      from: '"ItemRetriever" <no-reply@itemretriever.com>',
      to: recipientEmail,
      subject: `New Message from ${senderName}`,
      text: `You received a new message from ${senderName}: ${messageContent}`,
      html: `<p>You received a new message from <strong>${senderName}</strong>:</p><p>${messageContent}</p>`,
    });

    console.log(`Email sent to ${recipientEmail} from ${senderName}: ${messageContent}`);
    return { success: true, message: "Notification sent successfully" };
  } catch (error: any) {
    console.error("Error sending notification:", error.message, error.stack);
    return { success: false, message: error.message || "Failed to send notification" };
  }
}