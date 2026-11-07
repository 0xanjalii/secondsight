import React from 'react';
import { Camera, Compass, Volume2, ShieldCheck, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onActivateCamera: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onActivateCamera }) => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b-2 border-black bg-white overflow-hidden rounded-none">
      
      {/* Background Subtle Dot Grid Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Sub-Header Pill (Sharp Rectangle) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border-2 border-black bg-black text-white mb-6 sm:mb-8 text-xs font-mono tracking-widest uppercase rounded-none shadow-[3px_3px_0px_#00000020]">
          <span className="w-2 h-2 bg-white animate-pulse rounded-none" />
          <span>INDEPENDENT LIVING • REAL-TIME VOICE GUIDANCE</span>
        </div>

        {/* Main Editorial Headline (Brutalist / Modern Grotesque) */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tighter text-black uppercase leading-[1.05] max-w-5xl mb-6">
          YOUR EYES WHEN YOU NEED THEM.<br className="hidden sm:inline" />
          <span className="text-zinc-500"> YOUR VOICE ALWAYS.</span>
        </h1>

        {/* Supporting Description with Friendly, Empathetic Tone */}
        <p className="text-base sm:text-xl text-zinc-800 max-w-3xl leading-relaxed mb-10 font-medium">
          SecondSight turns your smartphone into a warm, alert visual companion named <strong className="text-black font-extrabold underline decoration-2">Lumen</strong>. 
          By pairing instant scene perception with <strong className="text-black font-bold">warm, natural spoken voice guidance</strong>, 
          it whispers immediate spatial awareness, reads medication labels, finds misplaced items, and answers questions with conversational fluidity.
        </p>

        {/* Call to Actions (Sharp rectangular buttons with brutalist drop-shadows) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-14">
          <button
            onClick={onActivateCamera}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-black text-white font-display font-extrabold text-base sm:text-lg tracking-tight uppercase hover:bg-zinc-800 transition-all border-2 border-black rounded-none shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            aria-label="Launch Lumen Live Viewfinder"
          >
            <Camera className="w-5 h-5 stroke-[2.5]" />
            <span>LAUNCH LIVE VIEWFINDER</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <a
            href="#modes"
            className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-black bg-white hover:bg-zinc-100 text-black font-mono font-bold text-sm tracking-wide transition-all rounded-none shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Compass className="w-4 h-4 text-zinc-700" />
            <span>EXPLORE ASSISTIVE MODES</span>
          </a>
        </div>

        {/* Editorial Feature Metrics Grid (Sharp white rectangular boxes) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t-2 border-black">
          
          <div className="p-5 border-2 border-black bg-white rounded-none shadow-[3px_3px_0px_#000]">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 mb-1 uppercase font-bold">
              <Volume2 className="w-3.5 h-3.5 text-black" />
              <span>Response Latency</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-black">&lt; 100ms</div>
            <p className="text-[11px] text-zinc-600 mt-1 font-medium">Instant real-time voice response</p>
          </div>

          <div className="p-5 border-2 border-black bg-white rounded-none shadow-[3px_3px_0px_#000]">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 mb-1 uppercase font-bold">
              <span className="w-2 h-2 bg-emerald-600 inline-block rounded-none"></span>
              <span>Barge-In Control</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-black">Instant</div>
            <p className="text-[11px] text-zinc-600 mt-1 font-medium">Interrupt Lumen mid-speech with zero delay</p>
          </div>

          <div className="p-5 border-2 border-black bg-white rounded-none shadow-[3px_3px_0px_#000]">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 mb-1 uppercase font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>Privacy Shield</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-black">100% Secure</div>
            <p className="text-[11px] text-zinc-600 mt-1 font-medium">Zero secrets exposed to client browsers</p>
          </div>

          <div className="p-5 border-2 border-black bg-white rounded-none shadow-[3px_3px_0px_#000]">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 mb-1 uppercase font-bold">
              <span className="w-2 h-2 bg-black inline-block rounded-none"></span>
              <span>Accessibility</span>
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-black">WCAG AAA</div>
            <p className="text-[11px] text-zinc-600 mt-1 font-medium">Haptics, screen reader live regions & audio cues</p>
          </div>

        </div>

      </div>
    </section>
  );
};
