export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic } = req.body;
  const secretKey = process.env.MY_SECRET_API_KEY; 

  if (!secretKey) {
    return res.status(500).json({ reply: "Configuration error: Missing API Key in Vercel." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vercel.com",
        "X-Title": "Simplifier App"
      },
      body: JSON.stringify({
        // Trying Google's incredibly fast and reliable free model
        model: "openrouter/free", 
        messages: [
          { role: "system", content: "Simplify this topic clearly using an analogy. One paragraph." },
          { role: "user", content: `Simplify: ${topic}` }
        ]
      })
    });

    const data = await response.json();

    // If OpenRouter sends an answer, show it!
    if (data.choices && data.choices[0]) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } 
    // If OpenRouter sends an error, PRINT THE EXACT ERROR on the website!
    else if (data.error && data.error.message) {
      res.status(200).json({ reply: `OpenRouter says: "${data.error.message}"` });
    } 
    // If it's completely broken, print the raw data so we can see it
    else {
      res.status(200).json({ reply: `Unknown Error from OpenRouter: ${JSON.stringify(data)}` });
    }

  } catch (error) {
    res.status(500).json({ reply: "The server connection failed entirely." });
  }
}
