import type { Article } from "@/db/schema";

export type FeedSource = Article["source"];

export type Feed = {
  source: FeedSource;
  label: string;
  url: string;
};

// PRD.md 2장 뉴스 출처
export const FEEDS: Feed[] = [
  {
    source: "techcrunch",
    label: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    source: "theverge",
    label: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
];
