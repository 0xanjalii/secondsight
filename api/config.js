export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    status: 'ok',
    appName: 'SecondSight',
    companionName: 'Lumen',
    voiceReady: Boolean(process.env.ASSEMBLYAI_API_KEY),
    visionReady: Boolean(process.env.OPENROUTER_API_KEY),
  });
}
