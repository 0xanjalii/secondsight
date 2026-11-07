import { AssemblyAI } from 'assemblyai';

export default async function handler(req, res) {
  const aaiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!aaiKey) {
    return res.status(503).json({ error: 'AssemblyAI API key not configured.' });
  }

  try {
    const aai = new AssemblyAI({ apiKey: aaiKey });
    const [sttToken, ttsToken] = await Promise.all([
      aai.streaming.createTemporaryToken({ expires_in_seconds: 120 }),
      aai.tts.createTemporaryToken({ expires_in_seconds: 120 }),
    ]);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      stt: sttToken,
      tts: ttsToken,
      expiresIn: 120,
    });
  } catch (err) {
    console.error('Token generation failed:', err.message);
    return res.status(502).json({ error: 'Could not generate temporary audio tokens.', details: err.message });
  }
}
