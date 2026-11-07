import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'HOW DOES SECONDSIGHT PROVIDE REAL-TIME SPATIAL ORIENTATION?',
      a: 'SecondSight processes camera frames through intelligent visual perception algorithms trained on spatial geometry, depth, and obstacle classification. It translates visual cues into intuitive clock-face coordinates (for example: "Doorway at 12 o\'clock, low table at 2 o\'clock"), allowing users with low vision to mentally map the room ahead.'
    },
    {
      q: 'WHAT IS CONVERSATIONAL BARGE-IN AND WHY DOES IT MATTER?',
      a: 'Traditional screen readers force users to wait until an entire paragraph finishes playing. SecondSight implements instant conversational barge-in. When you begin speaking or tap the screen, the voice stream drops in milliseconds, creating a natural back-and-forth dialogue.'
    },
    {
      q: 'ARE CAMERA FEEDS OR CONVERSATIONS SAVED ON SERVERS?',
      a: 'Never. SecondSight processes frames ephemerally in volatile memory. No video streams, photographs, or voice interactions are stored on disk or used for external model training.'
    },
    {
      q: 'HOW CAN I TEST SECONDSIGHT IF I AM ON A LAPTOP WITHOUT A MOBILE CAMERA?',
      a: 'SecondSight features a built-in Interactive Demo Testbench containing 5 realistic living scenarios (Staircase Hazards, Prescription Medicine Labels, Lost Keys, Wardrobe Colors, and Crosswalk Safety). You can click any scenario to experience full visual reasoning and natural voice narration instantly.'
    },
    {
      q: 'HOW DOES SECONDSIGHT PROTECT API SECRETS AND PRIVACY?',
      a: 'The frontend client never handles or stores sensitive access credentials. All requests are securely processed and verified through an isolated backend proxy server, eliminating credential exposure and protecting your privacy.'
    }
  ];

  return (
    <section className="py-16 sm:py-24 border-b-2 border-black bg-zinc-50 rounded-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 sm:mb-16">
          <div className="text-xs font-mono tracking-widest text-zinc-600 uppercase mb-2 flex items-center justify-center gap-2 font-bold">
            <span className="w-2 h-2 bg-black rounded-none"></span>
            <span>TRANSPARENCY & ASSISTANCE</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-black tracking-tight uppercase">
            EVERYTHING YOU MIGHT ASK BEFORE YOU USE.
          </h2>
        </div>

        <div className="divide-y-2 divide-black border-y-2 border-black">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-6">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left group focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-extrabold text-base sm:text-lg text-black group-hover:underline tracking-tight uppercase pr-4">
                    {faq.q}
                  </span>
                  <div className={`p-2 border-2 border-black transition-colors shrink-0 rounded-none shadow-[2px_2px_0px_#000] ${isOpen ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 text-zinc-800 text-sm sm:text-base leading-relaxed font-medium animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
