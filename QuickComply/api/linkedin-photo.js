export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  try {
    const linkedinUrl = decodeURIComponent(url);

    const response = await fetch(linkedinUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    const html = await response.text();

    // Extract og:image from meta tags
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    if (ogMatch && ogMatch[1]) {
      return res.status(200).json({ image: ogMatch[1] });
    }

    // Try profile photo pattern directly
    const photoMatch = html.match(/https:\/\/media\.licdn\.com\/dms\/image\/[^"'\s]+profile-displayphoto[^"'\s]+/);
    if (photoMatch) {
      return res.status(200).json({ image: photoMatch[0] });
    }

    return res.status(404).json({ error: 'No image found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
