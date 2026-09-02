import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Clock
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { Container } from './Container';
import { MYMENSINGH_AREAS } from '../../data/mymensingh-locations';

interface FooterProps {
  onNavigate?: (view: string, params?: Record<string, unknown>) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-24 md:pb-12 border-t border-stone-800">
      <Container>
        {/* Top Trust Pillars Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-stone-800">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === 'bn' ? 'যাচাইকৃত লিস্টিং' : 'Verified Listings'}
              </h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                {language === 'bn' ? 'ভুয়া বিজ্ঞাপন ও দালালমুক্ত নিরাপদ প্ল্যাটফর্ম।' : 'Real landlords, strictly spam-free and direct.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/40 flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === 'bn' ? 'সরাসরি মালিকের সাথে কথা' : 'Direct Owner Contact'}
              </h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                {language === 'bn' ? 'কোনো প্রকার মিডিয়া ফি বা অতিরিক্ত চার্জ নেই।' : 'Call or WhatsApp owners directly without brokers.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/40 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === 'bn' ? 'ময়মনসিংহের সকল এলাকা' : 'All Mymensingh Areas'}
              </h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                {language === 'bn' ? 'মাসকান্দা, চরপাড়া থেকে শুরু করে বাকৃবি পর্যন্ত।' : 'Maskanda, Charpara, BAU, Ganginarpar and more.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/40 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === 'bn' ? 'দ্রুত সমাধান' : 'Fast Rental Matching'}
              </h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                {language === 'bn' ? 'শিক্ষার্থী ও পরিবারের জন্য সবচেয়ে দ্রুত টু-লেট।' : 'Find student messes and family homes in minutes.'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-10">
          
          {/* Col 1 & 2: Brand and Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                {language === 'bn' ? 'টু-লেট ময়মনসিংহ' : 'ToLet Mymensingh'}
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-md">
              {language === 'bn' 
                ? 'ময়মনসিংহ শহরের প্রথম ও সবচেয়ে নির্ভরযোগ্য ডিজিটাল রেন্টাল প্ল্যাটফর্ম। পরিবার, ব্যাচেলর চাকরিজীবী এবং শিক্ষার্থীদের জন্য সহজে বিশ্বস্ত বাসা ও মেস খোঁজার মাধ্যম।'
                : 'Mymensingh city\'s premier dedicated digital rental marketplace connecting genuine landlords and tenants seamlessly.'}
            </p>
            
            <div className="pt-2 text-xs text-stone-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
                <span>support@toletmymensingh.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                <span>{language === 'bn' ? 'টাউন হল মোড়, ময়মনসিংহ সদর, বাংলাদেশ' : 'Town Hall Mor, Mymensingh Sadar, Bangladesh'}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Popular Localities */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3.5 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>{language === 'bn' ? 'জনপ্রিয় এলাকা' : 'Popular Areas'}</span>
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              {MYMENSINGH_AREAS.slice(0, 6).map((area) => (
                <li key={area.id}>
                  <button
                    onClick={() => onNavigate?.('tolet', { areaSlug: area.slug })}
                    className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    {language === 'bn' ? area.name_bn : area.name_en}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Property Types */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3.5">
              {language === 'bn' ? 'ভাড়ার ধরন' : 'Rental Types'}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate?.('tolet')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {language === 'bn' ? 'পারিবারিক ফ্ল্যাট / বাসা' : 'Family Apartments'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('mess')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {language === 'bn' ? 'ব্যাচেলর মেস ও সিট' : 'Bachelor Mess & Seats'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('hostel')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {language === 'bn' ? 'ছাত্রী ও মহিলা হোস্টেল' : 'Female / Student Hostels'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('sublet')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {language === 'bn' ? 'রুম সাবলেট' : 'Single Room Sublet'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('post-property')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {language === 'bn' ? 'ফ্রি বিজ্ঞাপন প্রকাশ করুন' : 'Post Free Listing'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Security & Platform */}
          <div>
            <h4 className="font-bold text-white text-sm mb-3.5">
              {language === 'bn' ? 'সহায়তা ও সুরক্ষা' : 'Safety & Support'}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate?.('faq')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {language === 'bn' ? 'সাধারণ প্রশ্নাবলী (FAQ)' : 'Frequently Asked Questions'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('safety')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {language === 'bn' ? 'ভাড়াটিয়ার নিরাপত্তা নির্দেশিকা' : 'Tenant Safety Guidelines'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('terms')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  {language === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms & Privacy'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('admin')} className="hover:text-emerald-400 transition-colors text-stone-500 hover:text-stone-300 cursor-pointer">
                  {language === 'bn' ? 'অ্যাডমিন প্রবেশদ্বার' : 'Admin Portal'}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{t.copyright}</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>toletmymensingh.com</span>
            <span>•</span>
            <span>Made for Mymensingh, BD</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
