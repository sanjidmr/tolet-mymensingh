import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/src/lib/language-context";
import { AuthProvider } from "@/src/lib/supabase";
import { FavoritesProvider } from "@/src/lib/favorites-context";

export const metadata: Metadata = {
  title: {
    default: "ToLet Mymensingh | ময়মনসিংহের সেরা রেন্টাল মার্কেটপ্লেস",
    template: "%s | ToLet Mymensingh",
  },
  description:
    "ময়মনসিংহের বিশ্বস্ত ও আধুনিক রেন্টাল মার্কেটপ্লেস — বাসা, মেস, হোস্টেল ও সাবলেট খোঁজার সহজ প্ল্যাটফর্ম।",
  openGraph: {
    title: "ToLet Mymensingh | ময়মনসিংহের সেরা রেন্টাল মার্কেটপ্লেস",
    description:
      "ময়মনসিংহের বিশ্বস্ত ও আধুনিক রেন্টাল মার্কেটপ্লেস — বাসা, মেস, হোস্টেল ও সাবলেট খোঁজার সহজ প্ল্যাটফর্ম।",
    type: "website",
    locale: "bn_BD",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-neutral-50 text-neutral-900 antialiased font-sans selection:bg-emerald-500 selection:text-white">
        <LanguageProvider>
          <AuthProvider>
            <FavoritesProvider>{children}</FavoritesProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
