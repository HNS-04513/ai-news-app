import "server-only";
import { Client } from "@notionhq/client";

// Notion DB "AI 뉴스 북마크"의 속성 이름 (Notion에서 이름을 바꾸면 여기도 맞춰야 한다)
export const NOTION_PROPS = {
  title: "제목", // title
  summary: "요약", // rich_text
  category: "카테고리", // multi_select
  source: "출처", // url (원문 링크)
  date: "날짜", // date (발행일)
} as const;

let client: Client | null = null;
let dataSourceId: string | null = null;

export function getNotionClient() {
  if (!process.env.NOTION_TOKEN) {
    throw new Error("NOTION_TOKEN 환경 변수가 설정되지 않았습니다.");
  }
  client ??= new Client({ auth: process.env.NOTION_TOKEN });
  return client;
}

// NOTION_DATABASE_ID에는 ID 또는 Notion 데이터베이스 URL을 넣을 수 있다.
function parseDatabaseId(raw: string) {
  const match = raw.replace(/-/g, "").match(/[0-9a-f]{32}/i);
  if (!match) {
    throw new Error("NOTION_DATABASE_ID에서 데이터베이스 ID를 찾을 수 없습니다.");
  }
  return match[0];
}

// Notion API 2025-09-03부터 페이지는 데이터베이스가 아니라 data source에 만든다.
export async function getNotionDataSourceId() {
  if (dataSourceId) return dataSourceId;
  const raw = process.env.NOTION_DATABASE_ID;
  if (!raw) {
    throw new Error("NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다.");
  }
  const database = await getNotionClient().databases.retrieve({
    database_id: parseDatabaseId(raw),
  });
  const first = "data_sources" in database ? database.data_sources[0] : undefined;
  if (!first) {
    throw new Error("Notion 데이터베이스에서 data source를 찾을 수 없습니다.");
  }
  dataSourceId = first.id;
  return dataSourceId;
}
