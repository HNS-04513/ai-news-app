"use client";

import { useEffect, useState, useTransition } from "react";
import { fetchNews } from "@/app/dashboard/actions";

type Toast = { message: string; failure?: string; error?: boolean };

const primaryButton =
  "inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:ring-offset-zinc-900";

const ALL_FAILED = "뉴스를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.";

export function FetchNewsButton() {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<Toast | null>(null);

  // ui.md 4.7: 일반 토스트는 4초 뒤 사라지고, 오류는 사용자가 닫을 때까지 남긴다
  useEffect(() => {
    if (!toast || toast.error) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function handleClick() {
    setToast(null);
    startTransition(async () => {
      try {
        const result = await fetchNews();
        if (!result.ok) {
          setToast({ message: result.error, error: true });
        } else if (result.allFailed) {
          setToast({ message: ALL_FAILED, error: true });
        } else {
          setToast({
            message:
              result.added > 0
                ? `새 뉴스 ${result.added}건을 추가했습니다.`
                : "새로운 뉴스가 없습니다.",
            failure:
              result.failedSources.length > 0
                ? `${result.failedSources.join(", ")}에서 가져오지 못했습니다.`
                : undefined,
          });
        }
      } catch {
        setToast({ message: ALL_FAILED, error: true });
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={primaryButton}
      >
        {pending ? (
          <>
            <span
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
            가져오는 중…
          </>
        ) : (
          "뉴스 가져오기"
        )}
      </button>

      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0"
      >
        {toast && (
          <div
            className={
              toast.error
                ? "flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
                : "flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            }
          >
            <p className="flex-1 break-keep leading-relaxed">
              {toast.message}
              {toast.failure && (
                <>
                  {" "}
                  <span className="text-red-600 dark:text-red-400">
                    {toast.failure}
                  </span>
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="알림 닫기"
              className="-mr-1 rounded p-0.5 opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span aria-hidden>✕</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
