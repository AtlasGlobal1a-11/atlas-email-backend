import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields: email, subject, message" });
    }

    console.log("📩 Sending email with data:", { email, subject, message });

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL, // must be verified in SendGrid
      subject,
      text: message,
    };

    const response = await sgMail.send(msg);
    console.log("✅ SendGrid response:", response);

    return res.status(200).json({ success: true, message: "Email sent successfully" });

  } catch (err) {
    console.error("❌ Error sending email:", err);

    // Capture SendGrid's detailed error messages
    if (err.response && err.response.body && err.response.body.errors) {
      console.error("SendGrid errors:", err.response.body.errors);
      return res.status(500).json({
        error: "Failed to send email",
        details: err.response.body.errors
      });
    }

    return res.status(500).json({ error: "Failed to send email", details: err.message });
  }
}
