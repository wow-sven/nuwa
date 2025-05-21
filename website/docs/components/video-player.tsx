"use client";
import { useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  poster: string;
  className?: string;
}

export default function VideoPlayer({
  src,
  poster,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <div className={`flex flex-col items-center relative ${className}`}>
      <video
        ref={videoRef}
        className="w-full rounded-lg shadow-lg touch-manipulation"
        controls
        poster={poster}
        playsInline
        webkit-playsinline="true"
        controlsList="nodownload"
        disablePictureInPicture
        muted
        onPlay={() => setIsPlaying(true)}
        onPause={handlePause}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {!isPlaying && (
        <button
          onClick={handlePlay}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none z-10"
          aria-label="Play video"
        >
          <span className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white bg-opacity-80 rounded-full shadow-lg border-4 border-blue-500">
            <svg
              width="40"
              height="40"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="24" fill="#2563eb" />
              <polygon points="20,16 36,24 20,32" fill="white" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
