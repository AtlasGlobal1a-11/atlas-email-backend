import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end(); // Preflight
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { to, subject = "Package Status Updated", status, trackingNumber } = req.body;

    if (!to || !status || !trackingNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Build email content with proper tracking link
    const text = `Your package status is now: ${status}
Track here: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}`;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
    });

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}