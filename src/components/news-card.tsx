import type { Article } from "@/db/schema";
import { categoryColor } from "@/lib/category-colors";
import { formatArticleDate, sourceLabel } from "@/lib/format";

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

const secondaryButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-offset-zinc-900";

export function NewsCard({
  article,
  now,
}: {
  article: NewsCardArticle;
  now: Date;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor(article.categoryId)}`}
        >
          {article.categoryName ?? "미분류"}
        </span>
        <p className="shrink-0 text-xs text-zinc-500">
          {sourceLabel(article.source)}
          {article.publishedAt && (
            <>
              {" · "}
              <time dateTime={article.publishedAt.toISOString()}>
                {formatArticleDate(article.publishedAt, now)}
              </time>
            </>
          )}
        </p>
      </div>

      <h2 className="mt-3 line-clamp-2 break-keep text-base font-semibold leading-snug text-zinc-900 sm:text-lg dark:text-zinc-100">
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={article.originalTitle}
          className="hover:underline"
        >
          {article.titleKo}
        </a>
      </h2>

      <p className="mb-4 mt-2 line-clamp-4 break-keep text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {article.summaryKo}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          원문 보기 ↗
        </a>
        {article.notionPageId ? (
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            ✓ 저장됨
          </span>
        ) : (
          // TODO: Notion 저장 API(F5)가 생기면 클라이언트 컴포넌트로 교체
          <button
            type="button"
            disabled
            title="Notion 저장 기능은 준비 중입니다"
            className={secondaryButton}
          >
            Notion 저장
          </button>
        )}
      </div>
    </article>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 h-5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-2 h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-full rounded bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="h-3.5 w-full rounded bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="h-3.5 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800/60" />
      </div>
    </div>
  );
}
