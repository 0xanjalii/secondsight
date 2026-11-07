import React from 'react';
import { Eye, Volume2, VolumeX, Sun, Sparkles, Radio } from 'lucide-react';

interface NavbarProps {
  isVoiceActive: boolean;
  onToggleVoice: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  isPlayingAudio: boolean;
  onStopAudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isVoiceActive,
  onToggleVoice,
  isHighContrast,
  onToggleHighContrast,
  isPlayingAudio,
  onStopAudio,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b-2 border-black transition-colors rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Companion Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a href="#" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-black p-1 rounded-none">
            <div className="relative w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xl rounded-none transition-transform group-hover:scale-105 border border-black">
              <Eye className="w-6 h-6 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border border-black animate-pulse rounded-none" />
            </div>
            <div>
              <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-black block leading-none">
                SECONDSIGHT
              </span>
              <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase flex items-center gap-1.5 mt-1 font-semibold">
                <span className="w-1.5 h-1.5 bg-emerald-500 inline-block animate-ping rounded-none"></span>
                GUIDED BY LUMEN
              </span>
            </div>
          </a>
        </div>

        {/* Action Controls & Accessibility Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Barge-in Stop Audio Button (Visible when speaking) */}
          {isPlayingAudio && (
            <button
              onClick={onStopAudio}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-xs font-mono font-bold tracking-wider uppercase animate-pulse hover:bg-red-700 transition-colors border border-black rounded-none shadow-[2px_2px_0px_#000]"
              title="Interrupt speech (Barge-in)"
              aria-label="Stop audio speech immediately"
            >
              <Radio className="w-3.5 h-3.5 animate-spin" />
              <span>INTERRUPT</span>
            </button>
          )}

          {/* Voice Output Toggle */}
          <button
            onClick={onToggleVoice}
            className={`p-2.5 sm:px-3 sm:py-2 border-2 border-black text-xs font-mono font-bold flex items-center gap-2 transition-all rounded-none shadow-[2px_2px_0px_#000] ${
              isVoiceActive
                ? 'bg-black text-white'
                : 'bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
            aria-label={isVoiceActive ? 'Voice narration active' : 'Voice narration muted'}
            title={isVoiceActive ? 'Mute Lumen voice' : 'Enable Lumen voice'}
          >
            {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isVoiceActive ? 'VOICE ON' : 'MUTED'}</span>
          </button>

          {/* High Contrast Accessibility Toggle */}
          <button
            onClick={onToggleHighContrast}
            className={`p-2.5 sm:px-3 sm:py-2 border-2 border-black text-xs font-mono font-bold flex items-center gap-2 transition-all rounded-none shadow-[2px_2px_0px_#000] ${
              isHighContrast
                ? 'bg-black text-white'
                : 'bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
            aria-label="Toggle High-Contrast Display Mode"
            title="Toggle High-Contrast WCAG Mode"
          >
            <Sun className="w-4 h-4" />
            <span className="hidden sm:inline">{isHighContrast ? 'HIGH CONTRAST' : 'STANDARD'}</span>
          </button>

          {/* Jump to Viewfinder Quick Action */}
          <a
            href="#viewfinder"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-display font-bold text-xs tracking-wider uppercase hover:bg-zinc-800 transition-colors rounded-none border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>OPEN VIEWFINDER</span>
          </a>

        </div>

      </div>
    </header>
  );
};
