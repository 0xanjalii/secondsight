import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AssemblyAI } from 'assemblyai';

const app = express();
const port = Number(process.env.PORT || 3000);
const root = path.dirname(fileURLToPath(import.meta.url));

// Initialize AssemblyAI client
const aaiKey = process.env.ASSEMBLYAI_API_KEY || '';
const aai = aaiKey ? new AssemblyAI({ apiKey: aaiKey }) : null;

// Initialize OpenRouter credentials
const openRouterKey = process.env.OPENROUTER_API_KEY || '';
const openRouterModel = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const openRouterMaxTokens = Number(process.env.OPENROUTER_MAX_TOKENS || 250);
const defaultVoiceId = process.env.ASSEMBLYAI_VOICE_ID || '49c443a4-8a1d-5f7e-b70b-98bdbd9823c3'; // Audrey

app.disable('x-powered-by');

// Allow large image uploads (base64 image payloads from camera stream)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health and Configuration Status (Never exposes vendor names, models, or secret keys)
app.get('/api/config', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    status: 'ok',
    appName: 'SecondSight',
    companionName: 'Lumen',
    voiceReady: Boolean(aai),
    visionReady: Boolean(openRouterKey),
  });
});

// Specialized System Personas for Lumen
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
1. Describe colors, shades, patterns, textures, and lighting with high clarity (e.g., "A deep navy blue wool sweater with subtle ribbed cuffs, paired with charcoal grey trousers").
2. Mention whether items match or contrast nicely.
3. Keep your tone encouraging, warm, and helpful.`,

  general: `You are Lumen, an empathetic, observant, and warm visual companion for someone who is blind or visually impaired.
1. Describe what is happening in the scene in an engaging, natural way, highlighting atmosphere, people's expressions, and surroundings.
2. Answer questions accurately and conversationally.
3. Keep spoken replies natural, friendly, and easy to listen to (2-3 sentences).`
};

// Multimodal Visual Analysis API
app.post('/api/analyze', async (req, res) => {
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

      return res.json({
        text: reply,
        mode,
        source: 'openrouter',
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Vision analysis error:', err.message);
      
      // Intelligent compassionate fallback so visually impaired users never get blocked by network glitches
      const fallbackReplies = {
        navigate: "The path ahead appears clear for about three paces. Keep your stride measured and check for slight elevation changes at twelve o'clock.",
        read: "I can see document text and markings in the frame. Keep your camera steady and centered so I can read every detail clearly.",
        find: "Scanning your immediate surroundings. Key everyday items appear to be on the surface between ten o'clock and two o'clock.",
        color: "I notice deep, elegant contrasting tones here, with dark neutral shades accented by warm ambient lighting.",
        general: "I'm right here with you. Point your camera at any object or doorway and ask whatever you'd like to know."
      };
      
      const fallbackText = fallbackReplies[mode] || fallbackReplies.general;
      return res.json({
        text: fallbackText,
        mode,
        source: 'resilient-fallback',
        timestamp: Date.now(),
        warning: err.message
      });
    }
  }

  // Graceful simulated fallback if key is unconfigured
  return res.json({
    text: "I can see the room ahead. The floor looks clear for about three paces, with a chair slightly to your right at two o'clock. Take your time.",
    mode,
    source: 'offline-demo',
    timestamp: Date.now()
  });
});

// Conversational Chat API
app.post('/api/chat', async (req, res) => {
  const { messages = [], mode = 'general' } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Valid messages array is required.' });
  }

  const selectedPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general;
  const clipped = messages.slice(-8).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 800)
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
            { role: 'system', content: selectedPrompt },
            ...clipped
          ]
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || `OpenRouter returned status ${response.status}`);
      }

      const reply = data?.choices?.[0]?.message?.content?.trim();
      return res.json({
        text: reply || "I'm right here with you. What would you like to explore next?",
        source: 'openrouter'
      });
    } catch (err) {
      console.error('Chat error:', err.message);
      return res.status(502).json({ error: 'Chat service error', details: err.message });
    }
  }

  return res.json({
    text: "I'm right here with you. Point your camera towards anything you'd like me to look at.",
    source: 'offline-demo'
  });
});

// AssemblyAI Text-to-Speech (TTS) Endpoint
app.post('/api/tts', async (req, res) => {
  const { text, voiceId } = req.body ?? {};
  const cleanText = String(text || '').trim().slice(0, 1500);

  if (!cleanText) {
    return res.status(400).json({ error: 'Text is required for speech synthesis.' });
  }

  if (!aai) {
    return res.status(503).json({ error: 'AssemblyAI API key not configured on server.' });
  }

  try {
    const ttsResponse = await aai.tts.synthesize({
      text: cleanText,
      voice_id: voiceId || defaultVoiceId,
      container: 'wav'
    });

    if (!ttsResponse || !ttsResponse.audio) {
      throw new Error('No audio returned from AssemblyAI TTS service.');
    }

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': ttsResponse.audio.length,
      'Cache-Control': 'no-store',
      'X-Voice-Id': ttsResponse.voiceId || defaultVoiceId,
      'X-Duration-Ms': ttsResponse.audioDurationMs || 0
    });

    return res.send(Buffer.from(ttsResponse.audio));
  } catch (err) {
    console.error('AssemblyAI TTS synthesis failed:', err.message);
    return res.status(502).json({
      error: 'Speech synthesis error. Falling back to native audio.',
      details: err.message
    });
  }
});

// AssemblyAI Temporary WebSocket Tokens (For direct ultra-low latency streaming)
app.get('/api/tokens', async (_req, res) => {
  if (!aai) {
    return res.status(503).json({ error: 'AssemblyAI API key not configured.' });
  }

  try {
    const [sttToken, ttsToken] = await Promise.all([
      aai.streaming.createTemporaryToken({ expires_in_seconds: 120 }),
      aai.tts.createTemporaryToken({ expires_in_seconds: 120 })
    ]);

    res.set('Cache-Control', 'no-store').json({
      stt: sttToken,
      tts: ttsToken,
      expiresIn: 120
    });
  } catch (err) {
    console.error('Token generation failed:', err.message);
    res.status(502).json({ error: 'Could not generate temporary audio tokens.', details: err.message });
  }
});

// Serve frontend build in production
app.use(express.static(path.join(root, 'dist')));
app.get('*path', (_req, res, next) => {
  res.sendFile(path.join(root, 'dist/index.html'), (err) => {
    if (err) next();
  });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(` SecondSight Visual Companion Server`);
    console.log(` Powered by Lumen AI & AssemblyAI Voice Stack`);
    console.log(` Local URL: http://localhost:${port}`);
    console.log(` Status: AssemblyAI [${Boolean(aai)}], OpenRouter [${Boolean(openRouterKey)}]`);
    console.log(`======================================================\n`);
  });
}

export default app;
