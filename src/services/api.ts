// SecondSight Frontend API Service
// Connects to local proxy backend. No API keys or secrets are stored or handled on the client.

export interface ConfigResponse {
  status: string;
  appName: string;
  companionName: string;
  voiceReady: boolean;
  visionReady: boolean;
}

export interface AnalyzeResponse {
  text: string;
  mode: string;
  source: string;
  timestamp: number;
}

export interface ChatResponse {
  text: string;
  source: string;
}

export async function fetchServerConfig(): Promise<ConfigResponse> {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Config fetch warning:', err);
    return {
      status: 'offline',
      appName: 'SecondSight',
      companionName: 'Lumen',
      voiceReady: false,
      visionReady: false,
    };
  }
}

export async function analyzeImage(
  imageData: string,
  mode: string = 'navigate',
  query: string = ''
): Promise<AnalyzeResponse> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageData, mode, query }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Analysis failed with status ${res.status}`);
  }

  return await res.json();
}

export async function synthesizeSpeech(text: string, voiceId?: string): Promise<ArrayBuffer> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `TTS synthesis failed with status ${res.status}`);
  }

  return await res.arrayBuffer();
}

export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  mode: string = 'general'
): Promise<ChatResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Chat failed with status ${res.status}`);
  }

  return await res.json();
}

