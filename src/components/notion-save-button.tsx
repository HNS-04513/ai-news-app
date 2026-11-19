"use client";

import { useState, useTransition } from "react";
import { saveArticleToNotion } from "@/app/actions/notion";

const secondaryButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-offset-zinc-900";

// ui.md 4.6: 저장 전 → 저장 중… → ✓ 저장됨 / 실패 시 저장 전으로 되돌리고 오류 표시
export function NotionSaveButton({
  articleId,
  initialSaved,
}: {
  articleId: number;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (saved || initialSaved) {
    return (
      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
        ✓ 저장됨
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await saveArticleToNotion(articleId);
            if (result.ok) setSaved(true);
            else setError(result.error);
          });
        }}
        className={secondaryButton}
      >
        {pending && (
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        )}
        {pending ? "저장 중…" : "뉴스 저장"}
      </button>
      {error && (
        <p role="alert" className="max-w-48 text-right text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
