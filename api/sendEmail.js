import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { to, subject = "Package Status Updated", recipientName, status, trackingNumber, destination } = req.body;

    if (!to || !status || !trackingNumber || !recipientName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Language mapping based on country/destination
    const languageMap = {
      "Thailand": "thai",
      "Mexico": "spanish",
      "Brazil": "portuguese",
      "South Korea": "korean",
      "China": "chinese",
      "Japan": "japanese",
      "Malaysia": "malay",
      "Vietnam": "vietnamese",
      "Philippines": "filipino",
      "Germany": "german",
      "Italy": "italian",
      "France": "french",
      "United Kingdom": "english",
      "USA": "english",
      "Canada": "english",
      "Australia": "english",
      "Spain": "spanish"
      // Add more if needed
    };

    const lang = languageMap[destination] || "english";

    // Email templates per language
    const greetings = {
      english: `Dear ${recipientName},`,
      spanish: `Estimado/a ${recipientName},`,
      portuguese: `Prezado/a ${recipientName},`,
      french: `Cher/Chère ${recipientName},`,
      german: `Sehr geehrte/r ${recipientName},`,
      italian: `Gentile ${recipientName},`,
      thai: `เรียนคุณ ${recipientName},`,
      korean: `${recipientName}님께,`,
      japanese: `${recipientName}様,`,
      chinese: `尊敬的${recipientName},`,
      malay: `Kepada ${recipientName},`,
      vietnamese: `Kính gửi ${recipientName},`,
      filipino: `Mahal na ${recipientName},`
    };

    const greeting = greetings[lang] || greetings.english;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Email body with customer support line added
    const text = `${greeting}

Your package status is now: ${status}
Track here: https://atlas-global-shippings.web.app/track.html?id=${trackingNumber}

Package ID: ${trackingNumber}

Thank you for choosing Atlas Global Shipping.

For more inquiries, please contact the Atlas Global Shipping Team.`;

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