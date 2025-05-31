export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const { session_id, step, timestamp, ...rest } = req.body;
  console.log(`[TRACK] ${timestamp} | ${session_id} | Step: ${step} | Extra:`, rest);

  // 🟢 Forward to Zapier here:
  try {
    const zapierResp = await fetch('https://hooks.zapier.com/hooks/catch/21223948/2vt23bl/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!zapierResp.ok) {
      throw new Error(`Zapier error: ${zapierResp.statusText}`);
    }
  } catch (err) {
    console.error('Error forwarding to Zapier:', err);
    // Optionally send a different status code or message to frontend
    return res.status(500).json({ message: 'Failed to forward to Zapier' });
  }

  res.status(200).json({ message: 'Step logged and sent to Zapier' });
}
