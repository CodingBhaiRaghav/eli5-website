export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic } = req.body;
  const secretKey = process.env.MY_SECRET_API_KEY; 

  // Check if the key exists before even trying to call the AI
  if (!secretKey) {
    console.error("ERROR: MY_SECRET_API_KEY is missing from Vercel Settings!");
    return res.status(500).json({ reply: "Configuration error: Missing API Key." });
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
        // Using this specific free model for stability
        model: "meta-llama/llama-3.3-70b-instruct:free", 
        messages: [
          { role: "system", content: "Simplify this topic clearly using an analogy. One paragraph." },
          { role: "user", content: `Simplify: ${topic}` }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      console.error("OpenRouter Error:", data);
      res.status(200).json({ reply: "The AI is busy. Please try again!" });
    }
  } catch (error) {
    console.error("Runtime Error:", error);
    res.status(500).json({ reply: "The server had a hiccup. Try again!" });
  }
}
