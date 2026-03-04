"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";

interface PageProps {
  index: number;
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Page = ({ index, frontContent, backContent, progress, range }: PageProps) => {
  // Rotate from 0 to -180 degrees based on scroll progress
  const rotateY = useTransform(progress, range, [0, -180]);
  
  // Add some spring physics to the rotation for "heft"
  const smoothRotate = useSpring(rotateY, { stiffness: 100, damping: 20 });

  // Dynamic Z-Index: When page is on right (unflipped), earlier pages are on top.
  // When page is on left (flipped), later pages are on top.
  const midpoint = (range[0] + range[1]) / 2;
  const zIndex = useTransform(progress, (p) => {
    return p < midpoint ? 50 - index : 50 + index;
  });

  return (
    <motion.div
      style={{ 
        rotateY: smoothRotate, 
        transformStyle: "preserve-3d",
        zIndex // Lower pages below
      }}
      className="absolute inset-0 w-full h-full origin-left"
    >
      {/* Front Face */}
      <div 
        className="absolute inset-0 backface-hidden bg-[#fdfbf7] dark:bg-[#1a1a1a] border-r border-neutral-200 dark:border-neutral-800 shadow-inner flex flex-col p-8 md:p-12 overflow-hidden"
        style={{ backfaceVisibility: "hidden" }}
      >
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply dark:mix-blend-overlay"></div>
        
        {/* Spine gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-neutral-300/20 to-transparent pointer-events-none z-10"></div>
        
        <div className="relative z-0 h-full">
           {frontContent}
        </div>
        
        {/* Page Number */}
        <div className="absolute bottom-6 right-6 text-xs text-neutral-400 font-mono tracking-widest opacity-50">
          {index * 2 + 1}
        </div>
      </div>

      {/* Back Face */}
      <div 
        className="absolute inset-0 backface-hidden bg-[#fdfbf7] dark:bg-[#1a1a1a] border-l border-neutral-200 dark:border-neutral-800 shadow-inner flex flex-col p-8 md:p-12 overflow-hidden"
        style={{ 
          transform: "rotateY(180deg)",
          backfaceVisibility: "hidden" 
        }}
      >
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply dark:mix-blend-overlay"></div>
        
        {/* Spine gradient (on right side for back page) */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-neutral-300/20 to-transparent pointer-events-none z-10"></div>

        <div className="relative z-0 h-full">
           {backContent}
        </div>

        {/* Page Number */}
        <div className="absolute bottom-6 left-6 text-xs text-neutral-400 font-mono tracking-widest opacity-50">
          {index * 2 + 2}
        </div>
      </div>
    </motion.div>
  );
};

export default function JourneyBook() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate cover rotation
  // 0-0.2: Book closed, centered
  // 0.2-0.8: Pages flipping
  // 0.8-1.0: Book closed (back), maybe move away?

  // Let's refine the ranges for 4 "milestones"
  // Milestone 1 (Author): 0.1 - 0.25
  // Milestone 2 (Philosophy): 0.3 - 0.45
  // Milestone 3 (Skills): 0.5 - 0.65
  // Milestone 4 (Journey): 0.7 - 0.85
  
  // Transform the book container position slightly based on scroll
  const bookScale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  const bookY = useTransform(scrollYProgress, [0, 1], [100, -100]); // subtle parallax

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-neutral-100 dark:bg-black">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden perspective-[2000px]">
        
        {/* Ambient Light/Shadow */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-neutral-500/5 to-transparent z-0" />

        <motion.div 
          style={{ scale: bookScale, y: bookY }}
          className="relative w-[300px] h-[440px] md:w-[450px] md:h-[600px] preserve-3d"
        >
          {/* Back Cover (Static Base) */}
          <div className="absolute inset-0 bg-[#111] rounded-r-lg shadow-2xl border-l-[16px] border-neutral-800 z-0 transform translate-z-[-2px]"></div>

          {/* Pages Stack */}
          
          {/* Page 3: Journey / End */}
          <Page 
            index={2}
            range={[0.65, 0.85]}
            progress={scrollYProgress}
            frontContent={
              <div className="h-full flex flex-col justify-center space-y-6">
                 <h3 className="text-2xl font-bold font-serif text-amber-600 dark:text-amber-500">The Path Forward</h3>
                 <div className="space-y-4 text-sm md:text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <p>Continuing to push the boundaries of web interaction.</p>
                    <ul className="list-disc pl-4 space-y-2 marker:text-amber-500">
                      <li>Expanding into WebGL & 3D</li>
                      <li>Open Source Contributions</li>
                      <li>Building "OpenClaw"</li>
                    </ul>
                 </div>
              </div>
            }
            backContent={
               <div className="h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900/50">
                  <div className="text-center">
                    <div className="w-16 h-16 border-2 border-amber-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                       <span className="text-2xl">⚡</span>
                    </div>
                    <p className="font-mono text-xs uppercase tracking-widest opacity-60">End of Chapter 1</p>
                  </div>
               </div>
            }
          />

          {/* Page 2: Skills / Craft */}
          <Page 
            index={1}
            range={[0.45, 0.65]}
            progress={scrollYProgress}
            frontContent={
              <div className="h-full flex flex-col">
                 <div className="border-b border-amber-500/30 pb-4 mb-6">
                    <h3 className="text-xl font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-200">Arsenal</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <h4 className="text-xs font-mono text-amber-600">Core</h4>
                       <p className="text-sm font-semibold">React, Next.js</p>
                       <p className="text-sm font-semibold">TypeScript</p>
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-xs font-mono text-amber-600">Style</h4>
                       <p className="text-sm font-semibold">Tailwind CSS</p>
                       <p className="text-sm font-semibold">Framer Motion</p>
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-xs font-mono text-amber-600">Backend</h4>
                       <p className="text-sm font-semibold">Node.js</p>
                       <p className="text-sm font-semibold">Supabase</p>
                    </div>
                 </div>
              </div>
            }
            backContent={
               <div className="h-full flex items-center justify-center">
                  <div className="w-full h-full border border-dashed border-neutral-300 dark:border-neutral-700 rounded p-4 flex items-center justify-center">
                     <p className="font-serif italic text-neutral-400 text-center">"Tools are just extensions of the mind."</p>
                  </div>
               </div>
            }
          />

          {/* Page 1: Philosophy */}
          <Page 
            index={0}
            range={[0.25, 0.45]}
            progress={scrollYProgress}
            frontContent={
              <div className="h-full flex flex-col justify-between">
                 <div>
                    <h3 className="text-3xl font-serif font-bold mb-4 text-neutral-900 dark:text-white">Philosophy</h3>
                    <p className="text-lg italic text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      "At the intersection of code and craft."
                    </p>
                 </div>
                 <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    <p className="mb-4">It's not just about making it work. It's about making it feel right.</p>
                 </div>
              </div>
            }
            backContent={
               <div className="h-full relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent"></div>
                  <div className="h-full flex items-center justify-center">
                      <span className="font-mono text-6xl opacity-10 font-bold">01</span>
                  </div>
               </div>
            }
          />

          {/* Cover */}
          <motion.div
            style={{ 
              rotateY: useTransform(scrollYProgress, [0, 0.25], [0, -180]),
              zIndex: 100 
            }}
            className="absolute inset-0 w-full h-full origin-left preserve-3d"
          >
             {/* Front Cover */}
             <div className="absolute inset-0 backface-hidden bg-[#111] flex flex-col items-center justify-center text-white border-r border-neutral-700 shadow-2xl"
               style={{ backfaceVisibility: "hidden" }}
             >
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-neutral-800 to-transparent"></div>
                <div className="border border-amber-500/50 p-8 w-[80%] h-[80%] flex flex-col items-center justify-center relative">
                   <div className="absolute top-2 left-2 w-2 h-2 bg-amber-500 rounded-full"></div>
                   <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full"></div>
                   <div className="absolute bottom-2 left-2 w-2 h-2 bg-amber-500 rounded-full"></div>
                   <div className="absolute bottom-2 right-2 w-2 h-2 bg-amber-500 rounded-full"></div>
                   
                   <h1 className="text-4xl font-serif font-bold text-center mb-2 tracking-wider text-amber-100">ARCHIVE</h1>
                   <p className="text-xs font-mono uppercase tracking-[0.3em] text-amber-500/80">Vol. 1 — The Beginning</p>
                </div>
             </div>

             {/* Inside Front Cover */}
             <div className="absolute inset-0 backface-hidden bg-[#fdfbf7] dark:bg-[#1a1a1a] shadow-inner p-10 flex flex-col justify-center"
               style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
             >
                <p className="font-serif italic text-neutral-500 text-center text-sm">
                   "A digital artifact documenting the journey of a creator."
                </p>
                <div className="mt-8 border-t border-neutral-200 dark:border-neutral-800 pt-4 text-center">
                   <p className="font-mono text-xs text-neutral-400 uppercase">Author: Lycheeling</p>
                   <p className="font-mono text-xs text-neutral-400 uppercase">Est. 2024</p>
                </div>
             </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
