export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic } = req.body;
  // We will set this "MY_SECRET_API_KEY" in Vercel later
  const secretKey = process.env.MY_SECRET_API_KEY; 

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          { role: "system", content: "Explain the topic to a 5-year-old using very simple words and a warm tone. One short paragraph only." },
          { role: "user", content: `Explain ${topic}` }
        ]
      })
    });

    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "AI connection failed" });
  }
}
