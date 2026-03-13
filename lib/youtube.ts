/**
 * lib/youtube.ts
 * YouTube URL validation and video metadata retrieval.
 * Uses YouTube oEmbed API (no API key required).
 */

export interface VideoMetadata {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  authorName: string;
}

/**
 * Extract the video ID from a variety of YouTube URL formats.
 * Returns null if the URL is not a valid YouTube video URL.
 */
export function extractVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  // Trim whitespace
  const trimmed = url.trim();

  // Patterns to match:
  // https://www.youtube.com/watch?v=VIDEOID
  // https://youtu.be/VIDEOID
  // https://www.youtube.com/embed/VIDEOID
  // https://www.youtube.com/shorts/VIDEOID
  // https://m.youtube.com/watch?v=VIDEOID
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validates a YouTube URL and returns the video ID.
 * Throws a descriptive error if invalid.
 */
export function validateYoutubeUrl(url: string): string {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error(
      "Invalid YouTube URL. Please provide a valid YouTube video link (e.g. https://youtube.com/watch?v=...)"
    );
  }
  return videoId;
}

/**
 * Fetch video metadata via YouTube oEmbed (no API key needed).
 * Falls back to defaults if the fetch fails.
 */
export async function getVideoMetadata(videoId: string): Promise<VideoMetadata> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

  try {
    const res = await fetch(oEmbedUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`oEmbed request failed: ${res.status}`);
    }

    const data = await res.json();

    return {
      videoId,
      title: data.title || "Unknown Video",
      thumbnailUrl:
        data.thumbnail_url ||
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      authorName: data.author_name || "Unknown Author",
    };
  } catch (err) {
    console.warn("[YouTube] Could not fetch oEmbed metadata:", err);
    // Return sensible defaults so the app doesn't crash
    return {
      videoId,
      title: "YouTube Video",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      authorName: "Unknown Author",
    };
  }
}
