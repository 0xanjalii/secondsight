// Audio Player Utility with Voice Synthesis & Web Speech Fallback
// Supports AudioContext waveform analysis, barge-in interruption, and haptic feedback.

export interface AudioVisualizerCallback {
  (frequencyData: Uint8Array): void;
}

class AudioController {
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying: boolean = false;
  private animationFrameId: number | null = null;
  private visualizerCallback: AudioVisualizerCallback | null = null;
  private speechSynth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.speechSynth = window.speechSynthesis || null;
    }
  }

  // Initialize or resume AudioContext (needs user gesture)
  public async initAudioContext(): Promise<AudioContext> {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play audio buffer returned from voice synthesis service
  public async playAssemblyAudio(
    audioBufferData: ArrayBuffer,
    onEnded?: () => void,
    onVisualizerData?: AudioVisualizerCallback
  ): Promise<void> {
    this.stop(); // Stop any currently playing speech (barge-in)

    try {
      const ctx = await this.initAudioContext();
      const decodedBuffer = await ctx.decodeAudioData(audioBufferData.slice(0));

      const source = ctx.createBufferSource();
      source.buffer = decodedBuffer;

      // Create Analyser for real-time waveform visualization
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(ctx.destination);

      this.currentSource = source;
      this.analyser = analyser;
      this.isPlaying = true;
      this.visualizerCallback = onVisualizerData || null;

      // Start visualizer loop
      this.startVisualizerLoop();

      // Trigger subtle haptic pulse when Lumen begins speaking
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(30);
        } catch {
          // Ignore vibration errors
        }
      }

      source.onended = () => {
        this.stop();
        if (onEnded) onEnded();
      };

      source.start(0);
    } catch (err) {
      console.warn('AudioContext playback error, falling back to Web Speech:', err);
      // Fallback handled by caller
      throw err;
    }
  }

  // Fallback to Native Browser Speech Synthesis (Zero external dependencies)
  public speakNative(
    text: string,
    rate: number = 1.0,
    onEnded?: () => void
  ): void {
    this.stop();

    if (!this.speechSynth) {
      console.warn('SpeechSynthesis not available in this browser.');
      if (onEnded) onEnded();
      return;
    }

    try {
      this.speechSynth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Find an expressive English voice if possible
      const voices = this.speechSynth.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Daniel')));
      if (preferred) {
        utterance.voice = preferred;
      }

      this.isPlaying = true;

      utterance.onend = () => {
        this.isPlaying = false;
        if (onEnded) onEnded();
      };

      utterance.onerror = (e) => {
        console.warn('Native speech error:', e);
        this.isPlaying = false;
        if (onEnded) onEnded();
      };

      this.speechSynth.speak(utterance);
    } catch (err) {
      console.warn('Native speech synthesis failed:', err);
      this.isPlaying = false;
      if (onEnded) onEnded();
    }
  }

  // Instant Barge-In / Stop Playing
  public stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch {
        // Ignored
      }
      this.currentSource = null;
    }

    if (this.speechSynth && this.speechSynth.speaking) {
      this.speechSynth.cancel();
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.isPlaying = false;
    this.analyser = null;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private startVisualizerLoop(): void {
    if (!this.analyser || !this.isPlaying) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      if (!this.isPlaying || !this.analyser) {
        return;
      }
      this.analyser.getByteFrequencyData(dataArray);
      if (this.visualizerCallback) {
        this.visualizerCallback(dataArray);
      }
      this.animationFrameId = requestAnimationFrame(update);
    };

    this.animationFrameId = requestAnimationFrame(update);
  }
}

export const audioController = new AudioController();

