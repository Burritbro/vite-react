import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS headers (adjust origin as needed)
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*"); // Set your allowed origin in production!
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization"
  );
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON format' });
    }

    // Insert the full lead with appointment into your `lead_appointments` table
    const { error } = await supabase.from("lead_appointments").insert([payload]);

    // Optionally update the status in your original `leads` table:
    if (payload.email) {
      await supabase
        .from('leads')
        .update({ status: 'booked' })
        .eq('email', payload.email); // or use universal_leadid if that's unique
    }

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to insert appointment lead" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Unexpected server error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
