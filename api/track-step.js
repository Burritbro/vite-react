export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const { session_id, step, timestamp, ...rest } = req.body;

  // Optional: Log to console for now (can later integrate with Google Sheets, Zapier, DB, etc.)
  console.log(`[TRACK] ${timestamp} | ${session_id} | Step: ${step} | Extra:`, rest);

  res.status(200).json({ message: 'Step logged' });
}
