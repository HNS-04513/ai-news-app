"use server";

import { auth } from "@clerk/nextjs/server";
import { refresh } from "next/cache";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { collectNews, type CollectResult } from "@/lib/news/collect";

// ── 뉴스 가져오기 ──────────────────────────────────────────

export type FetchNewsResult =
  ({ ok: true } & CollectResult) | { ok: false; error: string };

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
    return {
      ok: false,
      error: "뉴스를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

// ── 카테고리 추가 ──────────────────────────────────────────

export type CreateCategoryState = {
  ok: boolean;
  errors?: { name?: string; description?: string; form?: string };
};

const NAME_MAX = 30;
const DESCRIPTION_MAX = 300;

export async function createCategory(
  formData: FormData,
): Promise<CreateCategoryState> {
  // 서버 액션은 POST로 직접 호출될 수 있으므로 여기서도 로그인을 확인한다
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, errors: { form: "로그인이 필요합니다." } };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const errors: CreateCategoryState["errors"] = {};
  if (!name) errors.name = "이름을 입력해 주세요.";
  else if (name.length > NAME_MAX)
    errors.name = `이름은 ${NAME_MAX}자 이하로 입력해 주세요.`;
  else if (name === "전체" || name === "미분류")
    errors.name = "이미 쓰고 있는 이름입니다.";
  if (!description) errors.description = "설명을 입력해 주세요.";
  else if (description.length > DESCRIPTION_MAX)
    errors.description = `설명은 ${DESCRIPTION_MAX}자 이하로 입력해 주세요.`;
  if (errors.name || errors.description) return { ok: false, errors };

  try {
    const inserted = await db
      .insert(categories)
      .values({ name, description })
      .onConflictDoNothing({ target: categories.name })
      .returning({ id: categories.id });

    if (inserted.length === 0) {
      return { ok: false, errors: { name: "이미 있는 카테고리 이름입니다." } };
    }
  } catch (error) {
    console.error("카테고리 추가 실패", error);
    return {
      ok: false,
      errors: {
        form: "카테고리를 추가하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
    };
  }

  refresh();
  return { ok: true };
}
