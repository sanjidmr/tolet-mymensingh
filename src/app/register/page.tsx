"use client";

import { Layout } from "@/src/components/layout/Layout";
import { RegisterView } from "@/src/components/auth/RegisterView";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";

export default function RegisterPage() {
  const navigate = useLegacyNavigate();

  return (
    <Layout currentView="register" onNavigate={navigate}>
      <RegisterView onNavigate={navigate} initialRole="tenant" />
    </Layout>
  );
}
