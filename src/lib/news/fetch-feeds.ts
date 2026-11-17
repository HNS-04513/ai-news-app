import Parser from "rss-parser";
import { FEEDS, type Feed, type FeedSource } from "./feeds";

// 지난 24시간 동안 발행된 기사만 가져온다
const WINDOW_MS = 24 * 60 * 60 * 1000;
// 피드가 갑자기 많은 기사를 내보내도 한 번에 처리하는 양을 제한한다
const MAX_ITEMS_PER_FEED = 15;

export type FeedItem = {
  source: FeedSource;
  originalTitle: string;
  originalUrl: string;
  originalContent: string | null;
  publishedAt: Date;
};

const parser = new Parser({ timeout: 10_000 });

// 추적용 쿼리(utm_*)와 #해시를 지워서 같은 기사가 다른 URL로 저장되지 않게 한다
export function normalizeUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith("utm_")) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchFeed(feed: Feed, since: number): Promise<FeedItem[]> {
  const parsed = await parser.parseURL(feed.url);
  const items: FeedItem[] = [];

  for (const item of parsed.items) {
    const title = item.title?.trim();
    const url = item.link ? normalizeUrl(item.link) : null;
    const dateStr = item.isoDate ?? item.pubDate;
    const publishedAt = dateStr ? new Date(dateStr) : null;

    if (!title || !url || !publishedAt || Number.isNaN(publishedAt.getTime())) {
      continue;
    }
    if (publishedAt.getTime() < since) continue;

    items.push({
      source: feed.source,
      originalTitle: title,
      originalUrl: url,
      // HTML 태그가 제거된 텍스트
      originalContent: item.contentSnippet?.trim() || null,
      publishedAt,
    });
  }

  return items
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, MAX_ITEMS_PER_FEED);
}

// 피드 하나가 실패해도 나머지는 계속 처리하고, 실패한 피드를 따로 알려준다
export async function fetchAllFeeds(now = Date.now()) {
  const since = now - WINDOW_MS;
  const results = await Promise.allSettled(
    FEEDS.map((feed) => fetchFeed(feed, since)),
  );

  const items: FeedItem[] = [];
  const failed: Feed[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      console.error(`[rss] ${FEEDS[i].label} 피드를 가져오지 못했습니다`, result.reason);
      failed.push(FEEDS[i]);
    }
  });

  return { items, failed };
}
