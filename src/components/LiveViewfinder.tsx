import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Compass,
  FileText,
  Search,
  Palette,
  MessageSquare,
  Upload,
  Play,
  Square,
  AlertCircle,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';
import { PRESET_SCENARIOS, PresetScenario } from '../data/presets';
import { analyzeImage, synthesizeSpeech } from '../services/api';
import { audioController } from '../utils/audioPlayer';

interface LiveViewfinderProps {
  isVoiceEnabled: boolean;
  isHighContrast: boolean;
  onAudioPlayingChange: (isPlaying: boolean) => void;
  selectedMode?: AssistiveMode;
  onModeChange?: (mode: AssistiveMode) => void;
}

export type AssistiveMode = 'navigate' | 'read' | 'find' | 'color' | 'general';

interface ModeDefinition {
  id: AssistiveMode;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  hint: string;
  defaultPrompt: string;
}

const MODES: ModeDefinition[] = [
  {
    id: 'navigate',
    name: 'Spatial Navigator',
    shortName: 'Navigate',
    icon: <Compass className="w-4 h-4" />,
    hint: 'Detects obstacles, stairs, doorways, and safe walking paths.',
    defaultPrompt: 'What obstacles or drop-offs are in front of me?'
  },
  {
    id: 'read',
    name: 'Instant Text Reader',
    shortName: 'Read Text',
    icon: <FileText className="w-4 h-4" />,
    hint: 'Reads medicine labels, street signs, mail, and documents aloud.',
    defaultPrompt: 'Read all visible text and summarize the critical parts.'
  },
  {
    id: 'find',
    name: 'Object & Item Locator',
    shortName: 'Find Items',
    icon: <Search className="w-4 h-4" />,
    hint: 'Locates keys, glasses, phones, or mugs with clock directions.',
    defaultPrompt: 'Where are my keys or items in this view?'
  },
  {
    id: 'color',
    name: 'Color & Fashion Stylist',
    shortName: 'Colors',
    icon: <Palette className="w-4 h-4" />,
    hint: 'Identifies clothing colors, patterns, and style matches.',
    defaultPrompt: 'Describe the colors and textures in this outfit.'
  },
  {
    id: 'general',
    name: 'Ask Lumen Anything',
    shortName: 'Ask Lumen',
    icon: <MessageSquare className="w-4 h-4" />,
    hint: 'Conversational visual co-pilot for any question about your scene.',
    defaultPrompt: 'Tell me about the atmosphere and people here.'
  }
];

export const LiveViewfinder: React.FC<LiveViewfinderProps> = ({
  isVoiceEnabled,
  isHighContrast,
  onAudioPlayingChange,
  selectedMode,
  onModeChange,
}) => {
  // State
  const [activeMode, setActiveMode] = useState<AssistiveMode>(selectedMode || 'navigate');

  useEffect(() => {
    if (selectedMode && selectedMode !== activeMode) {
      setActiveMode(selectedMode);
    }
  }, [selectedMode]);

  const handleModeSwitch = (mode: AssistiveMode) => {
    setActiveMode(mode);
    if (onModeChange) onModeChange(mode);
  };
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetScenario | null>(PRESET_SCENARIOS[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  
  // Real-time processing
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoScanEnabled, setAutoScanEnabled] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>(
    "Hello! I am Lumen, your visual guide. Point your camera at anything, or pick a scenario below to begin."
  );
  const [lastModeUsed, setLastModeUsed] = useState<string>('Welcome');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Voice recognition (Speech-to-Text)
  const [isListening, setIsListening] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>('');
  const [waveformBars, setWaveformBars] = useState<number[]>(new Array(16).fill(12));

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const autoScanTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition (Hands-Free User Voice Input)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event: any) => {
          const speechResult = event.results[0]?.[0]?.transcript;
          if (speechResult) {
            setUserQuery(speechResult);
            // Auto trigger analysis with user spoken question
            handleCaptureAndAnalyze(speechResult);
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [activeMode, selectedPreset, customImage, cameraActive]);

  // Handle Camera Stream
  const startCamera = async (targetFacing: 'environment' | 'user' = facingMode) => {
    setErrorMessage(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraActive(false);
      setErrorMessage(
        'Camera access requires a secure connection (HTTPS or localhost). You can test any scenario below instantly!'
      );
      if (!selectedPreset && !customImage) {
        setSelectedPreset(PRESET_SCENARIOS[0]);
      }
      return;
    }

    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: targetFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
      setCustomImage(null);
      setSelectedPreset(null);

      // Check for torch/flashlight support
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities: any = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        setTorchSupported(Boolean(capabilities.torch));
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraActive(false);
      setErrorMessage(
        'Camera not accessible on this device or permission denied. Using preset scenario gallery below!'
      );
      if (!selectedPreset && !customImage) {
        setSelectedPreset(PRESET_SCENARIOS[0]);
      }
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  const flipCamera = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (cameraActive) {
      await startCamera(nextFacing);
    }
  };

  const toggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (track && torchSupported) {
      try {
        const nextTorch = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setTorchOn(nextTorch);
      } catch (err) {
        console.warn('Could not toggle flashlight:', err);
      }
    }
  };

  // Toggle Hands-Free Microphone
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      // Barge-in: stop talking when user speaks
      stopSpeaking();
      setUserQuery('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Speech recognition error:', e);
        }
      } else {
        alert('Speech recognition is not supported in this browser. You can type in the box below!');
      }
    }
  };

  // Stop / Barge-In Audio
  const stopSpeaking = () => {
    audioController.stop();
    setIsSpeaking(false);
    onAudioPlayingChange(false);
    setWaveformBars(new Array(16).fill(12));
  };

  // Play Spoken Text via Real-Time Voice Synthesis
  const speakText = async (text: string) => {
    if (!isVoiceEnabled || !text) return;

    stopSpeaking();
    setIsSpeaking(true);
    onAudioPlayingChange(true);

    try {
      const audioData = await synthesizeSpeech(text);

      await audioController.playAssemblyAudio(
        audioData,
        () => {
          setIsSpeaking(false);
          onAudioPlayingChange(false);
          setWaveformBars(new Array(16).fill(12));
        },
        (frequencyData: Uint8Array) => {
          const bars: number[] = [];
          const step = Math.floor(frequencyData.length / 16);
          for (let i = 0; i < 16; i++) {
            const val = frequencyData[i * step] || 0;
            const pct = Math.max(15, Math.min(100, (val / 255) * 100));
            bars.push(pct);
          }
          setWaveformBars(bars);
        }
      );
    } catch (err) {
      console.warn('Voice playback fallback triggered:', err);
      audioController.speakNative(text, 1.05, () => {
        setIsSpeaking(false);
        onAudioPlayingChange(false);
        setWaveformBars(new Array(16).fill(12));
      });
    }
  };

  // Helper to rasterize SVG data URLs onto an HTML5 canvas for vision APIs
  const rasterizeSvgToPng = (rawSrc: string): Promise<string> => {
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.naturalWidth || 600;
        canvas.height = img.naturalHeight || 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(rawSrc);
        }
      };
      img.onerror = () => resolve(rawSrc);
      img.src = rawSrc;
    });
  };

  // Capture Current Image Frame (Safely rasterizes video and SVGs to clean PNG/JPEG)
  const getCurrentFrame = async (overrideSrc?: string): Promise<string | null> => {
    if (overrideSrc) {
      if (overrideSrc.startsWith('data:image/jpeg') || overrideSrc.startsWith('data:image/png')) {
        return overrideSrc;
      }
      return rasterizeSvgToPng(overrideSrc);
    }

    if (cameraActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    }

    const rawSrc = customImage || (selectedPreset ? selectedPreset.imageData : null);
    if (!rawSrc) return null;

    if (rawSrc.startsWith('data:image/jpeg') || rawSrc.startsWith('data:image/png')) {
      return rawSrc;
    }

    return rasterizeSvgToPng(rawSrc);
  };

  // Primary Action: Capture and Process with Lumen AI
  const handleCaptureAndAnalyze = async (
    explicitQuery?: string,
    explicitImage?: string,
    explicitMode?: AssistiveMode
  ) => {
    stopSpeaking();
    setIsAnalyzing(true);
    setErrorMessage(null);

    const targetMode = explicitMode || activeMode;
    const imagePayload = await getCurrentFrame(explicitImage);
    if (!imagePayload) {
      setIsAnalyzing(false);
      setErrorMessage('Please activate camera or choose a scenario from the gallery.');
      return;
    }

    const queryToSend = explicitQuery || userQuery || MODES.find((m) => m.id === targetMode)?.defaultPrompt || '';

    try {
      const result = await analyzeImage(imagePayload, targetMode, queryToSend);
      setSpokenTranscript(result.text);
      setLastModeUsed(MODES.find((m) => m.id === targetMode)?.name || 'General');

      if (isVoiceEnabled) {
        speakText(result.text);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      const fallbackMsg = "I'm having a brief connection pause. Please try once more or tap any preset scenario below.";
      setSpokenTranscript(fallbackMsg);
      setErrorMessage(err.message || 'Analysis could not be completed.');
      if (isVoiceEnabled) {
        speakText(fallbackMsg);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: PresetScenario) => {
    stopCamera();
    setSelectedPreset(preset);
    setCustomImage(null);
    setActiveMode(preset.mode);
    setErrorMessage(null);
    handleCaptureAndAnalyze(preset.prompt, preset.imageData, preset.mode);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      stopCamera();
      setSelectedPreset(null);
      setCustomImage(dataUrl);
      setErrorMessage(null);
      handleCaptureAndAnalyze(undefined, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Continuous Auto-Scan Toggle
  const toggleAutoScan = () => {
    const nextState = !autoScanEnabled;
    setAutoScanEnabled(nextState);
    if (nextState) {
      if (!cameraActive) startCamera();
      handleCaptureAndAnalyze();
      autoScanTimerRef.current = setInterval(() => {
        handleCaptureAndAnalyze();
      }, 7000);
    } else {
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current);
        autoScanTimerRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (autoScanTimerRef.current) clearInterval(autoScanTimerRef.current);
      stopCamera();
      stopSpeaking();
    };
  }, []);

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(spokenTranscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="viewfinder" className="py-12 sm:py-20 border-b-2 border-black bg-white relative rounded-none">
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="text-xs font-mono tracking-widest text-zinc-600 uppercase mb-2 flex items-center gap-2 font-bold">
              <span className="w-2 h-2 bg-black rounded-none"></span>
              <span>INTERACTIVE VIEWING DECK</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-black tracking-tight uppercase">
              LUMEN LIVE VIEWFINDER
            </h2>
          </div>
          <p className="text-zinc-700 text-sm sm:text-base max-w-md font-medium">
            Seamlessly toggles between your physical smartphone camera and the scenario test gallery below.
          </p>
        </div>

        {/* Mode Selector Tabs (Sharp Brutalist Rectangles) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-8" role="tablist">
          {MODES.map((mode) => {
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  handleModeSwitch(mode.id);
                  stopSpeaking();
                }}
                className={`flex items-center gap-2.5 px-3.5 py-3 border-2 border-black text-xs sm:text-sm font-mono tracking-tight text-left transition-all rounded-none shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                  isActive
                    ? 'bg-black text-white font-extrabold'
                    : 'bg-white text-black hover:bg-zinc-100'
                }`}
              >
                <div className={`p-1.5 border border-black rounded-none ${isActive ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  {mode.icon}
                </div>
                <div>
                  <div className="leading-tight font-bold">{mode.shortName}</div>
                  <div className={`text-[10px] hidden sm:block ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {mode.id === 'navigate' ? 'Hazards & Path' : mode.id === 'read' ? 'OCR & Signs' : mode.id === 'find' ? 'Object Radar' : mode.id === 'color' ? 'Style & Match' : 'Dialogue'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Viewport & Processing Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Visual Camera / Display Viewport (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            <div className="relative bg-zinc-100 border-2 border-black overflow-hidden shadow-[6px_6px_0px_#000] aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center rounded-none">
              
              {/* 1. Live Video Feed */}
              {cameraActive ? (
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover rounded-none"
                />
              ) : customImage ? (
                <img
                  src={customImage}
                  alt="Custom uploaded scene"
                  className="w-full h-full object-contain bg-zinc-100 rounded-none"
                />
              ) : selectedPreset ? (
                <img
                  src={selectedPreset.imageData}
                  alt={selectedPreset.title}
                  className="w-full h-full object-cover rounded-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-600">
                  <Camera className="w-12 h-12 stroke-1 mb-3 text-black" />
                  <p className="text-sm font-semibold">No camera active. Select a scenario or tap start camera.</p>
                </div>
              )}

              {/* 2. Visual Effects: Radar Scanline when Active */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="radar-sweep absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-black to-transparent shadow-[0_0_8px_rgba(0,0,0,0.6)]" />
              </div>

              {/* 3. Corner Brackets (Brutalist Tactical HUD) */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-black pointer-events-none rounded-none" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-black pointer-events-none rounded-none" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-black pointer-events-none rounded-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-black pointer-events-none rounded-none" />

              {/* 4. Target Reticle & Orientation Indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 border-2 border-dashed border-black/40 flex items-center justify-center rounded-none">
                  <div className="w-2 h-2 bg-black animate-ping rounded-none" />
                </div>
              </div>

              {/* 5. Top Bar Status Overlays */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none px-6">
                <span className="px-3 py-1 bg-white text-[11px] font-mono tracking-wider uppercase border-2 border-black text-black flex items-center gap-2 rounded-none shadow-[2px_2px_0px_#000] font-bold">
                  <span className={`w-2 h-2 rounded-none ${isAnalyzing ? 'bg-amber-500 animate-spin' : cameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-black'}`} />
                  <span>{cameraActive ? 'CAMERA LIVE' : selectedPreset ? selectedPreset.category : 'CUSTOM VIEW'}</span>
                </span>

                {autoScanEnabled && (
                  <span className="px-2.5 py-1 bg-red-600 text-[10px] font-mono tracking-widest text-white uppercase animate-pulse border-2 border-black rounded-none font-bold shadow-[2px_2px_0px_#000]">
                    AUTO-SCAN (7S)
                  </span>
                )}
              </div>

              {/* 6. Processing Loader Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-none">
                  <div className="relative w-16 h-16 mb-4 flex items-center justify-center border-2 border-black bg-white rounded-none shadow-[3px_3px_0px_#000]">
                    <Sparkles className="w-6 h-6 text-black animate-pulse" />
                  </div>
                  <span className="font-mono text-xs tracking-widest text-black uppercase font-black">
                    LUMEN IS ANALYZING SCENE...
                  </span>
                  <span className="text-[11px] text-zinc-600 mt-1 font-semibold">Checking spatial depth & hazards</span>
                </div>
              )}

              {/* 7. Bottom Viewport Controls Toolbar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 px-3 py-2 bg-white/95 backdrop-blur-md border-2 border-black z-10 rounded-none shadow-[4px_4px_0px_#000]">
                <div className="flex items-center gap-2">
                  {cameraActive ? (
                    <button
                      onClick={stopCamera}
                      className="px-3 py-1.5 bg-zinc-100 border-2 border-black text-xs font-mono font-bold text-black hover:bg-zinc-200 rounded-none"
                    >
                      PAUSE CAMERA
                    </button>
                  ) : (
                    <button
                      onClick={() => startCamera()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-mono font-bold hover:bg-zinc-800 rounded-none shadow-[2px_2px_0px_#000]"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>START CAMERA</span>
                    </button>
                  )}

                  {cameraActive && (
                    <>
                      <button
                        onClick={flipCamera}
                        className="p-1.5 bg-white border-2 border-black text-black hover:bg-zinc-100 rounded-none"
                        title="Flip Camera (Front/Rear)"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      {torchSupported && (
                        <button
                          onClick={toggleTorch}
                          className={`p-1.5 border-2 border-black rounded-none ${torchOn ? 'bg-amber-400 text-black' : 'bg-white text-black hover:bg-zinc-100'}`}
                          title="Flashlight / Torch"
                        >
                          {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border-2 border-black text-xs font-mono font-bold text-black hover:bg-zinc-100 rounded-none"
                    title="Upload photo"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">UPLOAD</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <button
                    onClick={toggleAutoScan}
                    className={`px-2.5 py-1.5 text-xs font-mono border-2 border-black rounded-none font-bold ${autoScanEnabled ? 'bg-red-600 text-white' : 'bg-white text-black hover:bg-zinc-100'}`}
                    title="Continuous scan every 7 seconds"
                  >
                    {autoScanEnabled ? 'STOP AUTO' : 'AUTO-SCAN'}
                  </button>
                </div>
              </div>

            </div>

            {/* Error Message Alert (if any) */}
            {errorMessage && (
              <div className="p-3.5 border-2 border-red-600 bg-red-50 text-red-950 text-xs flex items-center gap-2.5 rounded-none font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

            {/* Tactile Big Action Button: SCAN WITH LUMEN NOW */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleCaptureAndAnalyze()}
                disabled={isAnalyzing}
                className="sm:col-span-3 flex items-center justify-center gap-3 py-4 px-6 bg-black text-white font-display font-extrabold text-base tracking-tight uppercase hover:bg-zinc-800 transition-all border-2 border-black rounded-none shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
                <span>{isAnalyzing ? 'LUMEN IS SCANNING...' : 'SCAN SCENE NOW (SPACE)'}</span>
              </button>

              <button
                onClick={toggleListening}
                className={`flex items-center justify-center gap-2 py-4 px-4 border-2 border-black font-mono text-xs uppercase tracking-wider transition-all rounded-none shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse font-extrabold'
                    : 'bg-white text-black hover:bg-zinc-100 font-bold'
                }`}
                title="Speak to Lumen hands-free"
                aria-label="Speak your question hands-free"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'LISTENING...' : 'VOICE ASK'}</span>
              </button>
            </div>

            {/* Voice Input Query Field */}
            <div className="relative">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCaptureAndAnalyze();
                }}
                placeholder="Ask Lumen a specific question (e.g., 'Is the floor wet?', 'Read the expiration date')..."
                className="w-full bg-white border-2 border-black px-4 py-3 text-sm text-black placeholder-zinc-500 focus:outline-none focus:bg-zinc-50 transition-colors pr-24 font-mono text-xs rounded-none shadow-[3px_3px_0px_#000]"
              />
              <button
                onClick={() => handleCaptureAndAnalyze()}
                className="absolute right-2 top-2 bottom-2 px-3 bg-black hover:bg-zinc-800 text-white text-[11px] font-mono tracking-wider uppercase transition-colors rounded-none font-bold"
              >
                ASK
              </button>
            </div>

          </div>

          {/* Right Column: Spoken Audio Transcript & Waveform Controller (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Audio Waveform & Speech Controller Card */}
            <div className="p-6 bg-white border-2 border-black shadow-[5px_5px_0px_#000] relative overflow-hidden rounded-none">
              
              <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-none ${isSpeaking ? 'bg-emerald-600 animate-ping' : 'bg-black'}`} />
                  <span className="font-mono text-xs tracking-wider uppercase text-black font-extrabold">
                    LIVE VOICE AUDIO FEED
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-red-700 border border-black rounded-none shadow-[2px_2px_0px_#000]"
                      title="Barge-In: Stop Speaking Immediately"
                    >
                      <Square className="w-2.5 h-2.5 fill-current" />
                      <span>BARGE-IN STOP</span>
                    </button>
                  )}
                  
                  {!isSpeaking && spokenTranscript && (
                    <button
                      onClick={() => speakText(spokenTranscript)}
                      className="p-1.5 bg-zinc-100 border-2 border-black text-black hover:bg-zinc-200 rounded-none shadow-[2px_2px_0px_#000]"
                      title="Replay speech"
                      aria-label="Replay Lumen spoken description"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Reactive Sound Waveform Visualizer */}
              <div className="h-16 flex items-end justify-between gap-1 px-2 py-2 bg-zinc-100 border-2 border-black mb-4 rounded-none">
                {waveformBars.map((height, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${height}%` }}
                    className={`w-full rounded-none transition-all duration-75 ${
                      isSpeaking ? 'bg-black' : 'bg-zinc-300'
                    }`}
                  />
                ))}
              </div>

              {/* Mode & Timestamp Badge */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 mb-3 font-semibold">
                <span className="uppercase text-black font-bold">Mode: {lastModeUsed}</span>
                <span>Real-Time Voice Engine</span>
              </div>

              {/* Large Spoken Transcript Display (Accessible for Low Vision) */}
              <div
                aria-live="polite"
                className="bg-zinc-50 p-4 border-2 border-black min-h-[140px] flex flex-col justify-between rounded-none shadow-[3px_3px_0px_#000]"
              >
                <p className="text-black text-base sm:text-lg leading-relaxed font-sans font-medium selection:bg-black selection:text-white">
                  "{spokenTranscript}"
                </p>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/20 text-xs text-zinc-600 font-semibold">
                  <span className="font-mono text-[10px] text-zinc-600">
                    Friendly conversational guide
                  </span>
                  <button
                    onClick={handleCopyTranscript}
                    className="flex items-center gap-1 hover:text-black font-mono text-[11px] transition-colors font-bold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Voice Suggestions Chips */}
            <div className="p-4 border-2 border-black bg-white rounded-none shadow-[4px_4px_0px_#000]">
              <span className="text-[11px] font-mono tracking-widest text-zinc-700 uppercase block mb-2.5 font-bold">
                QUICK SPOKEN COMMANDS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'What is 3 steps ahead?',
                  'Read the warning label',
                  'Where are my keys?',
                  'Is the path flat?',
                  'Describe the clothing colors',
                ].map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setUserQuery(cmd);
                      handleCaptureAndAnalyze(cmd);
                    }}
                    className="px-2.5 py-1.5 bg-white border border-black hover:bg-zinc-100 text-black text-xs font-mono transition-all rounded-none font-bold shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                  >
                    "{cmd}"
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Section 4: Interactive Preset Scenario Gallery */}
        <div className="mt-16 pt-12 border-t-2 border-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
              <span className="text-xs font-mono tracking-widest text-zinc-600 uppercase block mb-1 font-bold">
                DEMO TESTBENCH
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-black tracking-tight uppercase">
                TEST PRESET LIVING SCENARIOS
              </h3>
            </div>
            <p className="text-xs font-mono text-zinc-600 font-medium">
              Click any scenario to immediately test Lumen's vision & voice without using a camera.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {PRESET_SCENARIOS.map((preset) => {
              const isSelected = selectedPreset?.id === preset.id && !cameraActive && !customImage;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`group text-left p-3.5 border-2 border-black transition-all flex flex-col justify-between rounded-none shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                    isSelected
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-zinc-100'
                  }`}
                >
                  <div className="aspect-[3/2] w-full overflow-hidden mb-3 border-2 border-black bg-zinc-100 rounded-none">
                    <img
                      src={preset.imageData}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform rounded-none"
                    />
                  </div>
                  <div>
                    <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 font-bold ${isSelected ? 'text-zinc-300' : 'text-zinc-600'}`}>
                      {preset.category}
                    </span>
                    <h4 className="font-display font-black text-sm leading-snug mb-1">
                      {preset.title}
                    </h4>
                    <p className={`text-[11px] line-clamp-2 font-medium ${isSelected ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      {preset.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-current/20 flex items-center justify-between text-[11px] font-mono font-bold">
                    <span>TEST MODE</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
