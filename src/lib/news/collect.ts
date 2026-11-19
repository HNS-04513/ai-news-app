import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { articles, type NewArticle } from "@/db/schema";
import { FEEDS } from "./feeds";
import { fetchAllFeeds, type FeedItem } from "./fetch-feeds";

// 카드에 들어갈 임시 요약 길이 (Claude 요약이 생기기 전까지 원문 앞부분을 쓴다)
const SUMMARY_MAX_LENGTH = 300;

export type CollectResult = {
  added: number;
  failedSources: string[];
  allFailed: boolean;
};

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

// TODO: Claude API 연동 시 이 함수를 번역·요약·분류 호출로 교체한다
function toArticle(item: FeedItem): NewArticle {
  return {
    ...item,
    titleKo: item.originalTitle,
    summaryKo: item.originalContent
      ? truncate(item.originalContent, SUMMARY_MAX_LENGTH)
      : "",
    categoryId: null,
  };
}

export async function collectNews(): Promise<CollectResult> {
  const { items, failed } = await fetchAllFeeds();
  const failedSources = failed.map((f) => f.label);
  const allFailed = failed.length === FEEDS.length;

  // 1) 이번에 받은 기사끼리 URL 중복 제거
  const unique = [...new Map(items.map((item) => [item.originalUrl, item])).values()];
  if (unique.length === 0) return { added: 0, failedSources, allFailed };

  // 2) DB에 이미 있는 URL은 건너뛴다 (나중에 Claude를 다시 호출하지 않도록 미리 걸러낸다)
  const existing = await db
    .select({ url: articles.originalUrl })
    .from(articles)
    .where(inArray(articles.originalUrl, unique.map((i) => i.originalUrl)));
  const existingUrls = new Set(existing.map((r) => r.url));
  const fresh = unique.filter((i) => !existingUrls.has(i.originalUrl));
  if (fresh.length === 0) return { added: 0, failedSources, allFailed };

  // 3) 저장. 동시에 두 번 실행돼도 unique 제약에 걸리는 행은 조용히 건너뛴다
  const inserted = await db
    .insert(articles)
    .values(fresh.map(toArticle))
    .onConflictDoNothing({ target: articles.originalUrl })
    .returning({ id: articles.id });

  return { added: inserted.length, failedSources, allFailed };
}
