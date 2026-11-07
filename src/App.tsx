import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LiveViewfinder, AssistiveMode } from './components/LiveViewfinder';
import { ModesGrid } from './components/ModesGrid';
import { ThreeSteps } from './components/ThreeSteps';
import { SpeechPillars } from './components/SpeechPillars';
import { FaqAccordion } from './components/FaqAccordion';
import { Footer } from './components/Footer';
import { audioController } from './utils/audioPlayer';
import { Camera, Volume2, VolumeX, Square } from 'lucide-react';

export const App: React.FC = () => {
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(true);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<AssistiveMode>('navigate');

  // Keyboard accessibility listeners (Space to scan, Escape to stop audio)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user presses Escape, trigger instant audio barge-in
      if (e.key === 'Escape') {
        audioController.stop();
        setIsPlayingAudio(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleVoice = () => {
    const next = !isVoiceActive;
    setIsVoiceActive(next);
    if (!next) {
      audioController.stop();
      setIsPlayingAudio(false);
    }
  };

  const handleStopAudio = () => {
    audioController.stop();
    setIsPlayingAudio(false);
  };

  const scrollToViewfinder = () => {
    const el = document.getElementById('viewfinder');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectModeAndScroll = (mode: AssistiveMode) => {
    setActiveMode(mode);
    scrollToViewfinder();
  };

  return (
    <div className={`min-h-screen bg-white text-black rounded-none ${isHighContrast ? 'high-contrast' : ''}`}>
      
      {/* Top Navigation */}
      <Navbar
        isVoiceActive={isVoiceActive}
        onToggleVoice={handleToggleVoice}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        isPlayingAudio={isPlayingAudio}
        onStopAudio={handleStopAudio}
      />

      {/* Main Content Layout */}
      <main id="main-content" className="pb-24 sm:pb-0 rounded-none">
        <HeroSection onActivateCamera={scrollToViewfinder} />
        
        <LiveViewfinder
          isVoiceEnabled={isVoiceActive}
          isHighContrast={isHighContrast}
          onAudioPlayingChange={setIsPlayingAudio}
          selectedMode={activeMode}
          onModeChange={setActiveMode}
        />

        <ModesGrid onSelectMode={handleSelectModeAndScroll} />
        <ThreeSteps />
        <SpeechPillars />
        <FaqAccordion />
      </main>

      {/* Footer */}
      <Footer onSelectMode={handleSelectModeAndScroll} />

      {/* Floating Mobile Accessible Navigation Bar (Visible on mobile screens, sharp brutalist rectangle) */}
      <div className="fixed bottom-4 left-4 right-4 sm:hidden z-50 rounded-none">
        <div className="bg-white/95 backdrop-blur-lg border-2 border-black p-2.5 flex items-center justify-between shadow-[4px_4px_0px_#000] rounded-none">
          <button
            onClick={scrollToViewfinder}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-black text-white font-display font-extrabold text-xs uppercase tracking-tight active:scale-95 transition-transform rounded-none border border-black shadow-[2px_2px_0px_#000]"
          >
            <Camera className="w-4 h-4 stroke-[2.5]" />
            <span>VIEWFINDER</span>
          </button>

          {isPlayingAudio && (
            <button
              onClick={handleStopAudio}
              className="ml-2 p-2.5 bg-red-600 text-white font-mono text-xs flex items-center justify-center animate-pulse rounded-none border border-black"
              title="Stop audio"
              aria-label="Stop audio immediately"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={handleToggleVoice}
            className="ml-2 p-2.5 bg-white border-2 border-black text-black hover:bg-zinc-100 rounded-none"
            title="Toggle voice"
            aria-label="Toggle voice output"
          >
            {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

    </div>
  );
};

export default App;
