"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Layout } from "@/src/components/layout/Layout";
import { LoginView } from "@/src/components/auth/LoginView";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";

function LoginContent() {
  const navigate = useLegacyNavigate();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || undefined;

  return (
    <Layout currentView="login" onNavigate={navigate}>
      <LoginView onNavigate={navigate} returnTo={returnTo} />
    </Layout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
