export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic } = req.body;
  const secretKey = process.env.MY_SECRET_API_KEY; 

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vercel.com", 
        "X-Title": "Universal Simplifier"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free", 
        messages: [
          { role: "system", content: "You are a master of simplification. Explain complex topics using analogies. One short paragraph." },
          { role: "user", content: `Simplify: ${topic}` }
        ]
      })
    });

    const data = await response.json();

    // NEW FIX: If OpenRouter sends an error, we send that message instead of "undefined"
    if (data.error) {
      return res.status(200).json({ reply: `AI Notice: ${data.error.message}` });
    }

    if (data.choices && data.choices[0]) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(200).json({ reply: "The AI is busy simplifying the world. Try again in 10 seconds!" });
    }
  } catch (error) {
    res.status(200).json({ reply: "Connection slow. Please try again!" });
  }
}
