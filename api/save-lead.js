export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // or specify origin instead of *
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // preflight request
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    // insert into Supabase or whatever you're doing here...

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Save lead error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
