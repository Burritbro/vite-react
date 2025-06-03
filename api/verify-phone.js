export default async function handler(req, res) {
  const { number } = req.query;

  const url = const url = `https://apilayer.net/api/validate?access_key=bc1286a36597213e9e0f3d16d8642598&number=${number}&country_code=US`;


  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to validate phone number" });
  }
}
