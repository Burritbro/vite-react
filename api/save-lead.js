import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Handle CORS
// Top of your handler
res.setHeader("Access-Control-Allow-Credentials", "true");
res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500"); // or "*" temporarily
res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
res.setHeader(
  "Access-Control-Allow-Headers",
  "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization"
);

// Handle OPTIONS preflight
if (req.method === "OPTIONS") {
  return res.status(200).end();
}


  // ✅ Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ✅ Defensive JSON parsing
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON format' });
    }

    console.log("Payload received:", payload);

    const { error } = await supabase.from("leads").insert([payload]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to insert lead" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Unexpected server error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
