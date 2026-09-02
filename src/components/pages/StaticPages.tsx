import React from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ShieldCheck, 
  Phone, 
  Home, 
  Users, 
  AlertTriangle, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { Container } from '../layout/Container';
import { Button } from '../ui/button';
import { useSEO } from '../../lib/useSEO';

interface StaticPagesProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
}

export const FAQView: React.FC<StaticPagesProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  useSEO({
    title: language === 'bn' ? 'সাধারণ প্রশ্ন ও উত্তর (FAQ)' : 'Frequently Asked Questions',
    description: language === 'bn'
      ? 'টু-লেট ময়মনসিংহ ব্যবহারের নিয়ম, বিজ্ঞাপন দেওয়ার পদ্ধতি, বাড়িওয়ালার সাথে যোগাযোগ ও ভেরিফিকেশন সংক্রান্ত প্রয়োজনীয় তথ্য।'
      : 'Frequently asked questions about finding apartments, mess seats, and posting rental listings in Mymensingh.',
    canonicalUrl: 'https://toletmymensingh.com/faq',
    keywords: ['ToLet Mymensingh FAQ', 'ময়মনসিংহ বাসা ভাড়া প্রশ্নাবলী', 'ময়মনসিংহ টু-লেট নিয়মাবলি'],
  });

  const faqs = [
    {
      q_bn: 'টু-লেট ময়মনসিংহে কি বিজ্ঞাপন দিতে কোনো টাকা লাগে?',
      q_en: 'Is posting a rental listing free on ToLet Mymensingh?',
      a_bn: 'না, টু-লেট ময়মনসিংহে বাসা, মেস, হোস্টেল বা সাবলেটের সাধারণ বিজ্ঞাপন দেওয়া সম্পূর্ণ ফ্রি ও বিনামূল্যে। কোনো গোপন চার্জ নেই।',
      a_en: 'No, posting standard listings for family apartments, messes, hostels, or sublets is 100% free with no hidden charges.',
    },
    {
      q_bn: 'আমি কি সরাসরি বাড়িওয়ালার সাথে কথা বলতে পারব?',
      q_en: 'Can I directly contact the property owner without brokers?',
      a_bn: 'হ্যাঁ, প্রতিটি বিজ্ঞাপনে বাড়িওয়ালার সরাসরি ফোন নম্বর ও হোয়াটসঅ্যাপ যোগাযোগের লিংক রয়েছে। কোনো মধ্যস্বত্বভোগী বা ব্রোকার কমিশন নেই।',
      a_en: 'Yes, every listing provides direct phone and WhatsApp contact details for the landlord. Zero intermediary fees.',
    },
    {
      q_bn: 'বিজ্ঞাপন প্রকাশ হতে কত সময় লাগে?',
      q_en: 'How long does it take for a listing to be approved?',
      a_bn: 'আমাদের টিম সাধারণত ৩০ মিনিট থেকে ২ ঘণ্টার মধ্যে তথ্য ও ফোন নম্বর যাচাই করে বিজ্ঞাপনটি লাইভ করে দেয়।',
      a_en: 'Our local verification team typically approves genuine listings within 30 minutes to 2 hours.',
    },
    {
      q_bn: 'বাকৃবি বা মেডিকেল কলেজের কাছে মেস কীভাবে খুঁজব?',
      q_en: 'How do I find messes near BAU or Mymensingh Medical College?',
      a_bn: 'হেডার থেকে "মেস ও সিট" বা "হোস্টেল" ক্যাটাগরিতে গিয়ে "BAU (বাকৃবি)" বা "Charpara (চরপাড়া / মেডিকেল)" ফিল্টার সিলেক্ট করলেই নিকটবর্তী সকল মেস পেয়ে যাবেন।',
      a_en: 'Navigate to "Mess" or "Hostels" from the menu and filter by "BAU" or "Charpara (Medical College)" to view nearby options.',
    },
    {
      q_bn: 'ভুল তথ্য বা ভুয়া বিজ্ঞাপন দেখলে কী করব?',
      q_en: 'What should I do if I find inaccurate or fake listings?',
      a_bn: 'লিস্টিংয়ের বিস্তারিত পেইজে গিয়ে "রিপোর্ট করুন (Report)" বাটনে ক্লিক করে কারণ জানান। আমাদের অ্যাডমিন টিম দ্রুত ব্যবস্থা নেবে।',
      a_en: 'Click the "Report Listing" button on the property details page. Our admin team will investigate and take immediate action.',
    },
  ];

  return (
    <div className="py-8 sm:py-12 bg-stone-50 min-h-screen">
      <Container className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('home')}
            className="h-9 px-3 rounded-xl border-stone-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>{language === 'bn' ? 'হোমে ফিরুন' : 'Home'}</span>
          </Button>
          <div className="h-4 w-px bg-stone-300" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            {language === 'bn' ? 'সাধারণ প্রশ্নাবলী' : 'Help & FAQ'}
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
                {language === 'bn' ? 'সাধারণ প্রশ্ন ও উত্তর (FAQ)' : 'Frequently Asked Questions'}
              </h1>
              <p className="text-xs text-stone-500">
                {language === 'bn' ? 'টু-লেট ময়মনসিংহ প্ল্যাটফর্ম ব্যবহারের সকল প্রয়োজনীয় তথ্য' : 'Everything you need to know about renting and listing in Mymensingh'}
              </p>
            </div>
          </div>

          <div className="divide-y divide-stone-100 mt-8">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-4">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group"
                  >
                    <span className="font-semibold text-stone-800 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                      {language === 'bn' ? faq.q_bn : faq.q_en}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-stone-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed pl-2 border-l-2 border-emerald-500">
                      {language === 'bn' ? faq.a_bn : faq.a_en}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
};

export const SafetyGuidelinesView: React.FC<StaticPagesProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  useSEO({
    title: language === 'bn' ? 'ভাড়াটিয়ার নিরাপত্তা নির্দেশিকা' : 'Tenant Safety Guidelines',
    description: language === 'bn'
      ? 'ময়মনসিংহে বাসা বা মেস খোঁজার সময় প্রতারণামুক্ত থাকতে জরুরি নিরাপত্তা নির্দেশাবলী এবং সতর্কতা।'
      : 'Important safety guidelines for tenants searching for apartments and rooms in Mymensingh.',
    canonicalUrl: 'https://toletmymensingh.com/safety',
    keywords: ['নিরাপদ বাসা খোঁজা', 'Tenant Safety Mymensingh', 'Rental tips Mymensingh'],
  });

  const rules = [
    {
      title_bn: 'কখনোই না দেখে অগ্রিম টাকা বা বুকিং মানি পাঠাবেন না',
      title_en: 'Never send advance money before visiting the property physically',
      desc_bn: 'বাসা, রুম বা মেসের সিট সশরীরে পরিদর্শন ও মালিকের সাথে সামনাসামনি কথা না বলে বিকাশ/নগদে কোনো অগ্রিম টাকা প্রদান করবেন না।',
      desc_en: 'Do not transfer advance rent or booking amounts via bKash/Nagad before visiting the place and verifying the landlord in person.',
      alert: true,
    },
    {
      title_bn: 'মালিকের পরিচয় নিশ্চিত করুন',
      title_en: 'Verify the landlord\'s true identity',
      desc_bn: 'বাসার মূল মালিক অথবা দায়িত্বপ্রাপ্ত কেয়ারটেকারের সাথে সরাসরি কথা বলুন এবং প্রয়োজনে জাতীয় পরিচয়পত্র দেখে নিশ্চিত হোন।',
      desc_en: 'Speak directly with the genuine homeowner or authorized caretaker, and confirm their national identity where appropriate.',
    },
    {
      title_bn: 'ইউটিলিটি বিল ও শর্তাবলী পরিষ্কার জেনে নিন',
      title_en: 'Clarify utility bills, gas, and hidden conditions upfront',
      desc_bn: 'বিদ্যুৎ বিল, গ্যাস বিল, পানির বিল এবং সার্ভিস চার্জ মূল ভাড়ার সাথে অন্তর্ভুক্ত নাকি আলাদা, তা আগেই পরিষ্কার করে নিন।',
      desc_en: 'Ensure whether electricity, gas cylinder/line, water, and waste management charges are included or billed separately.',
    },
    {
      title_bn: 'সন্ধ্যা বা দিনের আলোতে বাসা পরিদর্শন করুন',
      title_en: 'Visit the property during daylight or regular hours',
      desc_bn: 'বাসার পরিবেশ, নিরাপত্তা এবং আশপাশের যাতায়াত সুবিধা বোঝার জন্য দিনের আলোতে পরিদর্শন করা উত্তম।',
      desc_en: 'Inspect the flat, ventilation, water pressure, and neighborhood safety during daylight hours.',
    },
  ];

  return (
    <div className="py-8 sm:py-12 bg-stone-50 min-h-screen">
      <Container className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('home')}
            className="h-9 px-3 rounded-xl border-stone-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>{language === 'bn' ? 'হোমে ফিরুন' : 'Home'}</span>
          </Button>
          <div className="h-4 w-px bg-stone-300" />
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
            {language === 'bn' ? 'সুরক্ষা ও নিরাপত্তা' : 'Safety Guide'}
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-6">
            <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
                {language === 'bn' ? 'ভাড়াটিয়ার নিরাপত্তা নির্দেশিকা' : 'Tenant Safety Guidelines'}
              </h1>
              <p className="text-xs text-stone-500">
                {language === 'bn' ? 'নিরাপদে ও প্রতারণামুক্তভাবে বাসা বা মেস খোঁজার টিপস' : 'Essential safety tips for fraud-free and secure property rentals'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>{language === 'bn' ? 'সতর্কবার্তা:' : 'Important Warning:'}</strong>{' '}
              {language === 'bn' 
                ? 'টু-লেট ময়মনসিংহ কর্তৃপক্ষ কখনো ব্যবহারকারীর কাছ থেকে অগ্রিম টাকা লেনদেনের দায়িত্ব নেয় না। সকল লেনদেন সরাসরি মালিক ও ভাড়াটিয়ার মধ্যে সশরীরে হওয়া বাঞ্চনীয়।'
                : 'ToLet Mymensingh never requests advance booking fees on behalf of landlords. All financial settlements should occur in person.'}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2">
            {rules.map((rule, idx) => (
              <div 
                key={idx}
                className={`p-5 rounded-2xl border ${
                  rule.alert 
                    ? 'bg-rose-50/50 border-rose-200' 
                    : 'bg-stone-50/70 border-stone-200/80'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm sm:text-base">
                  <CheckCircle2 className={`h-5 w-5 ${rule.alert ? 'text-rose-600' : 'text-emerald-600'} shrink-0`} />
                  <span>{language === 'bn' ? rule.title_bn : rule.title_en}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 pl-7 leading-relaxed">
                  {language === 'bn' ? rule.desc_bn : rule.desc_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export const TermsPrivacyView: React.FC<StaticPagesProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  useSEO({
    title: language === 'bn' ? 'ব্যবহারের শর্তাবলী ও প্রাইভেসী পলিসি' : 'Terms of Service & Privacy Policy',
    description: language === 'bn'
      ? 'টু-লেট ময়মনসিংহ প্ল্যাটফর্ম ব্যবহারের সাধারণ নিয়মাবলী, শর্তাবলী ও গোপনীয়তা নীতি।'
      : 'Terms of service and privacy policy for ToLet Mymensingh platform.',
    canonicalUrl: 'https://toletmymensingh.com/terms',
    keywords: ['Terms ToLet Mymensingh', 'Privacy Policy Mymensingh'],
  });

  return (
    <div className="py-8 sm:py-12 bg-stone-50 min-h-screen">
      <Container className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('home')}
            className="h-9 px-3 rounded-xl border-stone-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>{language === 'bn' ? 'হোমে ফিরুন' : 'Home'}</span>
          </Button>
          <div className="h-4 w-px bg-stone-300" />
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            {language === 'bn' ? 'শর্তাবলী ও নীতিমালা' : 'Terms & Privacy'}
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 shadow-sm space-y-6 text-stone-700 text-xs sm:text-sm leading-relaxed">
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-stone-100 pb-4">
            {language === 'bn' ? 'ব্যবহারের শর্তাবলী ও প্রাইভেসী পলিসি' : 'Terms of Service & Privacy Policy'}
          </h1>

          <div className="space-y-4">
            <h2 className="font-bold text-stone-900 text-base">
              {language === 'bn' ? '১. লিস্টিং ও বিজ্ঞাপনের সত্যতা' : '1. Listing Authenticity'}
            </h2>
            <p>
              {language === 'bn'
                ? 'বিজ্ঞাপনদাতা (মালিক বা মেস পরিচালক) নিশ্চিত করবেন যে বিজ্ঞাপনে প্রদত্ত ঠিকানা, ছবি, ভাড়া এবং অন্যান্য সুযোগ-সুবিধা বাস্তব এবং সঠিক। কোনো ধরনের বিভ্রান্তিকর বা ভুয়া তথ্য প্রদান করা হলে সংশ্লিষ্ট লিস্টিং ও অ্যাকাউন্ট স্থায়ীভাবে বাতিল করা হবে।'
                : 'Listing creators warrant that all property photos, rental amounts, and specifications accurately reflect the physical property.'}
            </p>

            <h2 className="font-bold text-stone-900 text-base">
              {language === 'bn' ? '২. যোগাযোগের তথ্য ও সুরক্ষা' : '2. Contact Information & Privacy'}
            </h2>
            <p>
              {language === 'bn'
                ? 'লিস্টিংয়ে প্রদত্ত ফোন নম্বর ও তথ্য শুধুমাত্র বাড়িভাড়া সংক্রান্ত প্রয়োজনে সম্ভাব্য ভাড়াটিয়াদের যোগাযোগের জন্য উন্মুক্ত থাকবে। কোনো বাণিজ্যিক স্প্যাম বা অযাচিত উদ্দেশ্যে এই তথ্য ব্যবহার কঠোরভাবে নিষিদ্ধ।'
                : 'Phone numbers and contact info displayed are solely for rental inquiries. Unauthorized data scraping or marketing spam is strictly prohibited.'}
            </p>

            <h2 className="font-bold text-stone-900 text-base">
              {language === 'bn' ? '৩. দায়মুক্তি (Disclaimer)' : '3. Platform Disclaimer'}
            </h2>
            <p>
              {language === 'bn'
                ? 'টু-লেট ময়মনসিংহ একটি মুক্ত ডিজিটাল সংযোগ মাধ্যম। ভাড়াটিয়া ও মালিকের মধ্যকার চুক্তি, ভাড়া পরিশোধ বা ব্যক্তিগত বিরোধের ক্ষেত্রে উভয় পক্ষের সমঝোতা চূড়ান্ত হবে।'
                : 'ToLet Mymensingh serves as a connection medium. Rental agreements and financial transactions remain between the landlord and tenant directly.'}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
};
