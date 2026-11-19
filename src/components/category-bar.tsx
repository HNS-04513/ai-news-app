import Link from "next/link";
import { AddCategoryButton } from "@/components/add-category-button";

// URL 쿼리 값: 없음 = 전체, 숫자 = 카테고리 id, "uncategorized" = 미분류
export type CategoryFilter = "all" | "uncategorized" | number;

export type CategoryChip = { id: number; name: string; count: number };

const chipBase =
  "inline-block rounded-full px-3.5 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950";
const chipSelected = "bg-blue-600 text-white dark:bg-blue-500";
const chipIdle =
  "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

export function CategoryBar({
  categories,
  totalCount,
  uncategorizedCount,
  selected,
}: {
  categories: CategoryChip[];
  totalCount: number;
  uncategorizedCount: number;
  selected: CategoryFilter;
}) {
  return (
    <nav
      aria-label="카테고리"
      className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      <ul className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap">
        <Chip
          href="/dashboard"
          name="전체"
          count={totalCount}
          selected={selected === "all"}
        />
        {categories.map((c) => (
          <Chip
            key={c.id}
            href={`/dashboard?category=${c.id}`}
            name={c.name}
            count={c.count}
            selected={selected === c.id}
          />
        ))}
        {uncategorizedCount > 0 && (
          <Chip
            href="/dashboard?category=uncategorized"
            name="미분류"
            count={uncategorizedCount}
            selected={selected === "uncategorized"}
          />
        )}
        <li>
          <AddCategoryButton />
        </li>
      </ul>
    </nav>
  );
}

function Chip({
  href,
  name,
  count,
  selected,
}: {
  href: string;
  name: string;
  count: number;
  selected: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        aria-current={selected ? "page" : undefined}
        className={`${chipBase} ${selected ? chipSelected : chipIdle}`}
      >
        {name}
        <span className="ml-1.5 text-xs opacity-70">{count}</span>
      </Link>
    </li>
  );
}

export function CategoryBarSkeleton() {
  return (
    <div className="flex animate-pulse gap-2" aria-hidden>
      {[14, 20, 20, 24, 16].map((w, i) => (
        <div
          key={i}
          className="h-8 rounded-full bg-zinc-200 dark:bg-zinc-800"
          style={{ width: `${w * 4}px` }}
        />
      ))}
    </div>
  );
}
