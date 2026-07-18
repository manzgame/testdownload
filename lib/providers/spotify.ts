import type { NormalizedMedia, PlatformInfo } from "@/types/download";
import { fetchJson, firstString, makeDownload, makeGallery, safeString } from "./shared";
import type { ProviderResult } from "./tiktok";
 
type AnyRecord = Record<string, unknown>;

function record(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as AnyRecord : {};
}

function normalizeSpotify(payload: unknown, sourceUrl: string, platform: PlatformInfo): NormalizedMedia {
  const root = record(payload);
  const data = record(root.data ?? root);
  const title = firstString(data.title) || "Untitled Song";
  const artist = firstString(data.artist) || "Unknown Artist";
  const album = firstString(data.album);
  const duration = firstString(data.duration) || undefined;
  const cover = firstString(data.cover_url, data.cover, data.thumbnail);
  const audio = firstString(data.download_url, data.audio, data.url);
  const provider = firstString(root.author, root.creator) || "BINTANG API";

  return {
    title,
    author: artist,
    album: album || undefined,
    description: album ? `${artist} • ${album}` : artist,
    thumbnail: cover || undefined,
    duration,
    platform,
    preview: { audio: audio || undefined, image: !audio ? cover || undefined : undefined },
    downloads: audio ? [makeDownload({ url: audio, kind: "audio", label: "Audio MP3", quality: "Original", format: "MP3", thumbnail: cover || undefined })] : [],
    gallery: audio ? [makeGallery({ url: audio, kind: "audio", previewUrl: cover || undefined, label: "Audio Spotify" })] : [],
    creator: { name: artist },
    contentType: "Musik",
    sourceUrl,
    provider,
  };
}

export async function spotifyDownload(url: string, platform: PlatformInfo): Promise<ProviderResult> {
  try {
    const endpoint = `https://bintangapi.my.id/api/downloader/spotify?url=${encodeURIComponent(url)}`;
    const payload = await fetchJson(endpoint) as AnyRecord;
    if (!payload.success || !payload.data) {
      return { ok: false, status: 502, error: safeString(payload.error) || "API Spotify tidak mengembalikan data lagu." };
    }
    const media = normalizeSpotify(payload, url, platform);
    if (!media.preview.audio || !media.downloads.length) {
      return { ok: false, status: 422, error: "Data lagu ditemukan, tetapi URL audionya kosong." };
    }
    return { ok: true, status: 200, media };
  } catch (error) {
    return {
      ok: false,
      status: error instanceof Error && error.name === "AbortError" ? 504 : 502,
      error: error instanceof Error ? `Spotify gagal diproses: ${error.message}` : "Spotify gagal diproses.",
    };
  }
}
