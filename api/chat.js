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
        "HTTP-Referer": "https://vercel.com", // OpenRouter sometimes requires this
        "X-Title": "ELI5 App"
      },
      body: JSON.stringify({
  // THIS IS THE SPECIFIC CHANGE
  model: "meta-llama/llama-3.3-70b-instruct:free", 
  messages: [
    { 
      role: "system", 
      content: "You are a master of simplification. Take complex topics and explain them clearly using analogies. Be smart and clear, not childish. One short paragraph." 
    },
    { role: "user", content: `Simplify this for me: ${topic}` }
  ]
});

    const data = await response.json();
    
    // This part helps us find the error in Vercel Logs
    if (data.error) {
        console.error("OpenRouter Error Details:", data.error);
        return res.status(500).json({ reply: `AI Error: ${data.error.message}` });
    }

    if (data.choices && data.choices[0]) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(500).json({ reply: "The AI is silent. Try a different topic!" });
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ reply: "Connection failed!" });
  }
}
