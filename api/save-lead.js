export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Incoming payload:", req.body);

    const { data, error } = await supabase
      .from('leads')
      .insert([req.body]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Insert failed", details: error });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
