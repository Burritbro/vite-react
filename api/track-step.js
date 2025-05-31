export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // For dev/testing. Use your domain for production!
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const { session_id, step, timestamp, ...rest } = req.body;

  // Log the step
  console.log(`[TRACK] ${timestamp} | ${session_id} | Step: ${step} | Extra:`, rest);

  res.status(200).json({ message: 'Step logged' });
}
