import React from 'react';
import { Volume2, Zap, Radio, Shield, HeartHandshake } from 'lucide-react';

export const SpeechPillars: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 border-b-2 border-black bg-white rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (5 cols) */}
          <div className="lg:col-span-5">
            <div className="text-xs font-mono tracking-widest text-zinc-600 uppercase mb-2 flex items-center gap-2 font-bold">
              <span className="w-2 h-2 bg-black rounded-none"></span>
              <span>ACOUSTIC INTELLIGENCE</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-black tracking-tight uppercase leading-[1.08] mb-6">
              SPEECH THAT FEELS LIKE A REAL COMPANION.
            </h2>
            <p className="text-zinc-700 text-sm sm:text-base leading-relaxed mb-8 font-medium">
              Assistive voice tools frequently fail because they sound robotic, lag behind reality, or refuse to stop talking when you need them to. 
              SecondSight leverages <strong className="text-black font-extrabold underline decoration-2">next-generation conversational voice technology</strong> to deliver fluid, respectful speech engineered for high-stakes real-world navigation.
            </p>

            <div className="p-5 border-2 border-black bg-zinc-50 flex items-center gap-4 rounded-none shadow-[4px_4px_0px_#000]">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold text-lg shrink-0 rounded-none border border-black">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-black text-sm text-black uppercase">
                  Empathetic Personality
                </h4>
                <p className="text-xs text-zinc-700 mt-0.5 font-medium">
                  Lumen's tone is patient, clear, and reassuring, prioritizing your physical safety without alarmist speech.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Architecture Feature Pillars (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-6 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_#000]">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 mb-2 uppercase font-bold">
                <Zap className="w-4 h-4 text-black" />
                <span>Sub-100ms Streaming TTFB</span>
              </div>
              <h3 className="font-display font-black text-lg text-black uppercase mb-2">
                Real-Time Audio Latency
              </h3>
              <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                When walking toward an obstacle, a 2-second delay is dangerous. SecondSight streams synthesized speech instantly as visual cues are processed.
              </p>
            </div>

            <div className="p-6 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_#000]">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 mb-2 uppercase font-bold">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>Zero-Lag Interruption</span>
              </div>
              <h3 className="font-display font-black text-lg text-black uppercase mb-2">
                Conversational Barge-In
              </h3>
              <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                Need Lumen to stop? Simply speak or tap anywhere on your screen. The active audio stream cuts off instantaneously without resetting the session.
              </p>
            </div>

            <div className="p-6 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_#000]">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 mb-2 uppercase font-bold">
                <Volume2 className="w-4 h-4 text-black" />
                <span>Acoustic Clarity</span>
              </div>
              <h3 className="font-display font-black text-lg text-black uppercase mb-2">
                High-Fidelity Enunciation
              </h3>
              <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                Complex dosage words (like "Amoxicillin 500mg") and directional markers are pronounced with precision, ensuring absolute clarity in noisy outdoor environments.
              </p>
            </div>

            <div className="p-6 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_#000]">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 mb-2 uppercase font-bold">
                <Shield className="w-4 h-4 text-black" />
                <span>Local Audio Fallback</span>
              </div>
              <h3 className="font-display font-black text-lg text-black uppercase mb-2">
                100% Guaranteed Uptime
              </h3>
              <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                If cellular connectivity drops, SecondSight seamlessly activates on-device browser speech synthesis so you are never left without guidance.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
