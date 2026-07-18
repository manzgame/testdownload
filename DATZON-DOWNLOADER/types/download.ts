export type MediaKind = "video" | "audio" | "image" | "file";

export interface PlatformInfo {
  id: string;
  name: string;
  shortName: string;
  hostname: string;
}

export interface MediaDownload {
  id: string;
  kind: MediaKind;
  url: string;
  label: string;
  quality?: string;
  format?: string;
  size?: string;
}

export interface NormalizedMedia {
  title: string;
  author?: string;
  description?: string;
  thumbnail?: string;
  duration?: string;
  platform: PlatformInfo;
  preview: {
    video?: string;
    audio?: string;
    image?: string;
  };
  downloads: MediaDownload[];
}

export interface DownloadApiResponse {
  success: boolean;
  input: string;
  platform: PlatformInfo;
  media?: NormalizedMedia;
  error?: string;
}
