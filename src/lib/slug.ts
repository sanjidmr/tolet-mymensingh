/**
 * Clean URL Slug generation & parsing utility for ToLet Mymensingh
 * Creates SEO-friendly, readable, collision-resistant canonical URLs.
 *
 * Example Outputs:
 * - maskanda-2-bed-family-flat-mymensingh-7xk9
 * - charpara-bachelor-mess-seat-mymensingh-3m2q
 * - krishtopur-female-student-hostel-mymensingh-9a1b
 */

// Bengali phonetic transliteration map for prominent Mymensingh areas & rental terms
const BENGALI_TRANSLITERATION_MAP: Record<string, string> = {
  // Areas
  'মাসকান্দা': 'maskanda',
  'চরপাড়া': 'charpara',
  'চরপাড়া': 'charpara',
  'কেশব মোড়': 'keshob-mor',
  'কেশব মোড়': 'keshob-mor',
  'কেওয়াটখালী': 'kewatkhali',
  'বাঘমারা': 'baghmara',
  'কাচিঝুলি': 'kachijhuli',
  'নাটকঘর লেন': 'natokghor-lane',
  'সেহারা': 'sehara',
  'আকুয়া': 'akua',
  'আকুয়া': 'akua',
  'গুলকিবাড়ি': 'gulkibari',
  'পাটগুদাম': 'patgudam',
  'কৃষ্টপুর': 'krishtopur',
  'ধোপাখোলা': 'dhopakhola',
  'গাঙ্গিনারপাড়': 'ganginarpar',
  'গাঙ্গিনারপাড়': 'ganginarpar',
  'টাউন হল': 'town-hall',
  'নতুন বাজার': 'notun-bazar',
  'বড় বাজার': 'boro-bazar',
  'বড় বাজার': 'boro-bazar',
  'নয়াপাড়া': 'noyapara',
  'নয়াপাড়া': 'noyapara',
  'নয়ানগর': 'noyanogor',
  'নয়ানগর': 'noyanogor',
  'সানকিপাড়া': 'sankipara',
  'সানকিপাড়া': 'sankipara',
  'কালিবাড়ি': 'kalibari',
  'কালিবাড়ি': 'kalibari',
  'আমলাপাড়া': 'amlapara',
  'আমলাপাড়া': 'amlapara',
  'ভাটিকাশর': 'bhatikashor',
  'রহমতপুর': 'rahmatpur',
  'খাগডহর': 'khagdahar',
  'শম্ভুগঞ্জ': 'shambhuganj',
  'বাকৃবি': 'bau-campus',
  'কৃষি বিশ্ববিদ্যালয়': 'bau-campus',
  'শেষ মোড়': 'sesh-mor',
  'শেষ মোড়': 'sesh-mor',
  'মেডিকেল রোড': 'medical-road',
  'আনন্দ মোহন': 'ananda-mohan',
  'পলিটেকনিক': 'polytechnic',
  'ময়মনসিংহ': 'mymensingh',
  'ময়মনসিংহ': 'mymensingh',

  // Rental Types & Features
  'ফ্ল্যাট': 'flat',
  'বাসা': 'house',
  'ভাড়া': 'rent',
  'ভাড়া': 'rent',
  'মেস': 'mess',
  'হোস্টেল': 'hostel',
  'সাবলেট': 'sublet',
  'সিট': 'seat',
  'রুম': 'room',
  'বেডরুম': 'bed',
  'ফ্যামিলি': 'family',
  'ব্যাচেলর': 'bachelor',
  'ছাত্র': 'student',
  'ছাত্রী': 'female-student',
  'মহিলা': 'female',
  'চাকরিজীবী': 'jobholder',
};

/**
 * Transliterates known Bengali location and rental terms to English ASCII
 */
export function transliterateBengaliTerms(text: string): string {
  if (!text) return '';
  let converted = text;

  // Replace multi-word and known terms first
  for (const [bn, en] of Object.entries(BENGALI_TRANSLITERATION_MAP)) {
    const regex = new RegExp(bn, 'gi');
    converted = converted.replace(regex, ` ${en} `);
  }

  return converted;
}

/**
 * Sanitizes arbitrary text into a URL-safe ASCII slug string
 */
export function sanitizeToAsciiSlug(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, ' ') // remove all non-alphanumeric except whitespace and hyphens
    .trim()
    .replace(/\s+/g, '-') // convert spaces to hyphens
    .replace(/-+/g, '-') // collapse consecutive hyphens
    .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
}

interface GenerateListingSlugOptions {
  title_bn?: string;
  title_en?: string;
  area_name_en?: string;
  area_name_bn?: string;
  property_type: string;
  audience?: string;
  bedrooms?: number | null;
  seat_count?: number | null;
  id?: string;
}

/**
 * Generates an SEO-optimized clean slug for listings in Mymensingh
 */
export function generateListingSlug(options: GenerateListingSlugOptions): string {
  const parts: string[] = [];

  // 1. Area Name (Prioritize English, fallback to transliterated Bengali)
  let areaSlug = '';
  if (options.area_name_en) {
    areaSlug = sanitizeToAsciiSlug(options.area_name_en);
  } else if (options.area_name_bn) {
    areaSlug = sanitizeToAsciiSlug(transliterateBengaliTerms(options.area_name_bn));
  }

  if (areaSlug) {
    parts.push(areaSlug);
  }

  // 2. Room/Bed count or Seat count
  if (options.property_type === 'mess' || options.property_type === 'seat') {
    if (options.seat_count && options.seat_count > 1) {
      parts.push(`${options.seat_count}-seat`);
    }
  } else if (options.bedrooms && options.bedrooms > 0) {
    parts.push(`${options.bedrooms}-bed`);
  }

  // 3. Audience tag if specific
  if (options.audience === 'bachelor') {
    parts.push('bachelor');
  } else if (options.audience === 'female') {
    parts.push('female-only');
  } else if (options.audience === 'family') {
    parts.push('family');
  } else if (options.audience === 'student') {
    parts.push('student');
  }

  // 4. Property Type
  const typeMap: Record<string, string> = {
    apartment: 'flat',
    room: 'room',
    sublet: 'sublet',
    mess: 'mess',
    hostel: 'hostel',
    seat: 'mess-seat',
  };
  parts.push(typeMap[options.property_type] || options.property_type || 'rent');

  // 5. English title keywords (if available)
  if (options.title_en) {
    const cleanTitleEn = sanitizeToAsciiSlug(options.title_en)
      .split('-')
      .filter((w) => w.length > 2 && !parts.includes(w))
      .slice(0, 4)
      .join('-');
    if (cleanTitleEn) {
      parts.push(cleanTitleEn);
    }
  }

  // Always ensure 'mymensingh' anchor for geo-SEO
  if (!parts.some((p) => p.includes('mymensingh'))) {
    parts.push('mymensingh');
  }

  // 6. Unique short suffix (derived from ID or timestamp) to guarantee collision resistance
  const uniqueToken = options.id
    ? options.id.replace(/[^a-z0-9]/gi, '').slice(-4).toLowerCase() || Math.random().toString(36).slice(-4)
    : Math.random().toString(36).slice(-4);

  parts.push(uniqueToken);

  const finalSlug = parts
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return finalSlug || `tolet-mymensingh-${uniqueToken}`;
}
