"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { sourceLabel } from "@/lib/format";
import {
  getNotionClient,
  getNotionDataSourceId,
  NOTION_PROPS,
} from "@/lib/notion";

export type SaveToNotionResult =
  | { ok: true; notionPageId: string }
  | { ok: false; error: string };

// Notion rich_text 한 덩어리는 최대 2000자
const clip = (text: string, max = 2000) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

export async function saveArticleToNotion(
  articleId: number,
): Promise<SaveToNotionResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "로그인이 필요합니다." };

  const [article] = await db
    .select({
      id: articles.id,
      source: articles.source,
      originalTitle: articles.originalTitle,
      originalUrl: articles.originalUrl,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      publishedAt: articles.publishedAt,
      notionPageId: articles.notionPageId,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    // 삭제한 기사는 저장하지 않는다 (다른 탭에 카드가 남아 있는 경우 등)
    .where(and(eq(articles.id, articleId), isNull(articles.deletedAt)))
    .limit(1);

  if (!article) return { ok: false, error: "기사를 찾을 수 없습니다." };
  // 이미 저장한 기사는 다시 저장하지 않는다
  if (article.notionPageId) {
    return { ok: true, notionPageId: article.notionPageId };
  }

  let pageId: string;
  try {
    const notion = getNotionClient();
    const page = await notion.pages.create({
      parent: { data_source_id: await getNotionDataSourceId() },
      properties: {
        [NOTION_PROPS.title]: {
          title: [{ text: { content: clip(article.titleKo) } }],
        },
        [NOTION_PROPS.summary]: {
          rich_text: [{ text: { content: clip(article.summaryKo) } }],
        },
        [NOTION_PROPS.category]: {
          multi_select: [{ name: article.categoryName ?? "미분류" }],
        },
        [NOTION_PROPS.source]: { url: article.originalUrl },
        ...(article.publishedAt && {
          [NOTION_PROPS.date]: {
            date: { start: article.publishedAt.toISOString().slice(0, 10) },
          },
        }),
      },
      // 본문: 출처 이름과 원문 제목
      children: [
        {
          paragraph: {
            rich_text: [
              { text: { content: `${sourceLabel(article.source)} · ` } },
              {
                text: {
                  content: clip(article.originalTitle, 1900),
                  link: { url: article.originalUrl },
                },
              },
            ],
          },
        },
      ],
    });
    pageId = page.id;
  } catch (err) {
    console.error("Notion 저장 실패", err);
    const reason = err instanceof Error ? err.message : "알 수 없는 오류";
    return { ok: false, error: `Notion에 저장하지 못했습니다: ${reason}` };
  }

  await db
    .update(articles)
    .set({ notionPageId: pageId })
    .where(and(eq(articles.id, articleId), isNull(articles.notionPageId)));

  refresh();
  return { ok: true, notionPageId: pageId };
}
