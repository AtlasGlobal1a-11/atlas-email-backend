export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure the body is parsed
    let body;
    if (req.body) {
      body = req.body;
    } else {
      let data = '';
      req.on('data', chunk => data += chunk);
      await new Promise(resolve => req.on('end', resolve));
      body = JSON.parse(data);
    }

    console.log("Request body:", body);

    res.status(200).json({
      success: true,
      message: "Endpoint is working. Request received.",
      data: body
    });
  } catch (err) {
    console.error("Error in handler:", err);
    res.status(500).json({ error: "Server crashed before SendGrid", details: err.message });
  }
}
