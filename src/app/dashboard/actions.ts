"use server";

import { auth } from "@clerk/nextjs/server";
import { refresh } from "next/cache";
import { collectNews, type CollectResult } from "@/lib/news/collect";

export type FetchNewsResult =
  | ({ ok: true } & CollectResult)
  | { ok: false; error: string };

export async function fetchNews(): Promise<FetchNewsResult> {
  // Server Action도 외부에서 직접 호출할 수 있으므로 로그인 여부를 다시 확인한다
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "로그인이 필요합니다." };
  }

  try {
    const result = await collectNews();
    if (result.added > 0) refresh();
    return { ok: true, ...result };
  } catch (error) {
    console.error("[fetchNews] 뉴스 수집 실패", error);
    return { ok: false, error: "뉴스를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
}
