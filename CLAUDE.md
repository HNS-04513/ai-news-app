# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 프로젝트 개요

해외 AI 뉴스(TechCrunch AI, The Verge AI RSS)를 수집해 Claude API로 한국어 제목·요약·카테고리를 생성하고 카드로 보여주는 웹 앱. 원하는 기사는 Notion DB에 저장한다. **요구사항의 기준 문서는 `PRD.md`** — 기능(F1~F6), 데이터 모델, 화면 구성, 미결정 사항은 그 문서를 따른다. **UI를 만들거나 고칠 때는 `ui.md`(디자인 토큰, 레이아웃, 컴포넌트별 Tailwind 클래스, 상태 표시 규칙)를 먼저 확인하고 따른다.**

현재 상태: 스캐폴드, Clerk 설정, DB 스키마(`src/db/schema.ts`)와 마이그레이션(`drizzle/`, 초기 카테고리 시드 포함)까지 완료. API 라우트와 UI는 아직 없다. 앱 코드에서는 `import { db } from "@/db"`로 DB에 접근한다. 스키마를 바꾸면 `npx drizzle-kit generate` → `npx drizzle-kit migrate` 순서로 반영한다.

## 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드 (타입 체크 포함)
npm run lint     # ESLint (flat config, eslint-config-next)
npx drizzle-kit <generate|migrate|push|studio>   # DB 마이그레이션 (drizzle.config.ts 작성 후)
```

테스트 프레임워크는 아직 설정되어 있지 않다.

## 스택과 설정상 주의점

- **Next.js 16 (App Router, `src/app/`)** — 학습 데이터와 API가 다를 수 있으므로 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 가이드를 확인한다 (AGENTS.md 참고).
- `next.config.ts`에서 **`cacheComponents: true`**, `partialPrefetching: true`가 켜져 있다. 데이터 페칭·동적 API(`cookies()`, `headers()`, Clerk `auth()` 등) 사용 시 캐싱/Suspense 규칙이 이전 버전과 다르니 docs를 확인할 것.
- Tailwind CSS v4는 PostCSS가 아니라 Turbopack 로더(`@tailwindcss/turbopack`)로 처리된다.
- 경로 별칭: `@/*` → `src/*`.

## 계획된 아키텍처 (PRD 기준)

- **인증 (Clerk, `@clerk/nextjs`)**: 로그인하지 않은 사용자는 모든 페이지·API 접근 불가. 미들웨어로 전역 보호하고, API 라우트에서도 로그인 여부를 확인한다.
- **DB (Neon + Drizzle)**: `categories`, `articles` 두 테이블. `articles.original_url`이 unique이며 중복 판별 기준. `category_id`가 null이면 '미분류'. 카테고리 삭제 시 해당 기사는 null로 이동.
- **뉴스 가져오기 흐름**: 버튼 클릭 시에만 실행(자동 주기 수집 없음) → `rss-parser`로 피드당 최근 15개 → DB에 있는 URL은 건너뜀 → 새 기사만 Claude API(`@anthropic-ai/sdk`)로 번역·요약·분류 → 저장. **이미 처리한 기사는 Claude를 다시 호출하지 않는다**(비용). 한 피드가 실패해도 나머지는 계속 처리하고 실패 출처를 알린다.
- **분류 기준**: 카테고리의 `description`을 Claude 프롬프트에 분류 기준으로 넣는다. 카테고리 변경은 이후 수집분부터 적용(선택 기능: 수동 '전체 재분류').
- **Notion 저장**: 연동 방식은 PRD 7장에서 미결정. 현재는 권장안인 Notion API 직접 호출(`@notionhq/client`)을 전제로 설치됨. 저장 성공 시 `articles.notion_page_id`를 기록해 중복 저장을 막는다.
- API 키는 서버에서만 사용한다.

## 환경 변수 (`.env.local`)

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NOTION_TOKEN`, `NOTION_DATABASE_ID`

## 환경

Windows + OneDrive 동기화 폴더(경로에 한글 포함). npm이 일부 패키지의 install script를 승인 대기로 막을 수 있다 (예: esbuild → `npm install-scripts approve esbuild`).
