import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      {/* SignIn은 usePathname()을 쓰므로 cacheComponents 환경에서 Suspense로 감싼다 */}
      <Suspense>
        <SignIn />
      </Suspense>
    </main>
  );
}
