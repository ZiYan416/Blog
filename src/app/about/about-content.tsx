"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Github, Mail, ArrowUpRight, Sparkles } from "lucide-react";

/* ─────────────────────────────────────────────
   Utility: Scroll-triggered section wrapper
   ───────────────────────────────────────────── */
function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.15 });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─────────────────────────────────────────────
   Utility: Word-by-word text reveal
   ───────────────────────────────────────────── */
function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.3 });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 20, filter: "blur(4px)" }}
          transition={{
            duration: 0.6,
            delay: i * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

/* ─────────────────────────────────────────────
   Utility: 3D tilt card
   ───────────────────────────────────────────── */
function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(
      `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`
    );
  };

  const handleMouseLeave = () => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg)");
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
      className={className}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Skills / Interest pills
   ───────────────────────────────────────────── */
const skills = [
  "React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js",
  "Supabase", "Framer Motion", "UI/UX Design", "Web Performance",
  "Git", "Figma", "Responsive Design",
];

/* ─────────────────────────────────────────────
   Timeline milestones
   ───────────────────────────────────────────── */
const milestones = [
  { year: "起点", title: "开始编程之旅", desc: "写下第一行 Hello World，打开了新世界的大门" },
  { year: "探索", title: "深入前端开发", desc: "从 HTML/CSS 到 React，逐步构建现代 Web 应用" },
  { year: "构建", title: "打造个人博客", desc: "用 Next.js + Supabase 搭建属于自己的技术空间" },
  { year: "现在", title: "持续成长", desc: "探索更多可能，在代码与美学之间寻找平衡" },
];

/* ─────────────────────────────────────────────
   Background Components
   ───────────────────────────────────────────── */
function TechnicalBackground() {
  return (
    <>
      <div className="fixed inset-0 z-[-2] pointer-events-none bg-neutral-50 dark:bg-neutral-950">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, #808080 1px, transparent 1px),
                              linear-gradient(to bottom, #808080 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
          }}
        />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}

function WarmOrbs() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 2000], [0, -300]);
  const y2 = useTransform(scrollY, [0, 2000], [0, -500]);
  const y3 = useTransform(scrollY, [0, 2000], [0, -400]);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      <motion.div
        style={{ y: y1 }}
        className="absolute top-[10%] left-[10%] w-64 h-64 md:w-[500px] md:h-[500px] bg-amber-500/10 rounded-full blur-[80px] md:blur-[120px]"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-[40%] right-[5%] w-48 h-48 md:w-[400px] md:h-[400px] bg-orange-400/10 rounded-full blur-[60px] md:blur-[100px]"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-[0%] left-[20%] w-72 h-72 md:w-[600px] md:h-[600px] bg-yellow-500/10 rounded-full blur-[90px] md:blur-[140px]"
      />
    </div>
  );
}

/* ═════════════════════════════════════════════
   Main Component
   ═════════════════════════════════════════════ */
export default function AboutContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const scaleX = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <div ref={containerRef} className="relative">
      <TechnicalBackground />
      <WarmOrbs />
      
      {/* ── Scroll progress bar ── */}
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neutral-400 via-white to-neutral-400 dark:from-neutral-600 dark:via-white dark:to-neutral-600 z-50"
      />

      {/* ══════════════════════════════════════
         HERO — Cinematic Entrance
         ══════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Radial gradient bg */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(120,120,120,0.12),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(255,255,255,0.04),transparent)]" />

        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full border border-neutral-200/20 dark:border-white/[0.04]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full border border-neutral-200/15 dark:border-white/[0.06]" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center"
        >
          {/* Uppercase label */}
          <motion.p
            initial={{ opacity: 0, y: 20, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.3em" }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500 mb-8"
          >
            College Student
          </motion.p>

          {/* Main name */}
          <motion.h1
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tight text-neutral-900 dark:text-white leading-[0.9] mb-4"
          >
            荔冰酪
          </motion.h1>

          {/* English name — thin & elegant */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-xl sm:text-3xl md:text-4xl font-light text-neutral-400 dark:text-neutral-500 tracking-wide"
          >
            Lycheeling
          </motion.p>

          {/* Thin divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-10 w-16 h-px bg-neutral-300 dark:bg-neutral-700"
          />

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-12"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 mx-auto rounded-full border border-neutral-300 dark:border-neutral-700 flex items-start justify-center p-1.5"
            >
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], height: ["4px", "8px", "4px"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-0.5 rounded-full bg-neutral-400 dark:bg-neutral-500"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
         PHILOSOPHY — Word-by-word reveal
         ══════════════════════════════════════ */}
      <RevealSection className="relative py-20 md:py-44 px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Section label */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-600 mb-12"
          >
            Philosophy
          </motion.p>

          <WordReveal
            text="I build things at the intersection of code and craft."
            className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight tracking-tight text-neutral-900 dark:text-white mb-8"
          />

          <div className="h-px w-12 mx-auto bg-neutral-200 dark:bg-neutral-800 my-10" />

          <WordReveal
            text="每一行代码都是一次对极致的追求，每一个像素都值得被认真对待。"
            className="text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed font-light"
          />
        </div>
      </RevealSection>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />
      </div>

      {/* ══════════════════════════════════════
         SKILLS — Floating pills with stagger
         ══════════════════════════════════════ */}
      <RevealSection className="py-20 md:py-44 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-600 mb-12"
          >
            Skills & Interests
          </motion.p>

          <SkillPills />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 text-sm text-neutral-400 dark:text-neutral-600 font-light"
          >
            …and always learning something new.
          </motion.p>
        </div>
      </RevealSection>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />
      </div>

      {/* ══════════════════════════════════════
         THE JOURNEY — Timeline
         ══════════════════════════════════════ */}
      <RevealSection className="py-20 md:py-44 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-600 mb-16 text-center"
          >
            The Journey
          </motion.p>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800 md:-translate-x-px" />

            {milestones.map((m, i) => (
              <TimelineItem key={i} milestone={m} index={i} />
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />
      </div>

      {/* ══════════════════════════════════════
         CONTACT — Minimal elegant cards
         ══════════════════════════════════════ */}
      <RevealSection className="py-20 md:py-44 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-600 mb-6"
          >
            Get in Touch
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-16 tracking-tight"
          >
            Let&apos;s Connect
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ContactCard
              href="https://github.com/ZiYan416/Blog"
              icon={<Github className="w-5 h-5" />}
              label="GitHub"
              detail="ZiYan416/Blog"
              index={0}
            />
            <ContactCard
              href="mailto:hello@example.com"
              icon={<Mail className="w-5 h-5" />}
              label="Email"
              detail="Say Hello"
              index={1}
            />
          </div>
        </div>
      </RevealSection>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function SkillPills() {
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.2 });

  return (
    <div ref={ref} className="flex flex-wrap justify-center gap-3">
      {skills.map((skill, i) => (
        <motion.span
          key={skill}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          transition={{
            duration: 0.5,
            delay: i * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="px-5 py-2.5 rounded-full text-sm font-medium
            bg-neutral-100 text-neutral-600 border border-neutral-200/60
            dark:bg-white/[0.04] dark:text-neutral-300 dark:border-white/[0.08]
            hover:bg-neutral-200/80 dark:hover:bg-white/[0.08]
            hover:scale-105
            transition-all duration-300 cursor-default"
        >
          {skill}
        </motion.span>
      ))}
    </div>
  );
}

function TimelineItem({
  milestone,
  index,
}: {
  milestone: { year: string; title: string; desc: string };
  index: number;
}) {
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.3 });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex items-start mb-16 last:mb-0 pl-12 md:pl-0 ${
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      {/* Dot on the line */}
      <div className="absolute left-4 md:left-1/2 top-1 w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 -translate-x-1/2 ring-4 ring-white dark:ring-neutral-950 z-10" />

      {/* Content */}
      <div className={`md:w-1/2 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"}`}>
        <TiltCard>
          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200/50 dark:border-white/[0.06]">
            <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-neutral-400 dark:text-neutral-600 font-medium mb-3">
              {milestone.year}
            </span>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
              {milestone.title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
              {milestone.desc}
            </p>
          </div>
        </TiltCard>
      </div>
    </motion.div>
  );
}

function ContactCard({
  href,
  icon,
  label,
  detail,
  index,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  detail: string;
  index: number;
}) {
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard>
        <Link
          href={href}
          target={href.startsWith("mailto") ? undefined : "_blank"}
          rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
          className="group relative flex flex-col justify-between p-7 rounded-2xl h-44
            bg-neutral-50 dark:bg-white/[0.02]
            border border-neutral-200/50 dark:border-white/[0.06]
            hover:border-neutral-300 dark:hover:border-white/[0.12]
            hover:shadow-lg dark:hover:shadow-white/[0.02]
            transition-all duration-500"
        >
          {/* Subtle glow on hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-neutral-100/0 to-neutral-100/50 dark:from-white/0 dark:to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-300">
              {icon}
            </div>
            <ArrowUpRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
          </div>

          <div className="relative z-10 text-left">
            <p className="font-semibold text-neutral-900 dark:text-white tracking-tight">
              {label}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-0.5">
              {detail}
            </p>
          </div>
        </Link>
      </TiltCard>
    </motion.div>
  );
}