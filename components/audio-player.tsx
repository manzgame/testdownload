"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, LoaderCircle, Pause, Play, Volume2, VolumeX } from "lucide-react";

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

function dominantColors(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 48;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0, 48, 48);
  const pixels = context.getImageData(0, 0, 48, 48).data;
  const buckets = new Map<string, { r: number; g: number; b: number; count: number; score: number }>();

  for (let index = 0; index < pixels.length; index += 16) {
    const alpha = pixels[index + 3];
    if (alpha < 180) continue;
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max - min;
    const lightness = (max + min) / 2;
    if (lightness < 15 || lightness > 244) continue;
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;
    const key = `${qr},${qg},${qb}`;
    const current = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0, score: 0 };
    current.r += r;
    current.g += g;
    current.b += b;
    current.count += 1;
    current.score += 1 + saturation / 80;
    buckets.set(key, current);
  }

  const ranked = [...buckets.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => ({
      r: Math.round(entry.r / entry.count),
      g: Math.round(entry.g / entry.count),
      b: Math.round(entry.b / entry.count),
    }));
  if (!ranked.length) return null;
  while (ranked.length < 3) ranked.push(ranked[ranked.length - 1]);
  return ranked.slice(0, 3).map(({ r, g, b }) => `rgb(${r} ${g} ${b})`);
}

export function AudioPlayer({ src, title, artwork }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const artworkRef = useRef<HTMLImageElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.load();
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setReady(false);
    setFailed(false);
  }, [src]);

  useEffect(() => setColors([]), [artwork]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !ready || failed) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlaying(false);
        setFailed(true);
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

  function captureArtworkColors() {
    const image = artworkRef.current;
    if (!image) return;
    try {
      const next = dominantColors(image);
      if (next) setColors(next);
    } catch {
      setColors([]);
    }
  }

  const progress = duration ? (current / duration) * 100 : 0;
  const style = colors.length
    ? ({
        "--art-color-a": colors[0],
        "--art-color-b": colors[1],
        "--art-color-c": colors[2],
      } as React.CSSProperties)
    : undefined;

  return (
    <div className={`audio-player ${colors.length ? "has-art-colors" : ""}`} style={style}>
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onCanPlay={() => { setReady(true); setFailed(false); }}
        onError={() => { setReady(false); setFailed(true); setPlaying(false); }}
      />
      <div className="audio-color-wash" />
      <div className="audio-artwork-wrap">
        {artwork ? (
          <img ref={artworkRef} className="audio-artwork" src={artwork} alt="Sampul media" onLoad={captureArtworkColors} />
        ) : (
          <div className="audio-artwork audio-artwork-fallback" />
        )}
        <div className="audio-artwork-shine" />
      </div>
      <div className="audio-main">
        <div className="audio-kicker">PREVIEW AUDIO</div>
        <div className="audio-title" title={title}>{title}</div>
        {!ready && !failed && <div className="audio-status"><LoaderCircle size={14} className="spin-icon" /> Menyiapkan audio...</div>}
        {failed && <div className="audio-status error"><AlertCircle size={14} /> Preview gagal dimuat. Tombol unduh tetap bisa dicoba.</div>}
        <div className="audio-controls">
          <button className="player-button" type="button" onClick={togglePlayback} disabled={!ready || failed} aria-label={playing ? "Jeda" : "Putar"}>
            {!ready && !failed ? <LoaderCircle size={19} className="spin-icon" /> : playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
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
              disabled={!ready}
              onChange={(event) => seek(Number(event.target.value))}
            />
          </div>
          <span className="time-label">{formatTime(duration)}</span>
          <button className="icon-button subtle" type="button" onClick={toggleMute} disabled={!ready} aria-label={muted ? "Aktifkan suara" : "Bisukan"}>
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
