import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// PRD.md 5장 데이터 모델 기준

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  // Claude 분류 프롬프트에 기준으로 들어가는 설명
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    source: text("source", { enum: ["techcrunch", "theverge"] }).notNull(),
    originalTitle: text("original_title").notNull(),
    // 중복 판별 기준
    originalUrl: text("original_url").notNull().unique(),
    originalContent: text("original_content"),
    titleKo: text("title_ko").notNull(),
    summaryKo: text("summary_ko").notNull(),
    // null이면 '미분류'. 카테고리 삭제 시 null로 이동
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    // Notion 저장 성공 시 기록 (중복 저장 방지)
    notionPageId: text("notion_page_id"),
    // 사용자가 삭제한 시각. 행은 남겨 두어 original_url 중복 판별에 계속 쓰이므로
    // 삭제한 기사가 다음 수집 때 다시 들어오지 않는다. 화면에서는 null인 행만 보여준다
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("articles_category_id_idx").on(t.categoryId),
    index("articles_published_at_idx").on(t.publishedAt),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
