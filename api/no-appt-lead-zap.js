export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("Incoming body from quiz form:", req.body); // ✅ Add this

  try {
    await fetch("https://hooks.zapier.com/hooks/catch/21223948/2vctaqq/", {
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
