import React from 'react';
import { Camera, Cpu, Volume2 } from 'lucide-react';

export const ThreeSteps: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'STREAM & ORIENT',
      desc: 'Point your mobile camera towards any pathway, doorway, document, or room. SecondSight works seamlessly on both mobile rear cameras and desktop webcams.',
      icon: <Camera className="w-6 h-6" />,
      detail: 'Ultra-low frame latency with auto-torch for night navigation',
    },
    {
      num: '02',
      title: 'INTELLIGENT SPATIAL REASONING',
      desc: 'Lumen processes physical boundaries, depth, text content, and potential drop-offs in parallel, formatting guidance into natural clock directions.',
      icon: <Cpu className="w-6 h-6" />,
      detail: 'Zero personal data stored; private on-device processing',
    },
    {
      num: '03',
      title: 'EXPRESSIVE NATURAL VOICE',
      desc: 'Guidance streams in clear, lifelike spoken voice. Warm, reassuring, and instantly interruptible whenever you speak or tap.',
      icon: <Volume2 className="w-6 h-6" />,
      detail: 'Sub-100ms playback with live reactive waveform synchronization',
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-b-2 border-black bg-zinc-50 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div>
            <div className="text-xs font-mono tracking-widest text-zinc-600 uppercase mb-2 flex items-center gap-2 font-bold">
              <span className="w-2 h-2 bg-black rounded-none"></span>
              <span>HOW IT OPERATES</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-black tracking-tight uppercase max-w-2xl leading-[1.08]">
              THREE STEPS FROM CAMERA VIEW TO A VOICE YOU TRUST.
            </h2>
          </div>
          <p className="text-zinc-700 text-sm max-w-sm font-medium">
            Engineered specifically for low-vision and blind users where every fraction of a second matters.
          </p>
        </div>

        {/* Steps Grid (Sharp rectangular cards with 2px solid black border and shadow) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-8 bg-white border-2 border-black hover:bg-zinc-100 transition-all flex flex-col justify-between rounded-none shadow-[5px_5px_0px_#000]"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b-2 border-black mb-6">
                  <span className="font-display font-black text-4xl text-black">
                    {step.num}
                  </span>
                  <div className="p-3 bg-black text-white border border-black rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
                    {step.icon}
                  </div>
                </div>

                <h3 className="font-display font-black text-xl text-black tracking-tight uppercase mb-3">
                  {step.title}
                </h3>
                <p className="text-zinc-700 text-sm leading-relaxed mb-6 font-medium">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t-2 border-black text-xs font-mono text-black flex items-center gap-2 font-bold">
                <span className="w-2 h-2 bg-emerald-600 rounded-none"></span>
                <span>{step.detail}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
