import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Handle CORS
  const allowedOrigins = [
    'http://127.0.0.1:5500',
    'https://servicejar.org'
  ];
  

  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", allowedOrigins.includes(origin) ? origin : "null");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ POST Handler
  if (req.method === "POST") {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Invalid JSON format' });
      }

      // 🔒 TrustedForm retain
    const certUrl = payload.xxTrustedFormPingUrl;
    if (certUrl && certUrl.startsWith("https://cert.trustedform.com/")) {
      try {
        const retainRes = await fetch(`${certUrl}/retain`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${process.env.TRUSTEDFORM_API_KEY}:`).toString('base64'),
          },
        });
    
        const retainText = await retainRes.text();
        console.log("✅ TrustedForm retain response:", retainRes.status, retainText);
      } catch (retainErr) {
        console.error("❌ TrustedForm retain error:", retainErr);
      }
    }


      // 🛠 Supabase insert
      const { error } = await supabase.from("lead_home_security").insert([payload]);
      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ error: "Failed to insert lead" });
      }

      // 🚀 LeadProsper post
      const leadProsperPayload = {
        lp_campaign_id: "29364",
        lp_supplier_id: "88827",
        lp_key: process.env.LEADPROSPER_API_KEY_SECURITY,
        lp_action: "",

        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
        zip_code: payload.zip,
        city: payload.city,
        state: payload.state,
        address: payload.street,
        
        install_pref: payload.install_pref, // may need to rename if buyer uses "repair_replace"
        features: payload.features,
        system_type: payload.system_type,
        property_type: payload.property_type,
        homeowner: payload.homeowner,

        fbclid: payload.fbclid,
        rtkclickid: payload.rtkclickid,
        gclid: payload.gclid,
        nb_cid: payload.nb_cid,

        trustedform_cert_url: payload.xxTrustedFormToken,
        jornaya_leadid: payload.universal_leadid,
        tcpa_text: payload.leadid_tcpa_disclosure,
        landing_page_url: "https://servicejar.org",
        ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        user_agent: req.headers["user-agent"],
      };

      try {
        const lpRes = await fetch("https://api.leadprosper.io/direct_post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadProsperPayload),
        });

        const lpData = await lpRes.json();
        console.log("✅ LeadProsper response:", lpData);
      } catch (lpError) {
        console.error("❌ LeadProsper forward error:", lpError);
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Unexpected POST error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  } // ✅ Closing brace for POST

  // 🔁 PATCH/PUT handler
  if (req.method === "PATCH" || req.method === "PUT") {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, email, ...updateFields } = payload;

      if (!id && !email) {
        return res.status(400).json({ error: "Missing unique identifier (id or email)" });
      }

      let query = supabase.from("lead_home_security").update(updateFields);
      query = id ? query.eq("id", id) : query.eq("email", email);

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

  return res.status(405).json({ error: "Method not allowed" });
}
