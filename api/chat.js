export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages = [] } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Valid messages array is required.' });
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const openRouterMaxTokens = Number(process.env.OPENROUTER_MAX_TOKENS || 250);

  const clipped = messages.slice(-8).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 800),
  }));

  if (openRouterKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://secondsight.vision',
          'X-Title': 'SecondSight Visual Companion',
        },
        body: JSON.stringify({
          model: openRouterModel,
          max_tokens: openRouterMaxTokens,
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content:
                'You are Lumen, a warm, observant, and respectful visual companion for someone with low vision. Keep responses concise, clear, and reassuring (2-3 sentences).',
            },
            ...clipped,
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || `OpenRouter returned status ${response.status}`);
      }

      const reply = data?.choices?.[0]?.message?.content?.trim();
      return res.status(200).json({
        text: reply || "I'm right here with you. What would you like to explore next?",
        source: 'openrouter',
      });
    } catch (err) {
      console.error('Chat error:', err.message);
      return res.status(502).json({ error: 'Chat service error', details: err.message });
    }
  }

  return res.status(200).json({
    text: "I'm right here with you. Point your camera towards anything you'd like me to look at.",
    source: 'offline-demo',
  });
}
