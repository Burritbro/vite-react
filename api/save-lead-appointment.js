import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*"); // Restrict for prod!
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

    // Insert into appointments table
    const { error } = await supabase.from("lead_appointments").insert([payload]);

    // Update original lead status
    if (payload.universal_leadid) {
      console.log("Updating appointment_status for universal_leadid:", payload.universal_leadid);
      const { error: updateError, data } = await supabase
        .from('leads')
        .update({ appointment_status: 'booked' })
        .eq('universal_leadid', payload.universal_leadid)
        .select(); // Optional: returns updated rows

      if (updateError) {
        console.error("Failed to update appointment_status:", updateError);
      } else {
        console.log("Updated leads rows:", data);
      }
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
