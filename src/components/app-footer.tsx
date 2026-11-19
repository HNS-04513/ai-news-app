// ui.md 4.9 푸터
// 연도는 고정값으로 둔다. new Date()를 쓰면 정적 셸에 넣을 수 없다(cacheComponents)
export function AppFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:justify-between sm:px-6 dark:text-zinc-400">
        <p>Copyright © 2026 AI 뉴스 수집기</p>
        <p>
          Powered by{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Claude
          </span>
        </p>
      </div>
    </footer>
  );
}
