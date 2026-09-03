import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4 py-16">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-emerald-100 rotate-6" />
          <div className="absolute inset-0 rounded-3xl bg-stone-100 -rotate-3" />
          <div className="relative rounded-3xl bg-white border border-stone-200 shadow-sm flex items-center justify-center w-24 h-24">
            <span className="text-4xl font-extrabold tracking-tight text-emerald-600">404</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            পেজটি খুঁজে পাওয়া যায়নি
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            যে পেজটি আপনি খুঁজছেন তা নেই, সরিয়ে ফেলা হয়েছে, অথবা ঠিকানাটি
            ভুল লেখা হয়েছে।
          </p>
          <p className="text-xs text-stone-400">
            This page could not be found.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-5 shadow-sm transition-colors"
          >
            <Home className="h-4 w-4" />
            হোমপেজে ফিরে যান
          </Link>
          <Link
            href="/tolet"
            className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-sm font-semibold px-5 transition-colors"
          >
            <Search className="h-4 w-4" />
            বাসা খুঁজুন
          </Link>
        </div>
      </div>
    </div>
  );
}