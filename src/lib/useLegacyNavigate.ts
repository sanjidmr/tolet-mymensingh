"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { viewToPathname } from "./navigation";

/**
 * Provides a navigation function with the legacy `(view, params)` signature
 * backed by Next.js App Router routing. Components that previously received
 * `onNavigate` as a prop can call `navigate('tolet/detail', { slug })` and it
 * will perform a real client-side route transition.
 *
 * If `replace` is true, uses router.replace instead of router.push.
 */
export function useLegacyNavigate(replace = false) {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (view: string, params?: any) => {
      const target = viewToPathname(view, params);

      if (target === pathname) {
        return;
      }

      if (replace) {
        router.replace(target);
      } else {
        router.push(target);
      }

      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [router, pathname, replace]
  );
}

export { usePathname };

export function useLegacyQuery() {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}
