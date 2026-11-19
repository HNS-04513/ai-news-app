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

export function NewsCard({
  article,
  now,
}: {
  article: NewsCardArticle;
  now: Date;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-900">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor(article.categoryId)}`}
        >
          {article.categoryName ?? "미분류"}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <p className="text-xs text-zinc-500">
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
          <DeleteArticleButton articleId={article.id} title={article.titleKo} />
        </div>
      </div>

      <h2 className="mt-3 line-clamp-2 break-keep text-base font-semibold leading-snug text-zinc-900 sm:text-lg dark:text-zinc-100">
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={article.originalTitle}
          className="transition-colors hover:text-blue-700 dark:hover:text-blue-400"
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
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          원문 보기 ↗
        </a>
        <NotionSaveButton
          articleId={article.id}
          initialSaved={article.notionPageId !== null}
        />
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
