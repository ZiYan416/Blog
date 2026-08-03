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
import { useDataSaver } from "@/features/settings/hooks/use-data-saver";

const VIDEO_URL = "/videos/about/aquarium-loop-v1.mp4";
const POSTER_URL = "/videos/about/aquarium-poster-v1.jpg";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const pendingReleaseRef = useRef<{
    timer: ReturnType<typeof globalThis.setTimeout>;
    video: HTMLVideoElement;
  } | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { isDataSaverActive, isNetworkStatusReady } = useDataSaver();
  const videoEnabled =
    isNetworkStatusReady && !isDataSaverActive && !prefersReducedMotion;

  const startWhenBuffered = useCallback((video: HTMLVideoElement) => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;

    const bufferedEnd = video.buffered.length
      ? video.buffered.end(video.buffered.length - 1)
      : 0;
    const canPlayWithoutWaiting =
      bufferedEnd >= video.duration - 0.25 ||
      video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA;

    if (!canPlayWithoutWaiting || !video.paused) return;
    void video.play().catch(() => {
      // The poster remains visible when autoplay is blocked.
    });
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () =>
      setPrefersReducedMotion(motionQuery.matches);
    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);
    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video && pendingReleaseRef.current?.video === video) {
      globalThis.clearTimeout(pendingReleaseRef.current.timer);
      pendingReleaseRef.current = null;
    }

    return () => {
      if (!video) return;
      const timer = globalThis.setTimeout(() => {
        video.pause();
        video.removeAttribute("src");
        video.load();
        if (pendingReleaseRef.current?.video === video) {
          pendingReleaseRef.current = null;
        }
      }, 0);
      pendingReleaseRef.current = { timer, video };
    };
  }, [videoEnabled]);

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

        {videoEnabled && (
          <video
            data-testid="about-video"
            ref={videoRef}
            aria-hidden="true"
            muted
            playsInline
            loop
            preload="auto"
            poster={POSTER_URL}
            src={VIDEO_URL}
            onLoadedMetadata={(event) => startWhenBuffered(event.currentTarget)}
            onProgress={(event) => startWhenBuffered(event.currentTarget)}
            onCanPlayThrough={(event) => startWhenBuffered(event.currentTarget)}
            onLoadStart={() => setIsVideoReady(false)}
            onPlaying={() => setIsVideoReady(true)}
            onWaiting={() => setIsVideoReady(false)}
            onError={() => setIsVideoReady(false)}
            className={`absolute inset-0 h-full w-full object-cover object-[88%_center] transition-opacity duration-500 ease-in-out sm:object-[70%_center] ${
              videoEnabled && isVideoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>

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
