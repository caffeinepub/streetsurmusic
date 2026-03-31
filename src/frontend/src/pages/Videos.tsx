import { Loader2, Youtube } from "lucide-react";
import { useEffect, useState } from "react";

interface VideoItem {
  videoId: string;
  title: string;
  thumbnail: string;
  url: string;
  published: string;
}

const CHANNEL_ID = "UCQBX2tMQ0YqBokJ6YDfKPzg";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

// Multiple CORS proxies as fallbacks
const PROXIES = [
  `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`,
  `https://corsproxy.io/?${encodeURIComponent(RSS_URL)}`,
  `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(RSS_URL)}`,
];

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

async function fetchWithFallback(): Promise<string> {
  for (const proxyUrl of PROXIES) {
    try {
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const text = await res.text();
        // Validate it's actually XML with YouTube entries
        if (text.includes("<entry>") || text.includes("yt:channel")) {
          return text;
        }
      }
    } catch {
      // Try next proxy
    }
  }
  throw new Error("All proxies failed");
}

function parseVideos(xmlText: string): VideoItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const entries = Array.from(doc.querySelectorAll("entry"));
  return entries
    .map((entry) => {
      const videoId =
        entry.getElementsByTagNameNS(
          "http://www.youtube.com/xml/schemas/2015",
          "videoId",
        )[0]?.textContent ??
        entry.querySelector("videoId")?.textContent ??
        "";
      const title = entry.querySelector("title")?.textContent ?? "";
      const thumbnail =
        entry
          .getElementsByTagNameNS(
            "http://search.yahoo.com/mrss/",
            "thumbnail",
          )[0]
          ?.getAttribute("url") ??
        (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "");
      const url =
        entry.querySelector('link[rel="alternate"]')?.getAttribute("href") ??
        (videoId ? `https://www.youtube.com/watch?v=${videoId}` : "");
      const published = entry.querySelector("published")?.textContent ?? "";
      return { videoId, title, thumbnail, url, published };
    })
    .filter((v) => v.videoId && v.title);
}

export function Videos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchVideos() {
      try {
        const xmlText = await fetchWithFallback();
        if (!cancelled) {
          const parsed = parseVideos(xmlText);
          setVideos(parsed);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }
    fetchVideos();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Videos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Latest videos from StreetSurMusic
          </p>
        </div>
        <a
          href="https://www.youtube.com/@streetsurmusic"
          target="_blank"
          rel="noreferrer"
          data-ocid="videos.subscribe_button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg flex-shrink-0"
        >
          <Youtube className="w-4 h-4" />
          Subscribe on YouTube
        </a>
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="flex items-center justify-center py-24"
          data-ocid="videos.loading_state"
        >
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          className="flex flex-col items-center justify-center py-24 gap-4 text-center"
          data-ocid="videos.error_state"
        >
          <Youtube className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">
            Videos load nahi hue. YouTube channel pe directly dekho.
          </p>
          <a
            href="https://www.youtube.com/@streetsurmusic"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            <Youtube className="w-4 h-4" />
            YouTube Channel Dekho
          </a>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && videos.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-24 gap-3 text-center"
          data-ocid="videos.empty_state"
        >
          <Youtube className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">
            Abhi koi video nahi hai. Subscribe karo update ke liye!
          </p>
        </div>
      )}

      {/* Video grid */}
      {!loading && !error && videos.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          data-ocid="videos.list"
        >
          {videos.map((video, idx) => (
            <a
              key={video.videoId}
              href={video.url}
              target="_blank"
              rel="noreferrer"
              data-ocid={`videos.item.${idx + 1}`}
              className="group bg-card border border-border rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30 hover:border-primary/30 block"
            >
              {/* Thumbnail */}
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                  loading="lazy"
                />
              </div>
              {/* Info */}
              <div className="p-3 space-y-1">
                <p
                  className="font-medium text-sm text-foreground line-clamp-2 leading-snug"
                  title={video.title}
                >
                  {video.title}
                </p>
                {video.published && (
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(video.published)}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
