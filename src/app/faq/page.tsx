"use client";

import { Layout } from "@/src/components/layout/Layout";
import { FAQView } from "@/src/components/pages/StaticPages";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";

export default function FaqPage() {
  const navigate = useLegacyNavigate();

  return (
    <Layout currentView="faq" onNavigate={navigate}>
      <FAQView onNavigate={navigate} />
    </Layout>
  );
}
