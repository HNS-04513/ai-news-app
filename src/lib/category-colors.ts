// ui.md 2.1 카테고리 배지 색상: category.id % 6 순환, 미분류는 회색
export const CATEGORY_COLORS = [
  "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
] as const;

export const UNCATEGORIZED_COLOR =
  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

export function categoryColor(id: number | null) {
  return id === null
    ? UNCATEGORIZED_COLOR
    : CATEGORY_COLORS[id % CATEGORY_COLORS.length];
}
