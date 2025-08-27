export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("Request body:", req.body);

    res.status(200).json({
      success: true,
      message: "Endpoint is working. Request received.",
      data: req.body
    });
  } catch (err) {
    console.error("Error in handler:", err);
    res.status(500).json({ error: "Server crashed before SendGrid" });
  }
}
