"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  title: string;
  artwork?: string;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function AudioPlayer({ src, title, artwork }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.load();
    setPlaying(false);
    setCurrent(0);
  }, [src]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrent(value);
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
      />
      <div className="audio-artwork-wrap">
        {artwork ? <img className="audio-artwork" src={artwork} alt="Sampul media" /> : <div className="audio-artwork audio-artwork-fallback" />}
        <div className="audio-artwork-shine" />
      </div>
      <div className="audio-main">
        <div className="audio-kicker">PREVIEW AUDIO</div>
        <div className="audio-title" title={title}>{title}</div>
        <div className="audio-controls">
          <button className="player-button" type="button" onClick={togglePlayback} aria-label={playing ? "Jeda" : "Putar"}>
            {playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
          </button>
          <span className="time-label">{formatTime(current)}</span>
          <div className="range-wrap" style={{ "--range-progress": `${progress}%` } as React.CSSProperties}>
            <input
              aria-label="Posisi audio"
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(current, duration || 0)}
              onChange={(event) => seek(Number(event.target.value))}
            />
          </div>
          <span className="time-label">{formatTime(duration)}</span>
          <button className="icon-button subtle" type="button" onClick={toggleMute} aria-label={muted ? "Aktifkan suara" : "Bisukan"}>
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
