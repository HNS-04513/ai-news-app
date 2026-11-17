CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"original_title" text NOT NULL,
	"original_url" text NOT NULL,
	"original_content" text,
	"title_ko" text NOT NULL,
	"summary_ko" text NOT NULL,
	"category_id" integer,
	"published_at" timestamp with time zone,
	"notion_page_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_original_url_unique" UNIQUE("original_url")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_category_id_idx" ON "articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");