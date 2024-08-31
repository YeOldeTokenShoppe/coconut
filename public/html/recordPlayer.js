let audioCtx,
  buffer,
  source,
  speed = 1,
  currentSongIndex = 0;
const body = document.body,
  play = document.getElementById("play"),
  stop = document.getElementById("stop"),
  vinyl = document.getElementById("vinyl");

const songs = [
  { url: "./Hot-Chocolate-Every-1s-A-Winner.mp3", img: "./every1.jpg" },
  { url: "./OxOutTheCage.mp3", img: "./cannibalOx.jpg" },
  { url: "./takeMeToChurch.mp3", img: "./every1.jpg" },
];

document.addEventListener("DOMContentLoaded", function () {
  window.scrollTo(0, document.body.scrollHeight / 2.5);
});

gsap.to("body", {
  opacity: 1,
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.05,
    onLeave: function () {
      window.scrollTo(0, 0);
    },
    onScrubComplete: (self) => {
      speed = 1;
      body.style.setProperty("--cursor", "grab");
      if (play.disabled === true) {
        source.playbackRate.value = speed;
        body.style.setProperty("--speed", 1);
      }
      if (self.progress === 0) {
        window.scrollTo(0, document.body.scrollHeight);
      }
    },
    onUpdate: ({ getVelocity }) => {
      if (getVelocity() < 1) {
        speed = Math.max(1 - Math.abs(getVelocity() / 3000), 0.05);
        body.style.setProperty("--speed", speed);
      } else {
        speed = 1 + Math.abs(getVelocity() / 3000);
        body.style.setProperty("--speed", speed);
      }
      if (play.disabled === true) {
        body.style.setProperty("--cursor", "grabbing");
        source.playbackRate.value = speed;
      }
    },
  },
});

async function loadAudio(url) {
  try {
    console.log(`Loading audio from: ${url}`);
    const response = await fetch(url);
    buffer = await audioCtx.decodeAudioData(await response.arrayBuffer());
    console.log(`Audio loaded successfully from: ${url}`);
  } catch (err) {
    console.error(`Unable to fetch the audio file. Error: ${err.message}`);
  }
}

async function playAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  const currentSong = songs[currentSongIndex];
  console.log(`Playing audio: ${currentSong.url}`);
  await loadAudio(currentSong.url);

  vinyl.style.backgroundImage = `radial-gradient(circle at center, #ccc -0.5vmin, #777 1.5vmin, transparent 1vmin, transparent 26%, #111 27.5%, #111), url(${currentSong.img}) 50% 50% / 43% 43% no-repeat`;
  console.log(`Vinyl image changed to: ${currentSong.img}`);

  source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.loop = false; // Don't loop
  source.start();
  play.disabled = true;

  source.onended = () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    play.disabled = false;
  };
}

play.addEventListener("click", async () => {
  body.classList.add("playing");
  await playAudio();
});

stop.addEventListener("click", () => {
  body.classList.remove("playing");
  if (source) {
    source.onended = null; // Remove the onended event listener
    source.stop();
  }
  currentSongIndex = (currentSongIndex + 1) % songs.length; // Move to the next song
  play.disabled = false;
});
