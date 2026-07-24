"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Swapped Day and Night video groups per user request:
// Light Mode (Day) plays deep woods & quiet dawn scenery.
const DAY_VIDEOS = [
  {
    local: "/videos/night-1.mp4",
    remote: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4",
  },
  {
    local: "/videos/night-2.mp4",
    remote: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4",
  },
];

// Dark Mode (Night) plays golden hour & still water scenery.
const NIGHT_VIDEOS = [
  {
    local: "/videos/day-1.mp4",
    remote: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4",
  },
  {
    local: "/videos/day-2.mp4",
    remote: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4",
  },
];

// Dual cabin overlay images: Python processed bright silver-iron steel for Day, original warm amber for Night
const OVERLAY_IMAGE_DARK = "/images/hero-overlay.png";
const OVERLAY_IMAGE_SILVER = "/images/hero-overlay-silver.png";

interface GroupVideoLoopProps {
  videos: { local: string; remote: string }[];
  isActiveGroup: boolean;
  onVideoReady?: () => void;
}

function GroupVideoLoop({ videos, isActiveGroup, onVideoReady }: GroupVideoLoopProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const isTransitioningRef = useRef(false);

  const ref0 = useRef<HTMLVideoElement>(null);
  const ref1 = useRef<HTMLVideoElement>(null);
  const videoRefs = [ref0, ref1];

  // Set 0.75x slow-motion playback speed & handle active play state
  useEffect(() => {
    videoRefs.forEach((ref, idx) => {
      const v = ref.current;
      if (!v) return;

      v.playbackRate = 0.75; // Dreamy 0.75x slow-motion playback

      if (isActiveGroup && idx === activeIdx) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [activeIdx, isActiveGroup]);

  const triggerNext = (currentIdx: number) => {
    if (currentIdx !== activeIdx || isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    const nextIdx = (currentIdx + 1) % videos.length;
    const nextV = videoRefs[nextIdx]?.current;
    const currV = videoRefs[currentIdx]?.current;

    // Start playing next video in advance so it is already decoding when crossfade starts
    if (nextV) {
      nextV.currentTime = 0;
      nextV.playbackRate = 0.75;
      nextV.play().catch(() => {});
    }

    setActiveIdx(nextIdx);

    // Pause previous video after 2.5s crossfade overlap finishes
    setTimeout(() => {
      if (currV && currV !== videoRefs[nextIdx]?.current) {
        currV.pause();
      }
      isTransitioningRef.current = false;
    }, 2500);
  };

  const handleTimeUpdate = (idx: number) => {
    if (idx !== activeIdx || !isActiveGroup) return;
    const video = videoRefs[idx]?.current;
    if (!video || !video.duration || video.duration < 1) return;

    const remainingTime = video.duration - video.currentTime;
    // Pre-start crossfade 1.5s before end of video for seamless overlap
    if (remainingTime <= 1.5) {
      triggerNext(idx);
    }
  };

  const handleEnded = (idx: number) => {
    if (idx !== activeIdx || !isActiveGroup) return;
    triggerNext(idx);
  };

  return (
    <div
      className={cn(
        "absolute inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-1000 ease-in-out",
        isActiveGroup ? "opacity-100" : "opacity-0"
      )}
    >
      {videos.map((vid, idx) => (
        <video
          key={vid.remote}
          ref={videoRefs[idx]}
          autoPlay
          muted
          playsInline
          onCanPlayThrough={(e) => {
            e.currentTarget.playbackRate = 0.75;
            if (idx === 0 && onVideoReady) onVideoReady();
          }}
          onTimeUpdate={() => handleTimeUpdate(idx)}
          onEnded={() => handleEnded(idx)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1500 ease-in-out",
            activeIdx === idx ? "opacity-100" : "opacity-0"
          )}
        >
          <source src={vid.local} type="video/mp4" />
          <source src={vid.remote} type="video/mp4" />
        </video>
      ))}
    </div>
  );
}

interface CinematicHeroProps {
  badgeText?: React.ReactNode;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  ctaNode?: React.ReactNode;
}

export function CinematicHero({
  badgeText = "Over 10,000 minds already finding their clarity",
  titleLine1 = "Clarity in an Endlessly",
  titleLine2 = "Noisy Universe",
  subtitle = "Rise above the chaos of pings, infinite scrolling, and relentless demands. Discover how to protect your presence and create with intention.",
  ctaNode,
}: CinematicHeroProps) {
  const [isDark, setIsDark] = useState(false);
  const [isInitialVideoLoaded, setIsInitialVideoLoaded] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black flex flex-col justify-between pt-20 pb-8 px-4 sm:px-6 isolate">
      {/* Container for initial video AND train cabin load fade-in: pure black until video is 100% ready */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-1500 ease-in-out",
          isInitialVideoLoaded ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Daytime Scenery Group */}
        <GroupVideoLoop
          videos={DAY_VIDEOS}
          isActiveGroup={!isDark}
          onVideoReady={() => setIsInitialVideoLoaded(true)}
        />

        {/* Nighttime Scenery Group */}
        <GroupVideoLoop
          videos={NIGHT_VIDEOS}
          isActiveGroup={isDark}
          onVideoReady={() => setIsInitialVideoLoaded(true)}
        />

        {/* Dynamic Ambient Train Cabin Lighting & Reflection Overlay */}
        <div
          className={cn(
            "absolute inset-0 z-[1] pointer-events-none transition-all duration-1500 ease-in-out",
            !isDark
              ? "bg-gradient-to-b from-white/20 via-slate-100/10 to-slate-400/20 opacity-80"
              : "bg-gradient-to-b from-amber-500/15 via-orange-600/10 to-amber-950/35 opacity-90"
          )}
        />

        {/* Light Mode Silver-Iron Metallic Train Cabin Overlay (z-index 2) */}
        <div
          className={cn(
            "absolute inset-0 z-[2] pointer-events-none overflow-hidden transition-opacity duration-1000 ease-in-out",
            !isDark ? "opacity-100" : "opacity-0"
          )}
        >
          <img
            src={OVERLAY_IMAGE_SILVER}
            alt="Train Window Frame (Silver Metallic)"
            className="w-full h-full object-fill pointer-events-none animate-train-bob"
          />
        </div>

        {/* Dark Mode Warm Sunset Amber Train Cabin Overlay (z-index 2) */}
        <div
          className={cn(
            "absolute inset-0 z-[2] pointer-events-none overflow-hidden transition-opacity duration-1000 ease-in-out",
            isDark ? "opacity-100" : "opacity-0"
          )}
        >
          <img
            src={OVERLAY_IMAGE_DARK}
            alt="Train Window Frame (Sunset Amber)"
            className="w-full h-full object-fill pointer-events-none animate-train-bob contrast-[1.08] brightness-[0.96] sepia-[0.35] hue-rotate-[-15deg] saturate-[1.25]"
          />
        </div>
      </div>

      {/* Hero Main Content (z-index 3) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto my-auto py-8">
        {/* Badge / DailyQuote */}
        {badgeText && (
          <div className="mb-2 inline-flex items-center justify-center">
            {typeof badgeText === "string" ? (
              <div
                className={cn(
                  "liquid-glass rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium backdrop-blur-md transition-colors duration-700 inline-flex items-center gap-2 text-white/90"
                )}
              >
                <Sparkles className="w-3.5 h-3.5 opacity-80" />
                <span>{badgeText}</span>
              </div>
            ) : (
              badgeText
            )}
          </div>
        )}

        {/* Heading with Instrument Serif */}
        <h1
          className={cn(
            "font-serif-instrument italic text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight max-w-4xl mb-6 transition-colors duration-700 drop-shadow-md text-white"
          )}
        >
          {titleLine1} <br className="hidden sm:inline" />
          <span className="not-italic font-normal">{titleLine2}</span>
        </h1>

        {/* Subtext */}
        <p
          className={cn(
            "text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed font-sans transition-colors duration-700 opacity-90 drop-shadow-sm text-white/80"
          )}
        >
          {subtitle}
        </p>

        {/* CTA Node */}
        {ctaNode && (
          <div className="mt-6 w-full flex justify-center">{ctaNode}</div>
        )}
      </div>
    </section>
  );
}
