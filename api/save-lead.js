import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // ✅ Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization'
  );

  // ✅ Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;

    console.log('Incoming payload:', JSON.stringify(payload, null, 2));

    // Only insert fields you expect (important for security and consistency)
    const insertData = {
      first_name: payload['First Name'] || '',
      last_name: payload['Last Name'] || '',
      email: payload.email || '',
      phone: payload.phone || '',
      zip: payload.zip || '',
      roof_type: payload.roof_type || '',
      square_footage: payload.square_footage || '',
      street: payload.street || '',
      city: payload.city || '',
      state: payload.state || '',
      rtkclickid: payload.rtkclickid || '',
      fbclid: payload.fbclid || '',
      universal_leadid: payload.universal_leadid || '',
      xxTrustedFormCertUrl: payload.xxTrustedFormCertUrl || '',
      homeowner: payload.homeowner || false,
    };

    const { data, error } = await supabase.from('leads').insert([insertData]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to insert lead', detail: error });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
