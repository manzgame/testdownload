import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { cobaltDownload } from "@/lib/cobalt";
import { detectPlatform } from "@/lib/platforms";
import type { DownloadApiResponse, MediaKind, NormalizedMedia, PlatformInfo } from "@/types/download";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
 
const DIRECT_EXTENSIONS: Record<string, MediaKind> = {
  mp4: "video",
  webm: "video",
  mov: "video",
  m4v: "video",
  mkv: "video",
  mp3: "audio",
  m4a: "audio",
  aac: "audio",
  wav: "audio",
  ogg: "audio",
  opus: "audio",
  flac: "audio",
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
  gif: "image",
  avif: "image",
};

function json(payload: DownloadApiResponse, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function directMedia(url: string, platform: PlatformInfo): NormalizedMedia | null {
  try {
    const parsed = new URL(url);
    const rawName = parsed.pathname.split("/").filter(Boolean).pop() || "media";
    const filename = decodeURIComponent(rawName);
    const extension = filename.includes(".") ? filename.split(".").pop()?.toLowerCase() : undefined;
    if (!extension || !DIRECT_EXTENSIONS[extension]) return null;

    const kind = DIRECT_EXTENSIONS[extension];
    const cleanTitle = filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Media langsung";
    const id = createHash("sha1").update(url).digest("hex").slice(0, 12);

    return {
      title: cleanTitle,
      author: parsed.hostname.replace(/^www\./, ""),
      description: "Tautan ini mengarah langsung ke berkas media, jadi tidak perlu diproses oleh layanan eksternal.",
      platform,
      preview: {
        video: kind === "video" ? url : undefined,
        audio: kind === "audio" ? url : undefined,
        image: kind === "image" ? url : undefined,
      },
      downloads: [
        {
          id,
          kind,
          url,
          label: `${kind === "video" ? "Video" : kind === "audio" ? "Audio" : "Gambar"} asli`,
          format: extension.toUpperCase(),
        },
      ],
    };
  } catch {
    return null;
  }
}

async function processUrl(input: unknown) {
  const url = typeof input === "string" ? input.trim() : "";
  const platform = detectPlatform(url);

  if (!url) return json({ success: false, input: "", platform, error: "Tempel tautan media terlebih dahulu." }, 400);
  if (url.length > 4096) return json({ success: false, input: url, platform, error: "Tautan terlalu panjang." }, 400);

  const direct = directMedia(url, platform);
  if (direct) return json({ success: true, input: url, platform, media: direct });

  const result = await cobaltDownload(url, platform);
  if (!result.ok || !result.media) {
    return json(
      {
        success: false,
        input: url,
        platform,
        error: result.error || "Media belum bisa diproses. Pastikan tautannya publik dan backend aktif.",
      },
      result.status >= 400 && result.status <= 599 ? result.status : 502,
    );
  }

  return json({ success: true, input: url, platform, media: result.media });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return processUrl(body?.url);
  } catch {
    return json(
      {
        success: false,
        input: "",
        platform: detectPlatform(""),
        error: "Permintaan tidak valid.",
      },
      400,
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  return processUrl(url);
}
