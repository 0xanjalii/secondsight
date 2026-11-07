import React from 'react';
import { Eye, Heart, ArrowUp } from 'lucide-react';

interface FooterProps {
  onSelectMode?: (mode: 'navigate' | 'read' | 'find' | 'color' | 'general') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectMode }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModeClick = (mode: 'navigate' | 'read' | 'find' | 'color' | 'general') => {
    if (onSelectMode) {
      onSelectMode(mode);
    }
  };

  return (
    <footer className="bg-white text-black pt-16 pb-12 border-t-2 border-black rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b-2 border-black">
          
          {/* Brand Info (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black rounded-none border border-black">
                  <Eye className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="font-display font-black text-2xl tracking-tight text-black uppercase">
                  SECONDSIGHT
                </span>
              </div>
              <p className="text-zinc-700 text-xs sm:text-sm leading-relaxed max-w-sm mb-6 font-medium">
                An intelligent, high-contrast visual companion engineered for blind and low-vision individuals. 
                Powered by Lumen conversational visual & voice guidance.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-600 font-bold">
              <span>DESIGNED WITH RESPECT & CARE</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-black font-extrabold">
                <Heart className="w-3.5 h-3.5 text-red-600 fill-current" /> ACCESSIBLE FOR ALL
              </span>
            </div>
          </div>

          {/* Core Modules (3 cols) */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-mono tracking-widest text-zinc-600 uppercase mb-4 font-extrabold">
              ASSISTIVE MODULES
            </h4>
            <ul className="space-y-2 text-xs font-mono font-bold text-black">
              <li><a href="#viewfinder" onClick={() => handleModeClick('navigate')} className="hover:underline">01. Spatial & Hazard Navigator</a></li>
              <li><a href="#viewfinder" onClick={() => handleModeClick('read')} className="hover:underline">02. Instant OCR Document Reader</a></li>
              <li><a href="#viewfinder" onClick={() => handleModeClick('find')} className="hover:underline">03. Object & Item Locator</a></li>
              <li><a href="#viewfinder" onClick={() => handleModeClick('color')} className="hover:underline">04. Color & Wardrobe Matcher</a></li>
              <li><a href="#viewfinder" onClick={() => handleModeClick('general')} className="hover:underline">05. Conversational Co-Pilot</a></li>
            </ul>
          </div>

          {/* Architecture & Audio Engine (4 cols) */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-mono tracking-widest text-zinc-600 uppercase mb-4 font-extrabold">
              AUDIO & VISION STACK
            </h4>
            <div className="space-y-2.5">
              <div className="p-3 bg-zinc-50 border-2 border-black flex items-center justify-between text-xs font-mono rounded-none shadow-[2px_2px_0px_#000]">
                <span className="text-zinc-600 font-bold">Speech Engine</span>
                <span className="text-black font-extrabold">Ultra-Low Latency Voice</span>
              </div>
              <div className="p-3 bg-zinc-50 border-2 border-black flex items-center justify-between text-xs font-mono rounded-none shadow-[2px_2px_0px_#000]">
                <span className="text-zinc-600 font-bold">Spatial Intelligence</span>
                <span className="text-black font-extrabold">Real-Time Environment Scan</span>
              </div>
              <div className="p-3 bg-zinc-50 border-2 border-black flex items-center justify-between text-xs font-mono rounded-none shadow-[2px_2px_0px_#000]">
                <span className="text-zinc-600 font-bold">Interruption Latency</span>
                <span className="text-emerald-700 font-extrabold">&lt; 100ms Barge-In</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-600 font-semibold">
          <div>
            © {new Date().getFullYear()} SECONDSIGHT. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-black font-bold">
              <span className="w-2 h-2 bg-emerald-600 inline-block rounded-none"></span>
              ALL SYSTEMS ONLINE
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-black transition-colors p-1 font-bold"
              aria-label="Back to top"
            >
              <span>BACK TO TOP</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
