# UI 가이드: AI 뉴스 수집기

AI 뉴스 수집기 화면을 만들 때 따르는 UI 규칙이다. 기능 요구사항은 `PRD.md`를 기준으로 하고, 이 문서는 **어떻게 보이고 움직이는지**만 다룬다.
스타일은 모두 **Tailwind CSS v4** 유틸리티 클래스로 작성한다. 별도 CSS 파일이나 UI 라이브러리는 쓰지 않는다.

---

## 1. 디자인 원칙

1. **읽기가 먼저다** — 이 앱의 핵심은 한국어 제목과 요약을 빠르게 훑어보는 것이다. 장식보다 글자 크기, 줄 간격, 여백을 우선한다.
2. **색은 의미가 있을 때만 쓴다** — 화면은 무채색(zinc)을 기본으로 하고, 강조색(blue)은 주요 행동(뉴스 가져오기, 선택된 카테고리)에만 쓴다.
3. **일관성** — 같은 역할의 요소는 어디서나 같은 클래스를 쓴다. 아래 컴포넌트 규칙을 복사해서 쓰고, 새 변형이 필요하면 이 문서에 먼저 추가한다.
4. **상태를 항상 보여준다** — 로딩, 빈 목록, 실패, 저장 완료 상태를 모두 화면에 표시한다.

---

## 2. 디자인 토큰

### 2.1 색상

Tailwind 기본 팔레트만 쓴다. 다크 모드는 `dark:` 변형으로 지원한다(시스템 설정을 따름, `globals.css`의 `prefers-color-scheme`과 같은 방식).

| 역할 | 라이트 | 다크 | 사용처 |
|---|---|---|---|
| 페이지 배경 | `bg-zinc-50` | `dark:bg-zinc-950` | `<body>` / 메인 영역 |
| 표면(카드, 헤더) | `bg-white` | `dark:bg-zinc-900` | 카드, 헤더, 모달 |
| 테두리 | `border-zinc-200` | `dark:border-zinc-800` | 카드, 구분선, 입력창 |
| 본문 텍스트 | `text-zinc-900` | `dark:text-zinc-100` | 제목 |
| 보조 텍스트 | `text-zinc-600` | `dark:text-zinc-400` | 요약 |
| 흐린 텍스트 | `text-zinc-500` | `dark:text-zinc-400` | 날짜, 메타 정보 (다크에서 `zinc-500`은 `zinc-900` 위 대비가 약 3.9:1로 AA 미달) |
| 강조(primary) | `bg-blue-600` / `text-blue-600` | `dark:bg-blue-500` / `dark:text-blue-400` | 주요 버튼, 선택된 칩, 링크 |
| 성공 | `text-emerald-600` | `dark:text-emerald-400` | Notion 저장됨 |
| 오류 | `text-red-600`, `bg-red-50` | `dark:text-red-400`, `dark:bg-red-950/40` | 오류 메시지 |

**카테고리 배지 색상** — 카테고리는 사용자가 추가할 수 있으므로 이름별로 색을 고정하지 않는다. `category.id`를 아래 6색 순환 목록의 인덱스로 쓴다(`id % 6`). 미분류는 항상 회색이다.

```ts
// src/lib/category-colors.ts
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
  return id === null ? UNCATEGORIZED_COLOR : CATEGORY_COLORS[id % CATEGORY_COLORS.length];
}
```

> Tailwind는 소스에 그대로 적힌 클래스만 생성하므로, 클래스 문자열을 조합(`` `bg-${color}-50` ``)하지 말고 위처럼 전체 문자열로 적는다.

### 2.2 타이포그래피

한글이 주 콘텐츠다. Geist 폰트는 한글 글리프가 없어서 한글은 시스템 폰트로 대체된다. 전용 한글 폰트를 넣기 전까지 `font-sans`(Geist → 시스템 한글 폰트)를 그대로 쓴다.

> 참고: 현재 `globals.css`의 `body { font-family: Arial, ... }`가 `layout.tsx`의 Geist 설정을 덮어쓴다. UI 작업을 시작할 때 이 줄을 지우고 `<body>`에 `font-sans`를 적용한다.

| 용도 | 클래스 |
|---|---|
| 앱 이름(헤더) | `text-lg font-bold tracking-tight` |
| 페이지 제목 | `text-2xl font-bold tracking-tight` |
| 카드 제목 | `text-base font-semibold leading-snug tracking-tight` (`sm:text-lg`) |
| 카드 요약 | `text-sm leading-relaxed` |
| 메타 정보(출처·날짜) | `text-xs`, 출처는 `font-medium`으로 한 단계 진하게, 날짜는 `tabular-nums` |
| 버튼·칩 | `text-sm font-medium` |

- 한글 본문은 `leading-relaxed`(1.625) 이상을 쓴다. 줄 간격이 좁으면 한글은 금방 답답해 보인다.
- 한글 줄바꿈이 단어 중간에서 끊기지 않도록 카드 제목과 요약에 `break-keep`을 준다.
- 카드 요약은 `line-clamp-4`로 최대 4줄까지만 보여준다(PRD상 요약은 3~4문장).

### 2.3 간격·모서리·그림자

| 항목 | 값 |
|---|---|
| 콘텐츠 최대 폭 | `max-w-6xl mx-auto` |
| 페이지 좌우 여백 | `px-4 sm:px-6` |
| 섹션 간 간격 | `space-y-6` / `gap-6` |
| 카드 내부 여백 | `p-5 sm:p-6` |
| 카드 그리드 간격 | `gap-4 sm:gap-5` |
| 모서리 | 카드·모달 `rounded-xl`, 버튼·입력창 `rounded-lg`, 칩 `rounded-full`, 카드 안 카테고리 배지 `rounded-md` |
| 그림자 | 카드 `shadow-sm`, 호버 시 `hover:shadow-md`(테두리도 `hover:border-zinc-300` / `dark:hover:border-zinc-700`로 한 단계 진하게). 그 외에는 그림자를 쓰지 않는다 |

---

## 3. 레이아웃

### 3.1 메인 화면(대시보드, `/dashboard`) 구조

`/`로 접속하면 `/dashboard`로 이동한다.

```
┌──────────────────────────────────────────────────────────┐
│ AI 뉴스 수집기                  [⟳ 뉴스 가져오기]  (사용자) │  ← 헤더 (sticky)
├──────────────────────────────────────────────────────────┤
│ [전체] [모델/연구] [제품 출시] [투자/비즈니스] … [미분류] [+ 카테고리 추가] │  ← 카테고리 바
│                                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│ │ 뉴스 카드 │ │ 뉴스 카드 │ │ 뉴스 카드 │                   │  ← 카드 그리드
│ └──────────┘ └──────────┘ └──────────┘                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│ │   …      │ │   …      │ │   …      │                   │
├──────────────────────────────────────────────────────────┤
│ Copyright © 2026 AI 뉴스 수집기          Powered by Claude │  ← 푸터
└──────────────────────────────────────────────────────────┘
```

```tsx
<div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
  <AppHeader />
  {/* flex-1: 기사가 적어도 푸터가 화면 아래에 붙는다 */}
  <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6">
    <CategoryBar />
    <NewsGrid />
  </main>
  <AppFooter />
</div>
```

### 3.2 반응형

모바일 우선으로 작성하고 `sm`(640px), `lg`(1024px)에서 확장한다.

| 화면 | 카드 열 수 | 비고 |
|---|---|---|
| 모바일 (< 640px) | 1열 | 카테고리 바는 가로 스크롤 |
| 태블릿 (≥ 640px) | 2열 | |
| 데스크톱 (≥ 1024px) | 3열 | |

---

## 4. 컴포넌트

### 4.1 헤더

앱 이름, '뉴스 가져오기' 버튼, Clerk `<UserButton />`을 한 줄에 둔다. 스크롤해도 위에 고정한다.

```tsx
<header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
  <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
    <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
      AI 뉴스 수집기
    </h1>
    <div className="flex items-center gap-3">
      <FetchNewsButton />
      <UserButton />
    </div>
  </div>
</header>
```

### 4.2 버튼

| 종류 | 용도 | 클래스 |
|---|---|---|
| Primary | 뉴스 가져오기, 모달의 저장 | `inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400` |
| Secondary | Notion 저장, 취소 | `inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800` |
| Danger | 카테고리 삭제 | Secondary와 같되 `text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40` |

- 모든 버튼에 포커스 링을 준다: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900`
- 처리 중인 버튼은 `disabled`로 만들고, 아이콘을 스피너로 바꾸고, 문구를 진행형으로 바꾼다. 예: `뉴스 가져오기` → `가져오는 중…`
- 스피너: `<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />`

### 4.3 카테고리 바

뉴스 카드 목록 바로 위에 둔다. 순서는 **전체 → 등록된 카테고리(생성순) → 미분류 → `+ 카테고리 추가` 버튼**이다.

```tsx
<nav aria-label="카테고리" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
  <ul className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap">
    {/* 전체, 각 카테고리, 미분류 */}
    <li>
      <Link href={href} scroll={false}
        aria-current={selected ? "page" : undefined}
        className={
          selected
            ? "rounded-full bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white dark:bg-blue-500"
            : "rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }
      >
        {name}
        <span className="ml-1.5 text-xs opacity-70">{count}</span>
      </Link>
    </li>

    {/* 맨 끝: 카테고리 추가 */}
    <li>
      <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-3.5 py-1.5 text-sm font-medium text-zinc-500 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-400 dark:hover:text-blue-400">
        <PlusIcon className="size-4" aria-hidden />
        카테고리 추가
      </button>
    </li>
  </ul>
</nav>
```

규칙:
- **선택 상태**는 채워진 blue 칩으로 표시하고, 선택은 한 번에 하나만 된다. 기본 선택은 '전체'다.
- 칩 이름 옆에 기사 수를 작게 보여준다(선택 사항이지만 권장).
- **'미분류'** 칩은 미분류 기사가 1건 이상일 때만 보여준다.
- **추가 버튼**은 점선 테두리로 필터 칩과 구분한다. 필터가 아니라 행동이라는 뜻이다.
- 모바일에서는 줄바꿈 없이 가로 스크롤하고, `sm` 이상에서는 줄바꿈한다.
- 선택한 카테고리는 URL 쿼리에 반영해서 새로고침해도 유지되게 한다: 전체는 `/dashboard`, 카테고리는 `/dashboard?category=3`, 미분류는 `/dashboard?category=uncategorized`. 없는 카테고리 id는 전체로 본다.
- 칩은 URL을 바꾸는 이동이므로 `<button>`이 아니라 `next/link`의 `<Link>`로 만들고, 선택 상태는 `aria-current="page"`로 알린다.

### 4.4 카테고리 추가 모달

`+ 카테고리 추가`를 누르면 연다. 입력 항목은 이름과 설명이다(설명은 Claude가 분류 기준으로 쓴다).

```tsx
<div className="fixed inset-0 z-20 flex items-center justify-center bg-zinc-950/40 p-4">
  <div role="dialog" aria-modal="true" aria-labelledby="add-category-title"
       className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
    <h2 id="add-category-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
      카테고리 추가
    </h2>
    <form className="mt-4 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">이름</span>
        <input className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">설명</span>
        <textarea rows={3} placeholder="예: 반도체, GPU, 데이터센터 등 AI 인프라 관련 뉴스"
                  className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" />
        <span className="mt-1 block text-xs text-zinc-500">
          Claude가 뉴스를 분류할 때 이 설명을 기준으로 씁니다. 이후 가져오는 뉴스부터 적용됩니다.
        </span>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        {/* Secondary: 취소 / Primary: 추가 */}
      </div>
    </form>
  </div>
</div>
```

- 열리면 이름 입력창에 포커스를 주고, `Esc`나 배경 클릭으로 닫는다.
- 이름과 설명은 둘 다 필수다(이름 30자, 설명 300자 이하). `전체`, `미분류`는 이름으로 쓸 수 없다.
- 이름이 비었거나 이미 있는 이름이면 입력창 아래에 빨간 문구로 알린다(`text-xs text-red-600`), 입력창 테두리는 `border-red-500`.
- 추가에 성공하면 모달을 닫고, 새 칩이 카테고리 바의 추가 버튼 바로 앞에 나타난다.
- 수정·삭제는 카테고리 관리 화면(`/categories`)에서 한다. 이 화면의 입력 폼도 같은 스타일을 쓴다.

### 4.5 뉴스 카드

정보 계층은 **분류 → 제목 → 요약 → 출처·액션** 순서다. 제목이 가장 강하고, 출처·날짜는 하단으로 내려 읽기 흐름을 방해하지 않게 한다.

```
┌───────────────────────────────────┐
│ [모델/연구]                      ✕ │  ← 카테고리 배지 + 삭제(hover 시)
│                                   │
│ 한국어 제목이 최대 두 줄까지        │  ← 제목 (카드 전체가 원문 링크)
│ 표시됩니다                         │
│                                   │
│ 한국어 요약 3~4문장. 최대 4줄까지    │  ← 요약
│ 보여주고 나머지는 말줄임표로 …       │
│ ───────────────────────────────── │
│ TechCrunch · 11월 18일 ↗  [Notion 저장] │  ← 출처·날짜 + 액션
└───────────────────────────────────┘
```

```tsx
<article className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-blue-500 has-[a:focus-visible]:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:has-[a:focus-visible]:ring-offset-zinc-950">
  <div className="flex min-h-6 items-center justify-between gap-3">
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${categoryColor(article.categoryId)}`}>
      {categoryName ?? "미분류"}
    </span>
    <div className="relative z-10"><DeleteArticleButton /></div>
  </div>

  <h2 className="mt-3 line-clamp-2 break-keep text-base font-semibold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-blue-700 sm:text-lg dark:text-zinc-100 dark:group-hover:text-blue-400">
    <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" title={article.originalTitle}
       className="focus-visible:outline-none after:absolute after:inset-0 after:rounded-xl">
      {article.titleKo}
      <span className="sr-only"> (원문을 새 탭에서 열기)</span>
    </a>
  </h2>

  <p className="mb-5 mt-2.5 line-clamp-4 break-keep text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
    {article.summaryKo}
  </p>

  <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
    <p className="flex min-w-0 items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
      <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">{sourceLabel}</span>
      <span aria-hidden>·</span>
      <time dateTime={iso} className="shrink-0 tabular-nums">{formattedDate}</time>
      {/* ↗ 아이콘: 평소 opacity-0, 카드 hover 시 나타나며 오른쪽 위로 살짝 이동 */}
    </p>
    <div className="relative z-10 shrink-0"><NotionSaveButton /></div>
  </div>
</article>
```

- **카드 전체가 원문 링크**다. 제목 `<a>`의 `::after`가 카드 전체를 덮는다(stretched link). 카드 안의 버튼은 `relative z-10` 래퍼로 감싸 링크 위에 올린다. 링크가 하나뿐이라 스크린 리더와 키보드 탭 순서가 단순하다.
- 키보드로 제목 링크에 포커스하면 카드 전체에 포커스 링(`has-[a:focus-visible]:ring-2`)이 생긴다.
- **카드 높이**: 같은 줄의 카드 높이가 달라도 하단 영역이 바닥에 맞춰지도록 하단 영역에 `mt-auto`를 준다. 줄에서 가장 긴 카드도 요약이 구분선에 붙지 않도록 요약 `<p>`에 `mb-5`를 준다.
- **출처·날짜**: 출처 이름은 `font-medium text-zinc-700`으로 날짜보다 한 단계 진하게 한다. 날짜는 `tabular-nums`로 숫자 폭을 맞춘다.
- **출처 표기**: `techcrunch` → `TechCrunch`, `theverge` → `The Verge`.
- **날짜 표기**: 올해 기사는 `11월 18일`, 이전 해는 `2025년 11월 18일`. `Intl.DateTimeFormat("ko-KR", …)`을 쓰고 한국 시간대(`Asia/Seoul`)로 표시한다. `publishedAt`이 없으면 날짜를 생략한다.
- 원문 제목(`originalTitle`)은 제목 링크의 `title` 속성으로 넣어서 마우스를 올리면 보이게 한다.
- **hover 인터랙션** (모두 `duration-200 ease-out`):
  - 카드가 2px 떠오르고(`-translate-y-0.5`) 그림자가 `shadow-md`로 짙어지며 테두리가 한 단계 진해진다(`zinc-300` / 다크 `zinc-700`).
  - 제목이 파란색(`text-blue-700` / 다크 `text-blue-400`)으로 바뀐다.
  - 날짜 옆에 ↗ 아이콘이 나타나 "원문으로 이동"을 알린다.
  - `prefers-reduced-motion`이면 이동 애니메이션을 끈다(`motion-reduce:`).
- **삭제 버튼**: 카테고리 배지 오른쪽 끝에 단독 아이콘 버튼(✕, `size-5`, `aria-label="뉴스 삭제"`)을 둔다.
  - 마우스 환경(`pointer-fine:`)에서는 카드에 올리거나 카드 안에 포커스가 있을 때만 보인다. 터치 환경에서는 hover가 없으므로 항상 보인다. 삭제 중이거나 오류가 있으면 계속 보인다.
  - 아이콘 색은 `text-zinc-500` / 다크 `text-zinc-400`(아이콘 대비 3:1 이상), 마우스를 올리면 Danger 색(`hover:bg-red-50 hover:text-red-600`)으로 바뀐다.
  - 누르면 브라우저 확인창(`이 뉴스를 삭제할까요?` + 한국어 제목)을 띄우고, 확인하면 DB에서 삭제한 뒤 목록을 다시 그린다.
  - 삭제 중에는 `disabled` + 아이콘 자리에 스피너. 실패하면 버튼 아래에 오류 박스(토스트 오류 스타일)를 띄운다.

**카드 그리드**

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
  {articles.map((a) => <NewsCard key={a.id} article={a} />)}
</div>
```

### 4.6 Notion 저장 버튼 상태

| 상태 | 모양 | 동작 |
|---|---|---|
| 저장 전 | Secondary 버튼 `Notion 저장` | 클릭 가능 |
| 저장 중 | Secondary + `disabled` + 스피너, `저장 중…` | 클릭 불가 |
| 저장됨 (`notionPageId` 있음) | 버튼 대신 `text-sm font-medium text-emerald-600 dark:text-emerald-400`로 `✓ 저장됨` | 클릭 불가(중복 저장 방지) |
| 실패 | 저장 전 상태로 되돌리고 토스트로 오류 표시 | 다시 시도 가능 |

### 4.7 피드백: 토스트와 알림

'뉴스 가져오기' 결과와 Notion 저장 실패는 화면 오른쪽 아래(모바일은 아래 가운데) **토스트**로 알린다. 4초 뒤 자동으로 사라지고, 오류는 사용자가 닫을 때까지 남긴다.

```tsx
<div role="status" aria-live="polite"
     className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0">
  <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
    새 뉴스 12건을 추가했습니다.
  </div>
</div>
```

| 상황 | 문구 예시 | 스타일 |
|---|---|---|
| 새 기사 있음 | `새 뉴스 12건을 추가했습니다.` | 기본 |
| 새 기사 없음 | `새로운 뉴스가 없습니다.` | 기본 |
| 일부 피드 실패 | `새 뉴스 7건을 추가했습니다. The Verge에서 가져오지 못했습니다.` | 기본 + 실패 문장은 `text-red-600` |
| 전부 실패 | `뉴스를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.` | 오류(`border-red-200 bg-red-50 text-red-700`) |
| Notion 저장 실패 | `Notion에 저장하지 못했습니다: {사유}` | 오류 |

문구는 존댓말(`~습니다`, `~주세요`)로 통일한다.

### 4.8 빈 상태와 로딩

**빈 상태** — 기사가 하나도 없을 때(첫 실행)와 선택한 카테고리에 기사가 없을 때를 구분한다.

```tsx
<div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
  <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">아직 수집한 뉴스가 없습니다</p>
  <p className="mt-1 text-sm text-zinc-500">상단의 ‘뉴스 가져오기’ 버튼을 눌러 최신 AI 뉴스를 받아 보세요.</p>
</div>
```

카테고리에 기사가 없을 때: `이 카테고리에 해당하는 뉴스가 없습니다.`

**로딩(스켈레톤)** — 카드 목록을 불러오는 동안 카드 모양 스켈레톤 6개를 보여준다. Suspense `fallback`으로 쓴다.

```tsx
<div className="flex animate-pulse flex-col rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
  <div className="h-5 w-16 rounded-md bg-zinc-200 dark:bg-zinc-800" />
  <div className="mt-4 h-5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
  <div className="mt-2 h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
  <div className="mt-4 space-y-2.5">
    <div className="h-3.5 w-full rounded bg-zinc-100 dark:bg-zinc-800/60" />
    <div className="h-3.5 w-full rounded bg-zinc-100 dark:bg-zinc-800/60" />
    <div className="h-3.5 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800/60" />
  </div>
  {/* 하단: 출처·날짜 + 버튼 자리 */}
  <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
    <div className="h-3.5 w-28 rounded bg-zinc-100 dark:bg-zinc-800/60" />
    <div className="h-8 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
  </div>
</div>
```

뉴스를 가져오는 동안에는 기존 카드 목록을 그대로 두고, 버튼만 로딩 상태로 바꾼다(목록을 스켈레톤으로 바꾸지 않는다).

---

### 4.9 푸터

대시보드 맨 아래에 둔다. 헤더처럼 무채색이고, 콘텐츠와 같은 폭(`max-w-6xl`)에 맞춘다. 배경은 따로 칠하지 않고 위쪽 테두리로만 구분한다.

```tsx
<footer className="border-t border-zinc-200 dark:border-zinc-800">
  <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:justify-between sm:px-6 dark:text-zinc-400">
    <p>Copyright © 2026 AI 뉴스 수집기</p>
    <p>Powered by <span className="font-medium text-zinc-700 dark:text-zinc-300">Claude</span></p>
  </div>
</footer>
```

- 모바일은 두 줄 가운데 정렬, `sm` 이상은 한 줄 양 끝 정렬.
- 연도는 고정값으로 적는다. `new Date()`로 계산하면 정적 셸에 넣을 수 없다(`cacheComponents`).

## 5. 아이콘

- 아이콘은 인라인 SVG로 넣거나, 필요해지면 `lucide-react` 하나만 추가한다. 여러 아이콘 라이브러리를 섞지 않는다.
- 크기는 텍스트 옆에서 `size-4`, 단독 아이콘 버튼은 `size-5`.
- 장식용 아이콘에는 `aria-hidden`을, 텍스트 없는 아이콘 버튼에는 `aria-label`을 준다.

## 6. 접근성 체크리스트

- [ ] 모든 인터랙티브 요소에 키보드 포커스 링이 보인다(`focus-visible:ring-2`).
- [ ] 카테고리 칩은 `aria-current="page"`로 선택 상태를 알린다.
- [ ] 모달은 `role="dialog"`, `aria-modal`, 제목 연결(`aria-labelledby`), `Esc` 닫기를 지원한다.
- [ ] 토스트는 `aria-live="polite"`(오류는 `role="alert"`)로 스크린 리더에 전달된다.
- [ ] 외부 링크는 `target="_blank" rel="noopener noreferrer"`를 쓴다.
- [ ] 텍스트 대비는 라이트/다크 모두 WCAG AA(본문 4.5:1)를 만족한다. 위 색상 표를 벗어나면 대비를 확인한다.
- [ ] 페이지는 `lang="ko"`다(`layout.tsx`에 설정되어 있음).
