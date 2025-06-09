/// not in use

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { universal_leadid } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // 1. Get all appointments for this lead
  const { data, error } = await supabase
    .from("lead_appointments")
    .select("appointment_date, appointment_time, phone")
    .eq("universal_leadid", universal_leadid);

  if (error) return res.status(500).json({ error: "Failed to fetch appointments" });
  if (!data.length) return res.status(404).json({ error: "No appointments found" });

  // 2. Format for Zapier
  const phone = data[0].phone;
  const appointments = data.map(appt => ({
    date: appt.appointment_date,
    time: appt.appointment_time,
  }));

  // 3. Send to Zapier webhook
  const zapierWebhookUrl = "https://hooks.zapier.com/hooks/catch/21223948/uyu1gi0/";
  const zapierResp = await fetch(zapierWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone,
      universal_leadid,
      appointments,
    }),
  });

  if (!zapierResp.ok) {
    return res.status(500).json({ error: "Failed to notify Zapier" });
  }

  return res.status(200).json({ success: true, sent: { phone, appointments } });
}
