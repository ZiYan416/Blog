"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Github,
  Globe2,
  ImageIcon,
  Mail,
  PanelsTopLeft,
} from "lucide-react";

const VIDEO_URL = "/videos/about/aquarium-loop-v1.mp4";
const POSTER_URL = "/videos/about/aquarium-poster-v1.jpg";
const CROSSFADE_LEAD_SECONDS = 0.42;
const CROSSFADE_DURATION_MS = 360;

type VideoLayer = 0 | 1;

const destinations = [
  {
    href: "https://lunalbl.com",
    label: "Blog",
    detail: "文字与生活",
    icon: Globe2,
  },
  {
    href: "https://img.lunalbl.com",
    label: "Image Bed",
    detail: "图片与文件",
    icon: ImageIcon,
  },
  {
    href: "https://status.lunalbl.com",
    label: "Status",
    detail: "服务运行状态",
    icon: Activity,
  },
  {
    href: "https://808-page.vercel.app",
    label: "808 Page",
    detail: "另一处个人主页",
    icon: PanelsTopLeft,
  },
];

const socialLinks = [
  {
    href: "https://github.com/ZiYan416",
    label: "GitHub",
    detail: "ZiYan416",
    icon: Github,
  },
  {
    href: "https://blog.csdn.net/qq_37482613?spm=1000.2115.3001.5343",
    label: "CSDN",
    detail: "技术笔记",
    icon: BookOpen,
  },
  {
    href: "mailto:Zi_Yan416@163.com",
    label: "Email",
    detail: "来聊聊",
    icon: Mail,
  },
];

export function AboutHero() {
  const primaryVideoRef = useRef<HTMLVideoElement>(null);
  const bufferVideoRef = useRef<HTMLVideoElement>(null);
  const activeVideoRef = useRef<VideoLayer>(0);
  const isCrossfadingRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoLayer>(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [loopVeilCycle, setLoopVeilCycle] = useState(0);

  const startCrossfade = useCallback((fromLayer: VideoLayer) => {
    if (
      activeVideoRef.current !== fromLayer ||
      isCrossfadingRef.current
    ) {
      return;
    }

    const nextLayer: VideoLayer = fromLayer === 0 ? 1 : 0;
    const currentVideo =
      fromLayer === 0 ? primaryVideoRef.current : bufferVideoRef.current;
    const nextVideo =
      nextLayer === 0 ? primaryVideoRef.current : bufferVideoRef.current;

    if (!currentVideo || !nextVideo) return;

    isCrossfadingRef.current = true;
    nextVideo.currentTime = 0;

    void nextVideo
      .play()
      .then(() => {
        setLoopVeilCycle((cycle) => cycle + 1);
        activeVideoRef.current = nextLayer;
        setActiveVideo(nextLayer);
        setIsVideoReady(true);

        transitionTimerRef.current = window.setTimeout(() => {
          currentVideo.pause();
          currentVideo.currentTime = 0;
          isCrossfadingRef.current = false;
          transitionTimerRef.current = null;
        }, CROSSFADE_DURATION_MS);
      })
      .catch(() => {
        isCrossfadingRef.current = false;
        currentVideo.currentTime = 0;
        void currentVideo.play().catch(() => setIsVideoReady(false));
      });
  }, []);

  useEffect(() => {
    const initialVideo = primaryVideoRef.current;
    const bufferVideo = bufferVideoRef.current;
    let animationFrame = 0;

    void initialVideo?.play().catch(() => {
      // The poster remains visible when autoplay is blocked.
    });
    bufferVideo?.load();
    void bufferVideo
      ?.play()
      .then(() => {
        if (
          activeVideoRef.current === 0 &&
          !isCrossfadingRef.current
        ) {
          bufferVideo.pause();
          bufferVideo.currentTime = 0;
        }
      })
      .catch(() => {
        // The active layer continues normally if the buffer cannot be primed.
      });

    const monitorPlayback = () => {
      const layer = activeVideoRef.current;
      const video =
        layer === 0 ? primaryVideoRef.current : bufferVideoRef.current;

      if (
        video &&
        Number.isFinite(video.duration) &&
        video.duration > 0 &&
        video.duration - video.currentTime <= CROSSFADE_LEAD_SECONDS
      ) {
        startCrossfade(layer);
      }

      animationFrame = window.requestAnimationFrame(monitorPlayback);
    };

    animationFrame = window.requestAnimationFrame(monitorPlayback);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, [startCrossfade]);

  return (
    <section
      data-testid="about-hero"
      className="about-immersive relative flex h-[calc(100svh-4rem)] w-full flex-col overflow-hidden bg-black font-geist text-white"
    >
      <div className="absolute inset-0">
        <div
          data-testid="about-poster"
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-[position:88%_center] bg-no-repeat sm:bg-[position:70%_center]"
          style={{ backgroundImage: `url(${POSTER_URL})` }}
        />

        {([0, 1] as const).map((layer) => (
          <video
            key={layer}
            data-testid={layer === 0 ? "about-video" : "about-video-buffer"}
            ref={layer === 0 ? primaryVideoRef : bufferVideoRef}
            aria-hidden="true"
            autoPlay={layer === 0}
            muted
            playsInline
            preload="auto"
            poster={layer === 0 ? POSTER_URL : undefined}
            src={VIDEO_URL}
            onLoadedData={() => {
              if (activeVideoRef.current === layer) setIsVideoReady(true);
            }}
            onPlaying={() => {
              if (activeVideoRef.current === layer) setIsVideoReady(true);
            }}
            onEnded={() => startCrossfade(layer)}
            onError={() => {
              if (activeVideoRef.current === layer) setIsVideoReady(false);
            }}
            className={`absolute inset-0 h-full w-full object-cover object-[88%_center] transition-opacity ease-in-out sm:object-[70%_center] ${
              isVideoReady && activeVideo === layer
                ? "opacity-100"
                : "opacity-0"
            }`}
            style={{ transitionDuration: `${CROSSFADE_DURATION_MS}ms` }}
          />
        ))}
      </div>

      {loopVeilCycle > 0 && (
        <div
          key={loopVeilCycle}
          data-testid="about-loop-veil"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ animation: "loopVeil 820ms ease-in-out both" }}
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.02)_36%,rgba(0,0,0,0.6)_100%)] transition-colors duration-500 dark:bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.08)_36%,rgba(0,0,0,0.76)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.06)_70%,transparent_100%)] transition-colors duration-500 dark:bg-[linear-gradient(90deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.08)_70%,transparent_100%)] md:bg-[linear-gradient(90deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.08)_58%,transparent_100%)] md:dark:bg-[linear-gradient(90deg,rgba(0,0,0,0.48)_0%,rgba(0,0,0,0.14)_58%,transparent_100%)]"
      />

      <div
        data-testid="about-content"
        className="container relative z-10 mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col justify-between px-4 pb-5 pt-7 sm:pb-7 sm:pt-9 md:px-6 md:pb-10 md:pt-10 lg:pb-14 lg:pt-16 xl:pt-[4.5rem]"
      >
        <div className="max-w-3xl">
          <h1 className="animate-[fadeSlideUp_0.8s_ease_0.2s_both] text-[clamp(1.8rem,3.5vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.04em] [text-shadow:0_2px_18px_rgba(0,0,0,0.78)] dark:[text-shadow:0_2px_18px_rgba(0,0,0,0.9)]">
            你好，我是 SuziJay。
            <br />
            <span className="font-light text-white/72">
              写代码，偶尔也写点 Bug。
            </span>
          </h1>
        </div>

        <div className="max-w-[38rem] animate-[fadeSlideUp_0.8s_ease_0.6s_both]">
          <p className="max-w-xl text-xs leading-relaxed text-white/62 sm:text-sm md:text-base">
            软件工程学士，AISTATS 2026 论文作者。
            <br />
            项目、实验和一些随手做的小东西，基本都放在 GitHub。
          </p>

          <div
            aria-label="社交与联系"
            className="mt-3 flex flex-wrap gap-x-4 gap-y-2"
          >
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <Link
                  key={social.href}
                  href={social.href}
                  target={
                    social.href.startsWith("mailto:") ? undefined : "_blank"
                  }
                  rel={
                    social.href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="group inline-flex items-center gap-1.5 text-xs text-white/72 transition-colors hover:text-white"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {social.label}
                  <span className="hidden text-white/34 sm:inline">
                    / {social.detail}
                  </span>
                </Link>
              );
            })}
          </div>

          <div
            aria-label="SuziJay 的站点"
            className="mt-3 grid grid-cols-2 gap-2 sm:mt-4"
          >
            {destinations.map((destination) => {
              const Icon = destination.icon;

              return (
                <Link
                  key={destination.href}
                  href={destination.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-w-0 items-center justify-between gap-3 rounded-[10px] border border-white/14 bg-black/18 px-3 py-2.5 backdrop-blur-md transition-colors hover:border-white/24 hover:bg-black/28 dark:border-white/10 dark:bg-black/20 dark:hover:border-white/20 dark:hover:bg-white/[0.06] sm:px-4 sm:py-3 md:h-[58px] md:py-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon
                      className="size-[18px] shrink-0 text-white/56 transition-colors group-hover:text-white/82"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-white/90 sm:text-sm">
                        {destination.label}
                      </p>
                      <p className="mt-0.5 hidden truncate text-[10px] text-white/38 sm:block">
                        {destination.detail}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    className="size-3 shrink-0 text-white/28 transition-colors group-hover:text-white/58"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
