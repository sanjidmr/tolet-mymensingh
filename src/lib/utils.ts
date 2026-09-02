import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, language: string = 'bn'): string {
  if (language === 'bn') {
    return `৳ ${toBengaliNumber(amount.toLocaleString('en-IN'))}`;
  }
  return `৳ ${amount.toLocaleString('en-US')}`;
}

export function toBengaliNumber(num: number | string, language: string = 'bn'): string {
  if (language === 'en') {
    return num.toString();
  }
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}
