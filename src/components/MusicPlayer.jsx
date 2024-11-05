import React, { useState, useEffect, useRef } from "react";

// Example song list structure (ensure that your songs are structured similarly)
const songs = [
  {
    songName: "Sickick",
    artist: "Sickick",
    cover: "/virginRecords.jpg",
    song: "https://raw.githubusercontent.com/abxlfazl/music-player-widget/main/src/assets/media/songs/1/song.mp3",
  },
  {
    songName: "Every 1s A Winner",
    artist: "Hot Chocolate",
    cover: "/virginRecords.jpg",
    song: "/Winner.mp3",
  },
  {
    songName: "Ox Out The Cage",
    artist: "Cannibal Ox",
    cover: "/virginRecords.jpg",
    song: "/Ox.mp3",
  },
];

const MusicPlayer = () => {
  const [indexSong, setIndexSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(new Audio());

  // Handles viewport resize adjustments
  useEffect(() => {
    const handleResize = () => {
      const vH = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vH", `${vH}px`);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setIndexSong((prev) => (prev < songs.length - 1 ? prev + 1 : 0));
    setIsPlaying(false);
    setProgress(0);
  };

  const handlePrev = () => {
    setIndexSong((prev) => (prev > 0 ? prev - 1 : songs.length - 1));
    setIsPlaying(false);
    setProgress(0);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      const progressPercentage = (audio.currentTime / audio.duration) * 100;
      setProgress(progressPercentage || 0);
    }
  };

  // Effect to handle audio changes when the song index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.load();

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }, [indexSong, isPlaying]);

  return (
    <div className="music-player flex-column">
      <div className="slider center">
        <div className="slider__content center">
          <button
            onClick={handlePlayPause}
            className={`music-player__broadcast-guarantor center button ${
              isPlaying ? "click" : ""
            }`}
          >
            <i className="icon-play" />
            <i className="icon-pause" />
          </button>
          <div className="slider__imgs flex-row">
            {songs.map(({ songName, cover }, index) => (
              <img
                key={index}
                src={cover}
                className={`img ${index === indexSong ? "active" : ""}`}
                alt={songName}
              />
            ))}
          </div>
        </div>
        <div className="slider__controls center">
          <button
            className="slider__switch-button flex-row button"
            onClick={handlePrev}
          >
            <i className="icon-back" />
          </button>
          <div className="music-player__info text_trsf-cap">
            <div>
              <div className="music-player__singer-name">
                {songs[indexSong]?.artist}
              </div>
            </div>
            <div>
              <div className="music-player__subtitle">
                {songs[indexSong]?.songName}
              </div>
            </div>
          </div>
          <button
            className="slider__switch-button flex-row button"
            onClick={handleNext}
          >
            <i className="icon-next" />
          </button>
          <div className="progress center">
            <div className="progress__wrapper">
              <div
                className="progress__bar center"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* The audio element for the current song */}
      <audio
        ref={audioRef}
        src={songs[indexSong]?.song}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
      />
    </div>
  );
};

export default MusicPlayer;
