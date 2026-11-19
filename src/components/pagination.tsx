import Link from "next/link";

const base =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900";
const idle =
  "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";
const current = "bg-blue-600 text-white dark:bg-blue-500";
const disabled =
  "border border-zinc-200 bg-white text-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600";

// 현재 페이지를 중심으로 최대 5개의 페이지 번호를 보여준다
function pageWindow(page: number, totalPages: number, size = 5) {
  const start = Math.max(
    1,
    Math.min(page - Math.floor(size / 2), totalPages - size + 1),
  );
  const end = Math.min(totalPages, start + size - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// 선택한 카테고리(?category=)를 유지한 채 페이지만 바꾼다
function pageHref(page: number, category?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/dashboard?${qs}` : "/dashboard";
}

export function Pagination({
  page,
  totalPages,
  category,
}: {
  page: number;
  totalPages: number;
  category?: string;
}) {
  if (totalPages <= 1) return null;
  const href = (n: number) => pageHref(n, category);

  return (
    <nav
      aria-label="페이지"
      className="flex items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${base} ${idle}`}>
          이전
        </Link>
      ) : (
        <span className={`${base} ${disabled}`} aria-disabled="true">
          이전
        </span>
      )}

      {pageWindow(page, totalPages).map((n) =>
        n === page ? (
          <span key={n} aria-current="page" className={`${base} ${current}`}>
            {n}
          </span>
        ) : (
          <Link key={n} href={href(n)} className={`${base} ${idle}`}>
            {n}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} className={`${base} ${idle}`}>
          다음
        </Link>
      ) : (
        <span className={`${base} ${disabled}`} aria-disabled="true">
          다음
        </span>
      )}
    </nav>
  );
}
