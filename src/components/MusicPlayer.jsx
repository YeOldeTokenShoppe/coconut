import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

const MusicPlayer = () => {
  const audioElement = useRef(null);
  const albumImageRef = useRef(null); // Ref for the album image
  const tl = useRef(gsap.timeline({ repeat: -1, paused: true })); // GSAP timeline

  const songs = [
    {
      title: "",
      author: "",
      src: "https://raw.githubusercontent.com/ricardoolivaalonso/recursos/master/radio/radio.mp3",
      albumCover: "/virginRecords.jpg",
    },
    {
      title: "Sickick",
      author: "Sickick",
      src: "https://raw.githubusercontent.com/abxlfazl/music-player-widget/main/src/assets/media/songs/1/song.mp3",
      albumCover: "/virginRecords.jpg",
    },
    {
      title: "Every 1s A Winner",
      author: "Hot Chocolate",
      src: "/Winner.mp3",
      albumCover: "/virginRecords.jpg",
    },
    {
      title: "Ox Out The Cage",
      author: "Sickick",
      src: "/Ox.mp3",
      albumCover: "/virginRecords.jpg",
    },
  ];

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    loadSong(currentSongIndex);
    // Initialize GSAP for album rotation
    tl.current.to(albumImageRef.current, {
      rotation: 360, // Y-axis rotation to simulate a 3D spinning record
      duration: 3,
      ease: "linear",
      repeat: -1,
    });
  }, [currentSongIndex]);

  const loadSong = (songIndex) => {
    const song = songs[songIndex];
    audioElement.current.src = song.src;
    setIsPlaying(true);
    audioElement.current.play();
    tl.current.resume(); // Resume the rotation animation
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioElement.current.pause();
      setIsPlaying(false);
      tl.current.pause(); // Pause the rotation animation
      gsap.to(albumImageRef.current, { scale: 1, duration: 0.2 });
    } else {
      audioElement.current.play();
      setIsPlaying(true);
      tl.current.resume(); // Resume the rotation animation
      gsap.to(albumImageRef.current, { scale: 1.1, duration: 0.2 });
    }
  };

  const nextSong = () => {
    setCurrentSongIndex((currentSongIndex + 1) % songs.length);
  };

  const prevSong = () => {
    setCurrentSongIndex((currentSongIndex - 1 + songs.length) % songs.length);
  };

  const updateTime = () => {
    setCurrentTime(audioElement.current.currentTime);
    setDuration(audioElement.current.duration);
  };

  return (
    <div className="player">
      <div className="player__bar">
        <div
          className={`player__album ${isPlaying ? "rotating" : ""}`}
          ref={albumImageRef} // Ref for GSAP animation
          style={{
            backgroundImage: `url(${songs[currentSongIndex].albumCover})`,
          }}
        ></div>
        <div className="player__controls">
          <div className="player__prev" onClick={prevSong}>
            <svg
              class="icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
            >
              <path d="M26.695 34.434v31.132L54.5 49.998z" />
              <path d="M24.07 34.434v31.132c0 2.018 2.222 3.234 3.95 2.267l27.804-15.568c1.706-.955 1.707-3.578 0-4.533L28.02 32.168c-2.957-1.655-5.604 2.88-2.649 4.533l27.805 15.564v-4.533L25.371 63.3l3.95 2.267V34.435c-.001-3.387-5.251-3.387-5.251-.001z" />
              <g>
                <path d="M55.5 34.434v31.132l27.805-15.568z" />
                <path d="M52.875 34.434v31.132c0 2.018 2.222 3.234 3.949 2.267 9.27-5.189 18.537-10.379 27.805-15.568 1.705-.955 1.705-3.578 0-4.533L56.824 32.168c-2.957-1.655-5.604 2.88-2.648 4.533l27.803 15.564v-4.533L54.176 63.3l3.949 2.267V34.435c0-3.387-5.25-3.387-5.25-.001z" />
              </g>
            </svg>
          </div>
          <div className="player__play" onClick={togglePlay}>
            {isPlaying ? (
              <svg
                class="icon pause"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
              >
                <path d="M22.537 8.046h17.791c1.104 0 2.003.898 2.003 1.993v79.912a2.005 2.005 0 0 1-2.003 2.003h-17.79a2.005 2.005 0 0 1-2.003-2.003V10.04c0-1.095.898-1.993 2.002-1.993zM59.672 8.046h17.8c1.095 0 1.993.898 1.993 1.993v79.912a2.003 2.003 0 0 1-1.993 2.003h-17.8a1.997 1.997 0 0 1-1.993-2.003V10.04c0-1.095.889-1.993 1.993-1.993z" />
              </svg>
            ) : (
              <svg
                class="icon play"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
              >
                <path d="M51.109 30.335l-36-24A2 2 0 0 0 12 8v48a2.003 2.003 0 0 0 2 2c.388 0 .775-.113 1.109-.336l36-24a2 2 0 0 0 0-3.329z" />
              </svg>
            )}
          </div>
          <div className="player__next" onClick={nextSong}>
            <svg
              class="icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
            >
              <path d="M26.695 34.434v31.132L54.5 49.998z" />
              <path d="M24.07 34.434v31.132c0 2.018 2.222 3.234 3.95 2.267l27.804-15.568c1.706-.955 1.707-3.578 0-4.533L28.02 32.168c-2.957-1.655-5.604 2.88-2.649 4.533l27.805 15.564v-4.533L25.371 63.3l3.95 2.267V34.435c-.001-3.387-5.251-3.387-5.251-.001z" />
              <g>
                <path d="M55.5 34.434v31.132l27.805-15.568z" />
                <path d="M52.875 34.434v31.132c0 2.018 2.222 3.234 3.949 2.267 9.27-5.189 18.537-10.379 27.805-15.568 1.705-.955 1.705-3.578 0-4.533L56.824 32.168c-2.957-1.655-5.604 2.88-2.648 4.533l27.803 15.564v-4.533L54.176 63.3l3.949 2.267V34.435c0-3.387-5.25-3.387-5.25-.001z" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div className="player__timeline">
        <p className="player__song">{songs[currentSongIndex].title}</p>
        <div className="player__timelineBar">
          <div
            id="playhead"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
      </div>
      <audio ref={audioElement} onTimeUpdate={updateTime} onEnded={nextSong} />
    </div>
  );
};

export default MusicPlayer;
