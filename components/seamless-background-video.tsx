"use client";

import { useEffect, useRef, useState } from "react";

type VideoIndex = 0 | 1;

type SeamlessBackgroundVideoProps = {
  className?: string;
  fadeDuration?: number;
  poster?: string;
  src: string;
};

export function SeamlessBackgroundVideo({
  className = "",
  fadeDuration = 1.2,
  poster,
  src,
}: SeamlessBackgroundVideoProps) {
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const transitionInProgressRef = useRef(false);
  const restoredPlaybackRef = useRef(false);
  const visibleVideoRef = useRef<VideoIndex>(0);
  const [visibleVideo, setVisibleVideo] = useState<VideoIndex>(0);
  const [previousVideo, setPreviousVideo] = useState<VideoIndex | null>(null);

  const playbackStorageKey = `maison-sorna:video:${src}`;

  const getVideo = (index: VideoIndex) =>
    index === 0 ? firstVideoRef.current : secondVideoRef.current;

  useEffect(() => {
    return () => {
      const activeVideo = getVideo(visibleVideoRef.current);
      if (activeVideo && Number.isFinite(activeVideo.currentTime)) {
        window.sessionStorage.setItem(
          playbackStorageKey,
          String(activeVideo.currentTime),
        );
      }

      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, [playbackStorageKey]);

  const startCrossfade = (currentIndex: VideoIndex) => {
    if (transitionInProgressRef.current) return;

    const currentVideo = getVideo(currentIndex);
    const nextIndex: VideoIndex = currentIndex === 0 ? 1 : 0;
    const nextVideo = getVideo(nextIndex);

    if (!currentVideo || !nextVideo) return;

    transitionInProgressRef.current = true;
    nextVideo.currentTime = 0;

    void nextVideo
      .play()
      .then(() => {
        setPreviousVideo(currentIndex);
        visibleVideoRef.current = nextIndex;
        setVisibleVideo(nextIndex);

        transitionTimerRef.current = window.setTimeout(() => {
          currentVideo.pause();
          currentVideo.currentTime = 0;
          setPreviousVideo(null);
          transitionInProgressRef.current = false;
        }, fadeDuration * 1000);
      })
      .catch(() => {
        transitionInProgressRef.current = false;
        currentVideo.currentTime = 0;
        void currentVideo.play();
      });
  };

  const restorePlayback = (index: VideoIndex) => {
    if (index !== 0 || restoredPlaybackRef.current) return;

    const video = getVideo(index);
    const savedTime = Number(window.sessionStorage.getItem(playbackStorageKey));
    restoredPlaybackRef.current = true;

    if (
      video &&
      Number.isFinite(savedTime) &&
      savedTime > 0 &&
      Number.isFinite(video.duration) &&
      savedTime < video.duration - fadeDuration
    ) {
      video.currentTime = savedTime;
    }
  };

  const handleTimeUpdate = (index: VideoIndex) => {
    if (index !== visibleVideo || transitionInProgressRef.current) return;

    const video = getVideo(index);
    if (!video || !Number.isFinite(video.duration)) return;

    if (video.duration - video.currentTime <= fadeDuration) {
      startCrossfade(index);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#211915] bg-cover bg-center ${className}`}
      style={poster ? { backgroundImage: `url(${poster})` } : undefined}
    >
      {([0, 1] as const).map((index) => {
        const isVisible = visibleVideo === index;
        const isPrevious = previousVideo === index;

        return (
          <video
            key={index}
            ref={index === 0 ? firstVideoRef : secondVideoRef}
            autoPlay={index === 0}
            className={`absolute inset-0 size-full object-cover [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
              isVisible
                ? "z-20 opacity-100 transition-opacity"
                : isPrevious
                  ? "z-10 opacity-100"
                  : "z-0 opacity-0"
            }`}
            data-video-active={isVisible}
            disablePictureInPicture
            muted
            playsInline
            poster={poster}
            preload="auto"
            src={src}
            style={{ transitionDuration: `${fadeDuration}s` }}
            tabIndex={-1}
            onLoadedMetadata={() => restorePlayback(index)}
            onEnded={() => startCrossfade(index)}
            onTimeUpdate={() => handleTimeUpdate(index)}
          />
        );
      })}
    </div>
  );
}

export default SeamlessBackgroundVideo;
