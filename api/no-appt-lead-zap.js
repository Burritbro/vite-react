export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Important for CORS preflight
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("Incoming body from quiz form:", req.body);

  try {
    await fetch("https://hooks.zapier.com/hooks/catch/21223948/2vp35a2/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Zapier error:", err);
    res.status(500).json({ error: "Zapier failed" });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
