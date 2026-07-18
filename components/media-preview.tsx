"use client";

import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Music2, Video } from "lucide-react";
import { AudioPlayer } from "@/components/audio-player";
import type { MediaGalleryItem, NormalizedMedia } from "@/types/download";

function fallbackItems(media: NormalizedMedia): MediaGalleryItem[] {
  if (media.preview.video) return [{ id: "preview-video", kind: "video", url: media.preview.video, previewUrl: media.thumbnail, label: "Video utama" }];
  if (media.preview.audio) return [{ id: "preview-audio", kind: "audio", url: media.preview.audio, previewUrl: media.thumbnail, label: "Audio utama" }];
  if (media.preview.image) return [{ id: "preview-image", kind: "image", url: media.preview.image, previewUrl: media.preview.image, label: "Gambar utama" }];
  return [];
}

export function MediaPreview({ media }: { media: NormalizedMedia }) {
  const items = useMemo(() => media.gallery?.length ? media.gallery : fallbackItems(media), [media]);
  const [active, setActive] = useState(0);

  useEffect(() => setActive(0), [media.sourceUrl, media.title]);

  const selected = items[Math.min(active, Math.max(0, items.length - 1))];

  if (!selected) return null;

  return (
    <div className="media-preview-shell">
      <div className="preview-stage">
        <div className="preview-stage-badge">
          {selected.kind === "video" ? <Video size={14} /> : selected.kind === "audio" ? <Music2 size={14} /> : <ImageIcon size={14} />}
          <span>{selected.isLive ? "LIVE PHOTO" : selected.kind.toUpperCase()}</span>
          {items.length > 1 && <strong>{active + 1}/{items.length}</strong>}
        </div>

        {selected.kind === "video" ? (
          <video
            key={selected.url}
            className="video-preview"
            src={selected.url}
            poster={selected.previewUrl || media.thumbnail}
            controls
            playsInline
            preload="metadata"
          />
        ) : selected.kind === "audio" ? (
          <AudioPlayer src={selected.url} title={media.title} artwork={selected.previewUrl || media.thumbnail} />
        ) : (
          <div className="image-preview-wrap">
            <img
              key={selected.url}
              className="image-preview"
              src={selected.url}
              alt={selected.label || media.title}
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      {items.length > 1 && (
        <div className="preview-thumbnails" aria-label="Daftar media">
          {items.map((item, index) => (
            <button
              className={`preview-thumb ${index === active ? "active" : ""}`}
              type="button"
              key={item.id}
              onClick={() => setActive(index)}
              aria-label={`Tampilkan ${item.label}`}
            >
              {item.previewUrl || item.kind === "image" ? (
                <img src={item.previewUrl || item.url} alt="" referrerPolicy="no-referrer" />
              ) : item.kind === "video" ? (
                <Video size={19} />
              ) : (
                <Music2 size={19} />
              )}
              <span>{index + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
