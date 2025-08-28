export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel automatically parses JSON if Content-Type is application/json
    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ error: 'No request body received' });
    }

    console.log("✅ Request body received:", body);

    // Respond with success + echo back body
    return res.status(200).json({
      success: true,
      message: "Endpoint is working. Request received.",
      data: body
    });

  } catch (err) {
    console.error("❌ Error in handler:", err);
    return res.status(500).json({
      error: "Server error before SendGrid",
      details: err.message
    });
  }
}
