import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { UserButton } from "@clerk/nextjs";
import { asc, count, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { NewsCard, NewsCardSkeleton } from "@/components/news-card";
import {
  CategoryBar,
  CategoryBarSkeleton,
  type CategoryFilter,
} from "@/components/category-bar";
import { FetchNewsButton } from "@/components/fetch-news-button";
import { Pagination } from "@/components/pagination";
import { AppFooter } from "@/components/app-footer";

export const metadata: Metadata = {
  title: "대시보드 | AI 뉴스 수집기",
};

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3";
const PAGE_SIZE = 6;

export default function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
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

      {/* 기사가 적어도 푸터가 화면 아래에 붙도록 main이 남는 높이를 채운다 */}
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6">
        {/* searchParams는 요청 시점 값이라 Suspense 안에서 읽는다 (정적 셸 유지) */}
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent searchParams={searchParams} />
        </Suspense>
      </main>

      <AppFooter />
    </div>
  );
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilter(value: string | string[] | undefined): CategoryFilter {
  const v = firstValue(value);
  if (v === "uncategorized") return "uncategorized";
  if (v && /^\d+$/.test(v)) return Number(v);
  return "all";
}

function parsePage(value: string | string[] | undefined) {
  const n = Number(firstValue(value));
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  // 요청 시점마다 최신 데이터를 읽는다 (캐시하지 않음)
  await connection();
  const query = await searchParams;

  const [categoryRows, [totals]] = await Promise.all([
    // 카테고리별 기사 수 (생성순)
    db
      .select({
        id: categories.id,
        name: categories.name,
        count: count(articles.id),
      })
      .from(categories)
      .leftJoin(articles, eq(articles.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(asc(categories.createdAt), asc(categories.id)),
    db
      .select({
        total: count(),
        uncategorized:
          sql<number>`count(*) filter (where ${articles.categoryId} is null)`.mapWith(
            Number,
          ),
      })
      .from(articles),
  ]);

  let selected = parseFilter(query.category);
  // 없는 카테고리 id(삭제됨 등)나 미분류 기사가 없을 때는 '전체'로 본다
  const selectedCategory =
    typeof selected === "number"
      ? categoryRows.find((c) => c.id === selected)
      : undefined;
  if (typeof selected === "number" && !selectedCategory) selected = "all";
  if (selected === "uncategorized" && totals.uncategorized === 0) {
    selected = "all";
  }

  // 페이지 수는 선택한 카테고리의 기사 수 기준
  const filteredTotal =
    selected === "all"
      ? totals.total
      : selected === "uncategorized"
        ? totals.uncategorized
        : (selectedCategory?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  // 범위를 벗어난 페이지 번호는 마지막 페이지로 맞춘다
  const page = Math.min(parsePage(query.page), totalPages);

  const where =
    selected === "all"
      ? undefined
      : selected === "uncategorized"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, selected);

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
    .where(where)
    // 최신순: 발행일 기준, 발행일이 없으면 수집 시각으로 대체
    .orderBy(
      desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`),
      desc(articles.id),
    )
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const now = new Date();

  return (
    <>
      <CategoryBar
        categories={categoryRows}
        totalCount={totals.total}
        uncategorizedCount={totals.uncategorized}
        selected={selected}
      />

      {totals.total === 0 ? (
        <EmptyState
          title="아직 수집한 뉴스가 없습니다"
          description="상단의 ‘뉴스 가져오기’ 버튼을 눌러 최신 AI 뉴스를 받아 보세요."
        />
      ) : rows.length === 0 ? (
        <EmptyState title="이 카테고리에 해당하는 뉴스가 없습니다." />
      ) : (
        <>
          <div className={GRID}>
            {rows.map((article) => (
              <NewsCard key={article.id} article={article} now={now} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            category={selected === "all" ? undefined : String(selected)}
          />
        </>
      )}
    </>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
        {title}
      </p>
      {description && (
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="뉴스 불러오는 중">
      <CategoryBarSkeleton />
      <div className={GRID}>
        {Array.from({ length: PAGE_SIZE }, (_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
