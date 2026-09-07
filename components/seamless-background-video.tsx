"use client";

import { useEffect, useRef, useState } from "react";

type VideoIndex = 0 | 1;

type SeamlessBackgroundVideoProps = {
  className?: string;
  fadeDuration?: number;
  src: string;
};

export function SeamlessBackgroundVideo({
  className = "",
  fadeDuration = 1.2,
  src,
}: SeamlessBackgroundVideoProps) {
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const transitionInProgressRef = useRef(false);
  const [visibleVideo, setVisibleVideo] = useState<VideoIndex>(0);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const getVideo = (index: VideoIndex) =>
    index === 0 ? firstVideoRef.current : secondVideoRef.current;

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
        setVisibleVideo(nextIndex);

        transitionTimerRef.current = window.setTimeout(() => {
          currentVideo.pause();
          currentVideo.currentTime = 0;
          transitionInProgressRef.current = false;
        }, fadeDuration * 1000);
      })
      .catch(() => {
        transitionInProgressRef.current = false;
        currentVideo.currentTime = 0;
        void currentVideo.play();
      });
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
    <div className={`relative overflow-hidden bg-[#211915] ${className}`}>
      {([0, 1] as const).map((index) => {
        const isVisible = visibleVideo === index;

        return (
          <video
            key={index}
            ref={index === 0 ? firstVideoRef : secondVideoRef}
            autoPlay={index === 0}
            className={`absolute inset-0 size-full object-cover transition-opacity [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            data-video-active={isVisible}
            disablePictureInPicture
            muted
            playsInline
            preload="auto"
            src={src}
            style={{ transitionDuration: `${fadeDuration}s` }}
            tabIndex={-1}
            onEnded={() => startCrossfade(index)}
            onTimeUpdate={() => handleTimeUpdate(index)}
          />
        );
      })}
    </div>
  );
}

export default SeamlessBackgroundVideo;
