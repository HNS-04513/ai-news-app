"use client";

import { useState, useTransition } from "react";
import { deleteArticle } from "@/app/actions/articles";

// ui.md 4.5: 카드 오른쪽 위의 단독 아이콘 버튼
export function DeleteArticleButton({
  articleId,
  title,
}: {
  articleId: number;
  title: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    // 되돌릴 수 없는 작업이고 X 버튼은 잘못 누르기 쉬우므로 한 번 확인한다
    if (!window.confirm(`이 뉴스를 삭제할까요?\n\n${title}`)) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteArticle(articleId);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="relative -mr-1.5 shrink-0">
      {/* 마우스 환경에서는 카드에 올리거나 포커스할 때만 보이고, 터치 환경에서는 항상 보인다.
          삭제 중이거나 오류가 있으면 계속 보인다 */}
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label="뉴스 삭제"
        title="뉴스 삭제"
        className={`flex rounded-md p-0.5 text-zinc-500 transition hover:bg-red-50 ${pending || error ? "" : "pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100"} hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:focus-visible:ring-offset-zinc-900`}
      >
        {pending ? (
          <span
            className="m-0.5 size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        ) : (
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            className="size-5"
            aria-hidden
          >
            <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
          </svg>
        )}
      </button>
      {error && (
        <p
          role="alert"
          className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 shadow-lg dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
