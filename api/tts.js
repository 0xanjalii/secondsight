import { AssemblyAI } from 'assemblyai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voiceId } = req.body ?? {};
  const cleanText = String(text || '').trim().slice(0, 1500);

  if (!cleanText) {
    return res.status(400).json({ error: 'Text is required for speech synthesis.' });
  }

  const aaiKey = process.env.ASSEMBLYAI_API_KEY;
  const defaultVoiceId = process.env.ASSEMBLYAI_VOICE_ID || '49c443a4-8a1d-5f7e-b70b-98bdbd9823c3';

  if (!aaiKey) {
    return res.status(503).json({ error: 'AssemblyAI API key not configured on server.' });
  }

  try {
    const aai = new AssemblyAI({ apiKey: aaiKey });
    const ttsResponse = await aai.tts.synthesize({
      text: cleanText,
      voice_id: voiceId || defaultVoiceId,
      container: 'wav'
    });

    if (!ttsResponse || !ttsResponse.audio) {
      throw new Error('No audio returned from AssemblyAI TTS service.');
    }

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', ttsResponse.audio.length);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(Buffer.from(ttsResponse.audio));
  } catch (err) {
    console.error('TTS synthesis error:', err.message);
    return res.status(502).json({
      error: 'Speech synthesis error. Falling back to native audio.',
      details: err.message
    });
  }
}
