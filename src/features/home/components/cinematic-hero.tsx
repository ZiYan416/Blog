"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useDataSaver } from "@/features/settings/hooks/use-data-saver";

// Swapped Day and Night video groups per user request:
// Light Mode (Day) plays deep woods & quiet dawn scenery.
const DAY_VIDEOS = [
  {
    local: "/videos/night-1.mp4",
    mobile: "/videos/night-1-mobile.mp4",
    modern: "/videos/night-1.av1.webm",
    poster: "/videos/posters/night-1.jpg",
    remote: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4",
  },
  {
    local: "/videos/night-2.mp4",
    mobile: "/videos/night-2-mobile.mp4",
    modern: "/videos/night-2.av1.webm",
    poster: "/videos/posters/night-2.jpg",
    remote: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4",
  },
];

// Dark Mode (Night) plays golden hour & still water scenery.
const NIGHT_VIDEOS = [
  {
    local: "/videos/day-1.mp4",
    mobile: "/videos/day-1-mobile.mp4",
    modern: "/videos/day-1.av1.webm",
    poster: "/videos/posters/day-1.jpg",
    remote: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4",
  },
  {
    local: "/videos/day-2.mp4",
    mobile: "/videos/day-2-mobile.mp4",
    modern: "/videos/day-2.av1.webm",
    poster: "/videos/posters/day-2.jpg",
    remote: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4",
  },
];

const OVERLAY_IMAGE = "/images/hero-overlay.png";

interface GroupVideoLoopProps {
  videos: {
    local: string;
    mobile: string;
    modern: string;
    poster: string;
    remote: string;
  }[];
  isActiveGroup: boolean;
  isPrimaryGroup: boolean;
  onPrimaryReady?: () => void;
  onPrimaryBuffered?: () => void;
  allowBackgroundPreload: boolean;
}

// Seamless 100% duration-triggered video player engine with progressive lazy-preloading
function GroupVideoLoop({
  videos,
  isActiveGroup,
  isPrimaryGroup,
  onPrimaryReady,
  onPrimaryBuffered,
  allowBackgroundPreload,
}: GroupVideoLoopProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const isTransitioningRef = useRef(false);
  const hasTriggeredReadyRef = useRef<boolean[]>([false, false]);
  const hasTriggeredBufferedRef = useRef(false);
  const transitionTimersRef = useRef<ReturnType<typeof globalThis.setTimeout>[]>([]);
  const pendingReleaseRef = useRef<{
    timer: ReturnType<typeof globalThis.setTimeout>;
    videos: HTMLVideoElement[];
  } | null>(null);

  const ref0 = useRef<HTMLVideoElement>(null);
  const ref1 = useRef<HTMLVideoElement>(null);
  const getVideo = (idx: number) => (idx === 0 ? ref0.current : ref1.current);

  useEffect(() => {
    const videos = [ref0.current, ref1.current].filter(
      (video): video is HTMLVideoElement => video !== null
    );
    if (
      pendingReleaseRef.current &&
      pendingReleaseRef.current.videos.every((video, index) => video === videos[index])
    ) {
      globalThis.clearTimeout(pendingReleaseRef.current.timer);
      pendingReleaseRef.current = null;
    }

    return () => {
      transitionTimersRef.current.forEach(globalThis.clearTimeout);
      transitionTimersRef.current = [];

      const timer = globalThis.setTimeout(() => {
        videos.forEach((video) => {
          video.pause();
          video.querySelectorAll("source").forEach((source) => {
            source.removeAttribute("src");
          });
          video.load();
        });
        if (pendingReleaseRef.current?.videos === videos) {
          pendingReleaseRef.current = null;
        }
      }, 0);
      pendingReleaseRef.current = { timer, videos };
    };
  }, []);

  // Strictly control video play/pause
  useEffect(() => {
    if (!isActiveGroup) {
      ref0.current?.pause();
      ref1.current?.pause();
      return;
    }

    const activeVideo = getVideo(activeIdx);
    if (activeVideo) {
      activeVideo.playbackRate = 1.0;
      activeVideo.play().catch(() => {});
    }
  }, [activeIdx, isActiveGroup]);

  const markVideoReady = (idx: number) => {
    if (idx === 0) {
      if (!hasTriggeredReadyRef.current[idx]) {
        hasTriggeredReadyRef.current[idx] = true;
        if (isPrimaryGroup && onPrimaryReady) onPrimaryReady();
      }
    }
  };

  // `canplay` means the first frame and a short playable buffer are ready
  // (HAVE_FUTURE_DATA). This is the hand-off point for the branded loader:
  // later than merely receiving one frame, but without waiting for the full
  // clip to download.
  const handlePrimaryPlayable = (idx: number, e: React.SyntheticEvent<HTMLVideoElement>) => {
    e.currentTarget.playbackRate = 1.0;
    markVideoReady(idx);
  };

  const handleBuffered = (idx: number) => {
    if (
      idx !== 0 ||
      !isPrimaryGroup ||
      hasTriggeredBufferedRef.current
    ) {
      return;
    }
    hasTriggeredBufferedRef.current = true;
    onPrimaryBuffered?.();
  };

  const triggerNext = (currentIdx: number) => {
    if (currentIdx !== activeIdx || isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    const nextIdx = (currentIdx + 1) % videos.length;
    
    const nextVideo = getVideo(nextIdx);
    const currVideo = getVideo(currentIdx);

    if (nextVideo) {
      // 1. Reset next video to 0.0s and ensure standard 1.0x native speed
      nextVideo.currentTime = 0;
      nextVideo.playbackRate = 1.0;
      // 2. Start decoding and playing nextVideo while invisible (opacity-0)
      nextVideo.play().catch(() => {});

      // 3. Wait 250ms for browser hardware decoder to spin up to active 60fps playback before triggering CSS opacity dissolve
      const transitionTimer = globalThis.setTimeout(() => {
        setActiveIdx(nextIdx);
      }, 250);
      transitionTimersRef.current.push(transitionTimer);
    } else {
      setActiveIdx(nextIdx);
    }

    // 4. Pause previous video after 2.2s (250ms pre-roll + 1500ms opacity transition + buffer safety)
    const cleanupTimer = globalThis.setTimeout(() => {
      if (currVideo && currVideo !== getVideo(nextIdx)) {
        currVideo.pause();
      }
      isTransitioningRef.current = false;
    }, 2200);
    transitionTimersRef.current.push(cleanupTimer);
  };

  const handleTimeUpdate = (idx: number) => {
    if (!isActiveGroup) return;
    const video = getVideo(idx);
    if (!video) return;

    // Trigger initial dissolve fade-in as soon as the first video frame is actually rendering (currentTime > 0)
    if (idx === 0 && isPrimaryGroup && video.currentTime > 0) {
      markVideoReady(0);
    }

    if (idx !== activeIdx) return;
    if (!video.duration || video.duration < 1) return;

    const remainingTime = video.duration - video.currentTime;
    // Trigger pre-roll when current video has 2.0s remaining (250ms pre-roll + 1.5s crossfade)
    if (remainingTime <= 2.0) {
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
      {videos.map((vid, idx) => {
        const isPreloadAllowed =
          (idx === 0 && (isPrimaryGroup || isActiveGroup)) ||
          (allowBackgroundPreload && (isActiveGroup || idx === 0));
        return (
          <video
            key={vid.local}
            ref={idx === 0 ? ref0 : ref1}
            autoPlay={idx === 0 && isActiveGroup}
            muted
            playsInline
            poster={vid.poster}
            preload={isPreloadAllowed ? "auto" : "none"}
            onCanPlay={(e) => handlePrimaryPlayable(idx, e)}
            onCanPlayThrough={() => handleBuffered(idx)}
            onTimeUpdate={() => handleTimeUpdate(idx)}
            onEnded={() => handleEnded(idx)}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-1500 ease-in-out",
              activeIdx === idx ? "opacity-100" : "opacity-0"
            )}
          >
            {isPreloadAllowed && (
              <>
                <source
                  src={vid.mobile}
                  type="video/mp4"
                  media="(max-width: 767px)"
                />
                <source
                  src={vid.modern}
                  type='video/webm; codecs="av01.0.05M.08"'
                />
                <source src={vid.local} type="video/mp4" />
                <source src={vid.remote} type="video/mp4" />
              </>
            )}
          </video>
        );
      })}
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
  const [isThemeReady, setIsThemeReady] = useState(false);
  const [isInitialVideoReady, setIsInitialVideoReady] = useState(false);
  const [isInitialVideoBuffered, setIsInitialVideoBuffered] = useState(false);
  const [allowBackgroundPreload, setAllowBackgroundPreload] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState<boolean | null>(null);
  const { isDataSaverActive, isNetworkStatusReady } = useDataSaver();

  useEffect(() => {
    const checkDark = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
      setIsThemeReady(true);
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInitialVideoReady) return
    document.documentElement.dataset.heroReady = "true"
    window.dispatchEvent(new Event("site-critical-ready"))
  }, [isInitialVideoReady])

  useEffect(() => {
    if (!isInitialVideoBuffered || !videoEnabled) return

    const enableBackgroundPreload = () => setAllowBackgroundPreload(true)
    let fallbackTimer: ReturnType<typeof globalThis.setTimeout> | undefined
    let idleCallback: number | undefined

    if ("requestIdleCallback" in window) {
      idleCallback = window.requestIdleCallback(enableBackgroundPreload, {
        timeout: 4000,
      })
    } else {
      fallbackTimer = globalThis.setTimeout(enableBackgroundPreload, 1500)
    }

    return () => {
      if (idleCallback !== undefined) window.cancelIdleCallback(idleCallback)
      if (fallbackTimer !== undefined) globalThis.clearTimeout(fallbackTimer)
    }
  }, [isInitialVideoBuffered, videoEnabled])

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateVideoPreference = () => {
      if (!isNetworkStatusReady) return;
      const enabled = !reducedMotion.matches && !isDataSaverActive;
      setVideoEnabled(enabled);

      if (!enabled) {
        setIsInitialVideoReady(true);
        setIsInitialVideoBuffered(true);
      }
    };

    updateVideoPreference();
    reducedMotion.addEventListener("change", updateVideoPreference);

    return () => {
      reducedMotion.removeEventListener("change", updateVideoPreference);
    };
  }, [isDataSaverActive, isNetworkStatusReady]);

  return (
    <section className="relative w-full h-[calc(100dvh-4rem)] min-h-[480px] max-h-[1080px] overflow-hidden bg-black flex flex-col justify-between py-4 sm:py-6 md:py-8 px-4 sm:px-6 isolate select-none">
      {/* Container for initial load: pure black until video is ready, then train cabin + video dissolve in TOGETHER */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-1500 ease-in-out",
          isInitialVideoReady ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Keep a poster visible while the active scene buffers or data saving is enabled. */}
        <div className="absolute -inset-1 z-0">
          {isThemeReady && (
            <Image
              src={(isDark ? NIGHT_VIDEOS : DAY_VIDEOS)[0].poster}
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          {videoEnabled && isThemeReady && (
            <GroupVideoLoop
              key={isDark ? "night" : "day"}
              videos={isDark ? NIGHT_VIDEOS : DAY_VIDEOS}
              isActiveGroup
              isPrimaryGroup
              onPrimaryReady={() => setIsInitialVideoReady(true)}
              onPrimaryBuffered={() => setIsInitialVideoBuffered(true)}
              allowBackgroundPreload={allowBackgroundPreload}
            />
          )}
        </div>

        {/* Standard Transparent PNG Overlay (z-index 2) - -inset-1 expands the layer to hide Chrome/Safari edge-clamping stretch bugs under backdrop-filter */}
        <div className="absolute -inset-1 z-[2] pointer-events-none overflow-hidden">
          <Image
            src={OVERLAY_IMAGE}
            alt="Train Window Frame"
            fill
            priority
            sizes="100vw"
            className="absolute w-full sm:h-[106%] sm:-top-[6%] sm:translate-y-0 sm:scale-100 max-sm:top-0 max-sm:h-full max-sm:translate-y-0 max-sm:scale-100 max-sm:object-cover max-sm:object-top pointer-events-none animate-train-bob transform-gpu translate-z-0 backface-hidden origin-center"
          />
        </div>
      </div>

      {/* Subtle radial vignette behind hero text — ensures legibility against bright video backgrounds like snow/lake scenes */}
      <div className="absolute inset-0 z-[3] pointer-events-none bg-[radial-gradient(ellipse_80%_70%_at_50%_55%,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.15)_55%,transparent_100%)]" />

      {/* Hero Main Content (z-index 4)
          Desktop positioning follows the central window opening rather than the full hero canvas. */}
      <div
        data-hero-content
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto my-auto py-4 sm:py-8 px-2 md:absolute md:inset-x-0 md:top-[4%] md:bottom-[13%] md:w-full"
      >
        {/* Badge / DailyQuote */}
        {badgeText && (
          <div className="mb-2 sm:mb-4 inline-flex items-center justify-center">
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
            "font-serif-instrument italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem] leading-[1.08] tracking-tight max-w-4xl mb-4 sm:mb-6 transition-colors duration-700 text-white",
            "[text-shadow:_0_2px_12px_rgba(0,0,0,0.5),_0_1px_3px_rgba(0,0,0,0.4)]"
          )}
        >
          {titleLine1} <br />
          <span className="not-italic font-normal text-white/70 [text-shadow:_0_2px_8px_rgba(0,0,0,0.4)]">{titleLine2}</span>
        </h1>

        {/* Subtext */}
        <p
          className={cn(
            "text-xs sm:text-sm md:text-base lg:text-lg max-w-xs sm:max-w-md md:max-w-xl mx-auto leading-relaxed font-sans transition-colors duration-700 text-white/85",
            "[text-shadow:_0_1px_6px_rgba(0,0,0,0.4)]"
          )}
        >
          {subtitle}
        </p>

        {/* CTA Node */}
        {ctaNode && (
          <div className="mt-4 sm:mt-6 w-full flex justify-center">{ctaNode}</div>
        )}
      </div>
    </section>
  );
}
