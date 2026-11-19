import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Category, NewArticle } from "@/db/schema";
import type { FeedItem } from "./fetch-feeds";

const MODEL = "claude-haiku-5-5";
// 한 번에 Claude로 보내는 요청 수. 너무 많으면 rate limit에 걸린다
const CONCURRENCY = 5;
const UNCATEGORIZED = "미분류";

// ANTHROPIC_API_KEY는 서버 환경 변수에서 읽는다
const client = new Anthropic();

function buildSystemPrompt(categories: Category[]) {
  const categoryList = categories.length
    ? categories.map((c) => `- ${c.name}: ${c.description}`).join("\n")
    : "(등록된 카테고리 없음)";

  return `당신은 해외 AI 뉴스를 한국 독자에게 전달하는 편집자입니다.
영어 기사의 제목과 본문 발췌를 받아 다음을 작성합니다.

1. title_ko: 자연스러운 한국어 기사 제목. 직역보다 뜻이 잘 전달되게 쓰고, 회사·제품·모델 이름은 원문 표기를 유지합니다.
2. summary_ko: 한국어 요약 3~4문장. 무엇이 일어났고 왜 중요한지 담고, 원문에 없는 내용은 추측하지 않습니다. "~했다", "~이다" 체로 씁니다.
3. category: 아래 카테고리 중 기사 내용에 가장 잘 맞는 하나. 설명이 분류 기준입니다. 어느 것에도 맞지 않으면 "${UNCATEGORIZED}"를 고릅니다.

카테고리:
${categoryList}`;
}

function buildSchema(categories: Category[]) {
  const names = [UNCATEGORIZED, ...categories.map((c) => c.name)] as [
    string,
    ...string[],
  ];
  return z.object({
    title_ko: z.string(),
    summary_ko: z.string(),
    // 등록된 이름만 고를 수 있게 해서 없는 카테고리를 만들어내지 못하게 한다
    category: z.enum(names),
  });
}

async function processArticle(
  item: FeedItem,
  categories: Category[],
  system: string,
  schema: ReturnType<typeof buildSchema>,
): Promise<NewArticle> {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 1024,
    // 번역·요약은 깊은 추론이 필요 없으므로 비용을 낮춘다
    output_config: { effort: "low", format: zodOutputFormat(schema) },
    system,
    messages: [
      {
        role: "user",
        content: `제목: ${item.originalTitle}\n\n본문 발췌:\n${item.originalContent ?? "(없음)"}`,
      },
    ],
  });

  if (response.stop_reason !== "end_turn" || !response.parsed_output) {
    throw new Error(`Claude 응답을 사용할 수 없습니다 (stop_reason: ${response.stop_reason})`);
  }

  const { title_ko, summary_ko, category } = response.parsed_output;
  const categoryId = categories.find((c) => c.name === category)?.id ?? null;

  return {
    ...item,
    titleKo: title_ko.trim(),
    summaryKo: summary_ko.trim(),
    categoryId,
  };
}

// 기사마다 Claude를 한 번씩 호출한다. 한 기사가 실패해도 나머지는 계속 처리하며,
// 실패한 기사는 저장하지 않으므로 다음 '뉴스 가져오기' 때 다시 시도된다
export async function processArticles(items: FeedItem[], categories: Category[]) {
  const system = buildSystemPrompt(categories);
  const schema = buildSchema(categories);

  const processed: NewArticle[] = [];
  let failed = 0;
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const item = items[next++];
      try {
        processed.push(await processArticle(item, categories, system, schema));
      } catch (error) {
        failed++;
        console.error(`[claude] 기사 처리 실패: ${item.originalUrl}`, error);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker),
  );

  return { processed, failed };
}
