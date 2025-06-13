import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Handle CORS
  const allowedOrigins = [
    'http://127.0.0.1:5500',
    'https://homeservicesdirect.org'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "null");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization"
  );

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Handle POST request to insert new leads
  if (req.method === "POST") {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Invalid JSON format' });
      }
       // ✅ Retain TrustedForm certificate
    const certUrl = payload.xxTrustedFormToken;
    if (certUrl && certUrl.startsWith("https://cert.trustedform.com/")) {
      try {
        await fetch(`${certUrl}/retain`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${process.env.TRUSTEDFORM_API_KEY}:`).toString('base64'),
          },
        });
      } catch (retainErr) {
        console.error("TrustedForm retain error:", retainErr);
        // Optional: decide if this should block lead insert or not
      }
    }


      const { error } = await supabase.from("lead_no_appointment").insert([payload]);

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

  // Handle PATCH/PUT request to update existing leads
  if (req.method === "PATCH" || req.method === "PUT") {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      const { id, email, ...updateFields } = payload;

      if (!id && !email) {
        return res.status(400).json({ error: "Missing unique identifier (id or email)" });
      }

      let query = supabase.from("lead_no_appointment").update(updateFields);

      if (id) {
        query = query.eq("id", id);
      } else {
        query = query.eq("email", email);
      }

      const { error } = await query;

      if (error) {
        console.error("Supabase update error:", error);
        return res.status(500).json({ error: "Failed to update lead" });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Unexpected server error:", err);
      return res.status(500).json({ error: "Unexpected server error" });
    }
  }

  // All other methods
  return res.status(405).json({ error: "Method not allowed" });
}
