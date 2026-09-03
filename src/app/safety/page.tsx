"use client";

import { Layout } from "@/src/components/layout/Layout";
import { SafetyGuidelinesView } from "@/src/components/pages/StaticPages";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";

export default function SafetyPage() {
  const navigate = useLegacyNavigate();

  return (
    <Layout currentView="safety" onNavigate={navigate}>
      <SafetyGuidelinesView onNavigate={navigate} />
    </Layout>
  );
}
