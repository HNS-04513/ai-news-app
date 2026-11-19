"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { articles } from "@/db/schema";

export type DeleteArticleResult = { ok: true } | { ok: false; error: string };

export async function deleteArticle(
  articleId: number,
): Promise<DeleteArticleResult> {
  // 서버 액션은 외부에서 직접 호출될 수 있으므로 여기서도 로그인을 확인한다
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "로그인이 필요합니다." };

  if (!Number.isInteger(articleId)) {
    return { ok: false, error: "잘못된 요청입니다." };
  }

  try {
    // 행을 지우지 않고 deleted_at만 기록한다. original_url이 DB에 남아 있어야
    // 다음 '뉴스 가져오기' 때 같은 기사가 새 기사로 다시 수집되지 않는다.
    // 이미 삭제된 기사여도 결과는 같으므로 성공으로 본다
    await db
      .update(articles)
      .set({ deletedAt: new Date() })
      .where(and(eq(articles.id, articleId), isNull(articles.deletedAt)));
  } catch (error) {
    console.error("[deleteArticle] 기사 삭제 실패", error);
    return {
      ok: false,
      error: "뉴스를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  // 목록·카테고리 개수·페이지 수를 다시 그려서 카드가 화면에서 사라지게 한다
  refresh();
  return { ok: true };
}
