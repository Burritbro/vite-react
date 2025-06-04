import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await supabase.from('leads').insert([req.body]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Insert failed" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
