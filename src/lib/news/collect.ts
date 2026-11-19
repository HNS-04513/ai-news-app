import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { FEEDS } from "./feeds";
import { fetchAllFeeds } from "./fetch-feeds";
import { processArticles } from "./process";

export type CollectResult = {
  added: number;
  failedSources: string[];
  allFailed: boolean;
  // Claude 번역·요약·분류에 실패해 저장하지 못한 기사 수 (다음 수집 때 다시 시도된다)
  failedArticles: number;
};

export async function collectNews(): Promise<CollectResult> {
  const { items, failed } = await fetchAllFeeds();
  const failedSources = failed.map((f) => f.label);
  const allFailed = failed.length === FEEDS.length;
  const empty = { added: 0, failedSources, allFailed, failedArticles: 0 };

  // 1) 이번에 받은 기사끼리 URL 중복 제거
  const unique = [...new Map(items.map((item) => [item.originalUrl, item])).values()];
  if (unique.length === 0) return empty;

  // 2) DB에 이미 있는 URL은 건너뛴다 (이미 처리한 기사는 Claude를 다시 호출하지 않는다)
  //    사용자가 삭제한 기사(deleted_at 있음)도 일부러 포함해서, 삭제한 뉴스가 다시 들어오지 않게 한다
  const existing = await db
    .select({ url: articles.originalUrl })
    .from(articles)
    .where(inArray(articles.originalUrl, unique.map((i) => i.originalUrl)));
  const existingUrls = new Set(existing.map((r) => r.url));
  const fresh = unique.filter((i) => !existingUrls.has(i.originalUrl));
  if (fresh.length === 0) return empty;

  // 3) 새 기사만 Claude로 번역·요약·분류
  const categoryList = await db.select().from(categories);
  const { processed, failed: failedArticles } = await processArticles(
    fresh,
    categoryList,
  );
  if (processed.length === 0) return { ...empty, failedArticles };

  // 4) 저장. 동시에 두 번 실행돼도 unique 제약에 걸리는 행은 조용히 건너뛴다
  const inserted = await db
    .insert(articles)
    .values(processed)
    .onConflictDoNothing({ target: articles.originalUrl })
    .returning({ id: articles.id });

  return { added: inserted.length, failedSources, allFailed, failedArticles };
}
