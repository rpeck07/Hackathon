export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  try {
    const resp = await fetch(
      `https://piloterr.com/api/v2/linkedin/profile/info?query=${encodeURIComponent(url)}`,
      { headers: { 'x-api-key': process.env.PILOTERR_API_KEY } }
    );
    if (!resp.ok) return res.status(resp.status).json({ error: 'Piloterr error' });
    const data = await resp.json();
    if (data.photo_url) return res.status(200).json({ image: data.photo_url });
    return res.status(404).json({ error: 'No photo found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
