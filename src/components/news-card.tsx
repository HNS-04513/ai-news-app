import type { Article } from "@/db/schema";
import { categoryColor } from "@/lib/category-colors";
import { formatArticleDate, sourceLabel } from "@/lib/format";
import { NotionSaveButton } from "@/components/notion-save-button";
import { DeleteArticleButton } from "@/components/delete-article-button";

export type NewsCardArticle = Pick<
  Article,
  | "id"
  | "source"
  | "originalTitle"
  | "originalUrl"
  | "titleKo"
  | "summaryKo"
  | "categoryId"
  | "publishedAt"
  | "notionPageId"
> & { categoryName: string | null };

// ui.md 4.5 뉴스 카드
// 계층: 카테고리(분류) → 제목(가장 강하게) → 요약 → 출처·날짜와 액션(가장 약하게)
// 카드 전체가 원문 링크다. 제목 링크의 ::after가 카드를 덮고, 버튼은 z-10으로 그 위에 둔다.
export function NewsCard({
  article,
  now,
}: {
  article: NewsCardArticle;
  now: Date;
}) {
  return (
    <article className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-blue-500 has-[a:focus-visible]:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:has-[a:focus-visible]:ring-offset-zinc-950">
      <div className="flex min-h-6 items-center justify-between gap-3">
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${categoryColor(article.categoryId)}`}
        >
          {article.categoryName ?? "미분류"}
        </span>
        <div className="relative z-10">
          <DeleteArticleButton articleId={article.id} title={article.titleKo} />
        </div>
      </div>

      <h2 className="mt-3 line-clamp-2 break-keep text-base font-semibold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-blue-700 sm:text-lg dark:text-zinc-100 dark:group-hover:text-blue-400">
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={article.originalTitle}
          className="focus-visible:outline-none after:absolute after:inset-0 after:rounded-xl"
        >
          {article.titleKo}
          <span className="sr-only"> (원문을 새 탭에서 열기)</span>
        </a>
      </h2>

      <p className="mb-5 mt-2.5 line-clamp-4 break-keep text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {article.summaryKo}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
            {sourceLabel(article.source)}
          </span>
          {article.publishedAt && (
            <>
              <span aria-hidden>·</span>
              <time
                dateTime={article.publishedAt.toISOString()}
                className="shrink-0 tabular-nums"
              >
                {formatArticleDate(article.publishedAt, now)}
              </time>
            </>
          )}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5 shrink-0 opacity-0 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 motion-reduce:transition-none"
            aria-hidden
          >
            <path d="M5.5 10.5l5-5M6.5 5.5h4v4" />
          </svg>
        </p>
        <div className="relative z-10 shrink-0">
          <NotionSaveButton
            articleId={article.id}
            initialSaved={article.notionPageId !== null}
          />
        </div>
      </div>
    </article>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-5 w-16 rounded-md bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 h-5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 space-y-2.5">
        <div className="h-3.5 w-full rounded bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="h-3.5 w-full rounded bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="h-3.5 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800/60" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div className="h-3.5 w-28 rounded bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="h-8 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
      </div>
    </div>
  );
}
