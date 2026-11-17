import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 로그인 페이지를 제외한 모든 페이지·API는 로그인한 사용자만 접근할 수 있다.
const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
}, { signInUrl: "/sign-in" });

export const config = {
  matcher: [
    // Next.js 내부 경로와 정적 파일은 제외
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API 라우트는 항상 실행
    "/(api|trpc)(.*)",
  ],
};
