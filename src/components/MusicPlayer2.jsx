import React, { useState, useRef, useEffect } from "react";

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [playProgress, setPlayProgress] = useState(0);
  const audioRef = useRef(null); // Initialize as `null` and set in `useEffect`

  const albums = [
    "Doo-Wops & Hooligans",
    "Every 1's A Winner",
    "The Cold Vein",
    "Hozier",
    "Proxy (Original Mix)",
  ];
  const trackNames = [
    "Talking To The Moon - Bruo Mars",
    "Every 1's A Winner - Hot Chocolate",
    "Ox out the Cage - Cannibal Ox",
    "Take Me To Church - Hozier",
    "Martin Garrix - Proxy",
  ];
  const trackUrls = [
    "https://raw.githubusercontent.com/abxlfazl/music-player-widget/main/src/assets/media/songs/1/song.mp3",
    "/Winner.mp3",
    "/Ox.mp3",
    "/takeMeToChurch.mp3",
    "https://raw.githubusercontent.com/himalayasingh/music-player-1/master/music/5.mp3",
  ];

  // Initialize the audio element and event listeners only once on client-side mount
  useEffect(() => {
    // Only run this code on the client side
    const audio = new Audio(trackUrls[currentTrackIndex]);
    audioRef.current = audio;

    // Sync `isPlaying` state with audio play/pause events
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(formatTime(audio.duration));
    });

    return () => {
      // Cleanup listeners
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  // Update the audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Stop the current track and reset playback
      audio.pause();
      audio.currentTime = 0;

      // Update source for the new track and load it
      audio.src = trackUrls[currentTrackIndex];
      audio.load();

      // Automatically play if `isPlaying` is true
      if (isPlaying) {
        audio.play();
      }
    }
  }, [currentTrackIndex, isPlaying]);

  // Format time from seconds to MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Update current time and progress bar
  const updateProgress = () => {
    const audio = audioRef.current;
    setCurrentTime(formatTime(audio.currentTime));
    setPlayProgress((audio.currentTime / audio.duration) * 100);
  };

  // Handle play and pause
  const playPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  // Navigate to next or previous track
  const changeTrack = (direction) => {
    setCurrentTrackIndex(
      (prevIndex) =>
        (prevIndex + direction + trackUrls.length) % trackUrls.length
    );
  };

  // Seek within the track
  const handleSeek = (e) => {
    const audio = audioRef.current;
    const seekTime =
      (e.nativeEvent.offsetX / e.target.clientWidth) * audio.duration;
    audio.currentTime = seekTime;
    updateProgress();
  };

  // Set the icon based on isPlaying state
  const playPauseIconClass = isPlaying
    ? "fa-solid fa-pause"
    : "fa-solid fa-play";

  return (
    <div className="music-player">
      <div id="app-cover">
        <div id="player">
          <div id="player-track" className={isPlaying ? "active" : ""}>
            <div id="album-name">{albums[currentTrackIndex]}</div>
            <div id="track-name">{trackNames[currentTrackIndex]}</div>
            <div id="track-time">
              <div id="current-time">{currentTime}</div>
              <div id="track-length">{duration}</div>
            </div>
            <div id="s-area" onClick={handleSeek}>
              <div id="seek-bar" style={{ width: `${playProgress}%` }}></div>
            </div>
          </div>
          <div id="player-content">
            <div id="album-art" className={`${isPlaying ? "rotate" : ""}`}>
              <img
                src="/virginRecords.jpg"
                className="active"
                alt="Album Art"
              />
            </div>
            <div id="player-controls">
              <div className="control" onClick={() => changeTrack(-1)}>
                <div className="button" id="play-previous">
                  <i className="fa-solid fa-backward"></i>
                </div>
              </div>
              <div className="control" onClick={playPause}>
                <div className="button" id="play-pause-button">
                  <i className={playPauseIconClass}></i>
                </div>
              </div>
              <div className="control" onClick={() => changeTrack(1)}>
                <div className="button" id="play-next">
                  <i className="fa-solid fa-forward"></i>
                </div>
              </div>
              <div
                id="current-track-info"
                style={{ textAlign: "center", marginTop: "2.5rem" }}
              >
                {trackNames[currentTrackIndex]}
              </div>
            </div>
            {/* Track Info */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
