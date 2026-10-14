"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[46Hz Global Error]:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-4 antialiased">
        <div className="max-w-md w-full rounded-3xl border border-stone-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-5">
            <AlertCircle className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900">
            시스템 연결 오류가 발생했습니다
          </h1>
          <p className="mt-2 text-sm text-stone-600 leading-relaxed">
            서비스 초기화 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-teal-700 transition-all active:scale-98"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>다시 시도하기</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
