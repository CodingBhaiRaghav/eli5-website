export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic } = req.body;
  const secretKey = process.env.MY_SECRET_API_KEY; 

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free", // The 100% free model
        messages: [
          { role: "system", content: "Explain like I'm five. Use simple words. One short paragraph." },
          { role: "user", content: `Explain ${topic}` }
        ]
      })
    });

    const data = await response.json();
    
    // This is the fix! It checks if the AI actually sent a message back.
    if (data.choices && data.choices[0] && data.choices[0].message) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      console.error("AI Error:", data);
      res.status(500).json({ reply: "The AI is sleepy right now. Try again!" });
    }
  } catch (error) {
    res.status(500).json({ reply: "Connection lost!" });
  }
}
