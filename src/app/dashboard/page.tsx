import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { UserButton } from "@clerk/nextjs";
import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { NewsCard, NewsCardSkeleton } from "@/components/news-card";
import { FetchNewsButton } from "@/components/fetch-news-button";
import { Pagination } from "@/components/pagination";

export const metadata: Metadata = {
  title: "대시보드 | AI 뉴스 수집기",
};

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3";
const PAGE_SIZE = 6;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="min-h-full flex-1 bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            AI 뉴스 수집기
          </h1>
          <div className="flex items-center gap-3">
            <FetchNewsButton />
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <Suspense fallback={<NewsGridSkeleton />}>
          <NewsGrid searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

function parsePage(value: string | string[] | undefined) {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

async function NewsGrid({ searchParams }: { searchParams: SearchParams }) {
  // 요청 시점마다 최신 데이터를 읽는다 (캐시하지 않음)
  await connection();

  const [{ total }] = await db.select({ total: count() }).from(articles);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // 범위를 벗어난 페이지 번호는 마지막 페이지로 맞춘다
  const page = Math.min(parsePage((await searchParams).page), totalPages);

  const rows = await db
    .select({
      id: articles.id,
      source: articles.source,
      originalTitle: articles.originalTitle,
      originalUrl: articles.originalUrl,
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      categoryId: articles.categoryId,
      publishedAt: articles.publishedAt,
      notionPageId: articles.notionPageId,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    // 최신순: 발행일 기준, 발행일이 없으면 수집 시각으로 대체
    .orderBy(
      desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`),
      desc(articles.id),
    )
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
          아직 수집한 뉴스가 없습니다
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          상단의 ‘뉴스 가져오기’ 버튼을 눌러 최신 AI 뉴스를 받아 보세요.
        </p>
      </div>
    );
  }

  const now = new Date();

  return (
    <>
      <div className={GRID}>
        {rows.map((article) => (
          <NewsCard key={article.id} article={article} now={now} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} />
    </>
  );
}

function NewsGridSkeleton() {
  return (
    <div className={GRID} aria-busy="true" aria-label="뉴스 불러오는 중">
      {Array.from({ length: PAGE_SIZE }, (_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}
