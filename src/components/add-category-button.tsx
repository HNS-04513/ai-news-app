"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createCategory,
  type CreateCategoryState,
} from "@/app/dashboard/actions";

const primaryButton =
  "inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:ring-offset-zinc-900";

const secondaryButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-offset-zinc-900";

const fieldBase =
  "mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-950 dark:text-zinc-100";
const fieldOk =
  "border-zinc-300 focus:border-blue-500 focus:ring-blue-500/30 dark:border-zinc-700";
const fieldError = "border-red-500 focus:border-red-500 focus:ring-red-500/30";

const initialState: CreateCategoryState = { ok: false };

export function AddCategoryButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-zinc-300 px-3.5 py-1.5 text-sm font-medium text-zinc-500 hover:border-blue-400 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:focus-visible:ring-offset-zinc-950"
      >
        <PlusIcon />
        카테고리 추가
      </button>
      {/* 열 때마다 새로 마운트해서 이전 입력값과 오류를 지운다 */}
      {open && <AddCategoryModal onClose={() => setOpen(false)} />}
    </>
  );
}

function AddCategoryModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: CreateCategoryState, formData: FormData) => {
      const result = await createCategory(formData);
      if (result.ok) onClose();
      return result;
    },
    initialState,
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, pending]);

  const errors = state.errors ?? {};

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-zinc-950/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-category-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900"
      >
        <h2
          id="add-category-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          카테고리 추가
        </h2>
        <form action={formAction} className="mt-4 space-y-4" noValidate>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              이름
            </span>
            <input
              name="name"
              autoFocus
              maxLength={30}
              autoComplete="off"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "category-name-error" : undefined}
              className={`${fieldBase} ${errors.name ? fieldError : fieldOk}`}
            />
            {errors.name && (
              <span
                id="category-name-error"
                className="mt-1 block text-xs text-red-600 dark:text-red-400"
              >
                {errors.name}
              </span>
            )}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              설명
            </span>
            <textarea
              name="description"
              rows={3}
              maxLength={300}
              placeholder="예: 반도체, GPU, 데이터센터 등 AI 인프라 관련 뉴스"
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description
                  ? "category-description-error"
                  : "category-description-help"
              }
              className={`${fieldBase} ${errors.description ? fieldError : fieldOk}`}
            />
            {errors.description ? (
              <span
                id="category-description-error"
                className="mt-1 block text-xs text-red-600 dark:text-red-400"
              >
                {errors.description}
              </span>
            ) : (
              <span
                id="category-description-help"
                className="mt-1 block text-xs text-zinc-500"
              >
                Claude가 뉴스를 분류할 때 이 설명을 기준으로 씁니다. 이후
                가져오는 뉴스부터 적용됩니다.
              </span>
            )}
          </label>
          {errors.form && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400"
            >
              {errors.form}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className={secondaryButton}
            >
              취소
            </button>
            <button type="submit" disabled={pending} className={primaryButton}>
              {pending && (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {pending ? "추가하는 중…" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}
