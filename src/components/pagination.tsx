import Link from "next/link";

const base =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900";
const idle =
  "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";
const current = "bg-indigo-600 text-white dark:bg-indigo-500";
const disabled =
  "border border-zinc-200 bg-white text-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600";

// 현재 페이지를 중심으로 최대 5개의 페이지 번호를 보여준다
function pageWindow(page: number, totalPages: number, size = 5) {
  const start = Math.max(1, Math.min(page - Math.floor(size / 2), totalPages - size + 1));
  const end = Math.min(totalPages, start + size - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function href(page: number) {
  return page === 1 ? "/dashboard" : `/dashboard?page=${page}`;
}

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="페이지" className="flex items-center justify-center gap-1.5">
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
