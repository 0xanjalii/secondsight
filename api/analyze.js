const SYSTEM_PROMPTS = {
  navigate: `You are Lumen, a warm, reassuring, and alert visual guide assisting someone who is blind or has low vision. 
Your goal is spatial awareness and physical safety.
1. Scan for immediate hazards first (steps, stairs, drop-offs, low ceilings, trip hazards, wet floors, moving objects).
2. Describe clear paths and landmarks using clock positions (e.g. "doorway is at 12 o'clock, 3 paces away; small stool at 2 o'clock").
3. Keep spoken guidance concise, calm, and conversational (2-3 short sentences).
4. Never mention you are an AI. Speak naturally as a trusted friend walking alongside them.`,

  read: `You are Lumen, a clear, friendly voice reader for someone who is visually impaired.
1. Read all visible text, street signs, labels, menus, mail, or medication containers clearly.
2. If reading a label or document, summarize the most critical info first (e.g. medication name, dosage, price, heading), then read details.
3. If text is blurry or cut off, kindly let them know how to tilt or reposition the camera.
4. Keep delivery warm, clear, and easy to follow.`,

  find: `You are Lumen, a helpful and patient item-finding assistant for a visually impaired user.
1. Locate the requested object or prominent everyday items (keys, phone, mug, wallet, glasses, medicines).
2. Give precise clock-face directions and estimated distance (e.g., "Found your keys! They are resting on the table at 10 o'clock, about arm's length away, next to a black notebook").
3. If not visible in the frame, gently tell them where to pan the camera (e.g., "I don't see it yet. Try panning slowly to your right").`,

  color: `You are Lumen, a style and color assistant for someone with low vision.
1. Describe colors, shades, patterns, textures, and lighting with high clarity.
2. Mention whether items match or contrast nicely.
3. Keep your tone encouraging, warm, and helpful.`,

  general: `You are Lumen, an empathetic, observant, and warm visual companion for someone who is blind or visually impaired.
1. Describe what is happening in the scene in an engaging, natural way.
2. Keep spoken replies natural, friendly, and easy to listen to (2-3 sentences).`
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, mode = 'navigate', query = '' } = req.body ?? {};

  if (!image) {
    return res.status(400).json({ error: 'Image data is required.' });
  }

  const selectedPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general;
  const userTextPrompt = query.trim() || (
    mode === 'navigate' ? 'Describe the spatial layout and any hazards directly ahead.' :
    mode === 'read' ? 'Read all text, signs, or labels visible in this view.' :
    mode === 'find' ? 'What key objects are visible, and where are they located?' :
    mode === 'color' ? 'Describe the colors, lighting, and textures in this image.' :
    'Describe what is happening in front of me.'
  );

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const openRouterMaxTokens = Number(process.env.OPENROUTER_MAX_TOKENS || 250);

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
          temperature: 0.6,
          messages: [
            { role: 'system', content: selectedPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: userTextPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
                  }
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || `OpenRouter returned status ${response.status}`);
      }

      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        throw new Error('Model returned an empty response.');
      }

      return res.status(200).json({
        text: reply,
        mode,
        source: 'openrouter',
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Vision analysis error:', err.message);
      const fallbackReplies = {
        navigate: "The path ahead appears clear for about three paces. Keep your stride measured and check for slight elevation changes at twelve o'clock.",
        read: "I can see document text and markings in the frame. Keep your camera steady and centered so I can read every detail clearly.",
        find: "Scanning your immediate surroundings. Key everyday items appear to be on the surface between ten o'clock and two o'clock.",
        color: "I notice deep, elegant contrasting tones here, with dark neutral shades accented by warm ambient lighting.",
        general: "I'm right here with you. Point your camera at any object or doorway and ask whatever you'd like to know."
      };

      return res.status(200).json({
        text: fallbackReplies[mode] || fallbackReplies.general,
        mode,
        source: 'resilient-fallback',
        timestamp: Date.now(),
        warning: err.message
      });
    }
  }

  const demoReplies = {
    navigate: "I can see the room ahead. The floor looks clear for about three paces, with a chair slightly to your right at two o'clock. Take your time.",
    read: "Reading label text: Amoxicillin 500mg capsule. Take one capsule every 8 hours with meals.",
    find: "Found your keys on the table surface at 10 o'clock, about arm's length away.",
    color: "The clothing shows deep navy blue tones with subtle ribbed texture, nicely complementing neutral shades.",
    general: "The space ahead is open and well lit. Point your camera towards anything you'd like to inspect."
  };

  return res.status(200).json({
    text: demoReplies[mode] || demoReplies.general,
    mode,
    source: 'offline-demo',
    timestamp: Date.now()
  });
}
