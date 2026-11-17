import type { Article } from "@/db/schema";

const SOURCE_LABELS: Record<Article["source"], string> = {
  techcrunch: "TechCrunch",
  theverge: "The Verge",
};

export function sourceLabel(source: Article["source"]) {
  return SOURCE_LABELS[source];
}

const TIME_ZONE = "Asia/Seoul";

const yearFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: TIME_ZONE,
  year: "numeric",
});
const shortFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: TIME_ZONE,
  month: "long",
  day: "numeric",
});
const longFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "long",
  day: "numeric",
});

// ui.md 4.5: 올해 기사는 "11월 18일", 이전 해는 "2025년 11월 18일" (한국 시간 기준)
export function formatArticleDate(date: Date, now: Date) {
  const sameYear = yearFormatter.format(date) === yearFormatter.format(now);
  return (sameYear ? shortFormatter : longFormatter).format(date);
}
