"use client";

import { Layout } from "@/src/components/layout/Layout";
import { TermsPrivacyView } from "@/src/components/pages/StaticPages";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";

export default function TermsPage() {
  const navigate = useLegacyNavigate();

  return (
    <Layout currentView="terms" onNavigate={navigate}>
      <TermsPrivacyView onNavigate={navigate} />
    </Layout>
  );
}
