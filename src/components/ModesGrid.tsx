import React from 'react';
import { Compass, FileText, Search, Palette, ArrowUpRight } from 'lucide-react';

interface ModesGridProps {
  onSelectMode: (mode: 'navigate' | 'read' | 'find' | 'color') => void;
}

export const ModesGrid: React.FC<ModesGridProps> = ({ onSelectMode }) => {
  const modes = [
    {
      id: 'navigate' as const,
      num: '01',
      title: 'SPATIAL & HAZARD NAVIGATOR',
      subtitle: 'Footing, clearance & depth',
      desc: 'Detects upcoming steps, drop-offs, doorways, low hanging overhangs, and walking clearance. Gives reassuring clock-direction spatial guidance.',
      icon: <Compass className="w-5 h-5" />,
      features: ['Curbs & stair detection', 'Doorways & walking clearances', 'Clock-face direction cues'],
    },
    {
      id: 'read' as const,
      num: '02',
      title: 'INSTANT OCR & DOCUMENT READER',
      subtitle: 'Prescriptions, mail & street signs',
      desc: 'Instantly transcribes and reads out labels, medication schedules, restaurant menus, and street nameplates in high-clarity natural spoken English.',
      icon: <FileText className="w-5 h-5" />,
      features: ['Dosage & expiration summaries', 'Multi-column menu parsing', 'Smart blur correction cues'],
    },
    {
      id: 'find' as const,
      num: '03',
      title: 'PRECISION OBJECT & ITEM RADAR',
      subtitle: 'Misplaced keys, phones & mugs',
      desc: 'Pan your phone around a room and hear immediate spatial guidance to find personal belongings. "Your keys are at 10 o\'clock, one arm-length away."',
      icon: <Search className="w-5 h-5" />,
      features: ['Real-time object localization', 'Estimated distance in paces/meters', 'Audio sonar cues'],
    },
    {
      id: 'color' as const,
      num: '04',
      title: 'COLOR & WARDROBE STYLIST',
      subtitle: 'Garment textures & shade matching',
      desc: 'Examines fabric colors, textures, patterns, and lighting. Confirms whether navy pants complement your grey knit sweater with respectful, friendly advice.',
      icon: <Palette className="w-5 h-5" />,
      features: ['Nuanced color recognition', 'Pattern & fabric textures', 'Complementary outfit advice'],
    },
  ];

  return (
    <section id="modes" className="py-16 sm:py-24 border-b-2 border-black bg-white rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12 sm:mb-16">
          <div className="text-xs font-mono tracking-widest text-zinc-600 uppercase mb-2 flex items-center gap-2 font-bold">
            <span className="w-2 h-2 bg-black rounded-none"></span>
            <span>CAPABILITIES SYSTEM</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-black tracking-tight uppercase max-w-4xl leading-[1.08]">
            FOUR ASSISTIVE MODES FOR INDEPENDENT LIVING.
          </h2>
        </div>

        {/* 4 Cards Grid (Sharp rectangular cards with 2px solid black border and shadow) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {modes.map((item) => (
            <div
              key={item.id}
              className="group p-6 bg-white border-2 border-black hover:bg-zinc-50 transition-all flex flex-col justify-between rounded-none shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000]"
            >
              <div>
                {/* Header with Num & Icon */}
                <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-6">
                  <span className="font-mono text-sm tracking-wider text-black font-extrabold">
                    [{item.num}]
                  </span>
                  <div className="p-2 bg-black text-white rounded-none border border-black group-hover:bg-white group-hover:text-black transition-colors">
                    {item.icon}
                  </div>
                </div>

                <div className="text-[11px] font-mono tracking-wider uppercase text-zinc-600 mb-1 font-bold">
                  {item.subtitle}
                </div>
                <h3 className="font-display font-black text-xl text-black tracking-tight uppercase mb-3">
                  {item.title}
                </h3>
                <p className="text-zinc-700 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                  {item.desc}
                </p>

                {/* Feature Pills */}
                <div className="space-y-2 mb-6">
                  {item.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs font-mono text-black font-semibold">
                      <span className="w-1.5 h-1.5 bg-black rounded-none"></span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <a
                href="#viewfinder"
                onClick={() => onSelectMode(item.id)}
                className="pt-4 border-t-2 border-black flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-black group-hover:underline"
              >
                <span>ACTIVATE THIS MODE</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
