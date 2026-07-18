export function sanitizeFilename(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._ -]+/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 110) || "datzon-media";
}

export function proxyMediaUrl(url?: string, options?: { download?: boolean; filename?: string }) {
  if (!url) return "";
  if (url.startsWith("/api/media?")) return url;
  const params = new URLSearchParams({ url });
  if (options?.download) params.set("download", "1");
  if (options?.filename) params.set("filename", sanitizeFilename(options.filename));
  return `/api/media?${params.toString()}`;
}

export function filenameForMedia(title: string, label: string, format?: string) {
  const extension = (format || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = sanitizeFilename(`${title}-${label}`);
  return extension && !base.toLowerCase().endsWith(`.${extension}`) ? `${base}.${extension}` : base;
}
