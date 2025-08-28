import nodemailer from "nodemailer";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Atlas Global Shipping" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log("Email sent:", info.messageId);
    return res.status(200).json({ message: "Email sent successfully", messageId: info.messageId });

  } catch (error) {
    console.error("Gmail send error:", error);
    return res.status(500).json({ error: error.message });
  }
}
