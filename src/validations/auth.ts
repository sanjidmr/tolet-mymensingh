import { z } from 'zod';

// Bangladeshi Phone Regex: supports 013, 014, 015, 016, 017, 018, 019
export const bdPhoneRegex = /^(\+8801|01)[3-9]\d{8}$/;

export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'ইমেইল বা ফোন নম্বর দিন')
    .email('সঠিক ইমেইল এড্রেস প্রদান করুন'),
  password: z
    .string()
    .min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
  rememberMe: z.boolean().optional().default(true),
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;

// Role selection is STRICTLY restricted to 'tenant' or 'owner'.
// Admin registration is strictly blocked from the client.
export const RegisterFormSchema = z
  .object({
    name: z
      .string()
      .min(2, 'আপনার নাম অন্তত ২ অক্ষরের হতে হবে')
      .max(60, 'নাম সর্বোচ্চ ৬০ অক্ষরের হতে পারে'),
    email: z
      .string()
      .min(1, 'ইমেইল এড্রেস লিখুন')
      .email('সঠিক ইমেইল এড্রেস প্রদান করুন'),
    phone: z
      .string()
      .regex(bdPhoneRegex, 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)'),
    role: z.enum(['tenant', 'owner']),
    password: z
      .string()
      .min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
    confirmPassword: z
      .string()
      .min(1, 'পাসওয়ার্ড নিশ্চিত করুন'),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'শর্তাবলী ও গোপনীয়তা নীতি মেনে নেওয়া আবশ্যক',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'উভয় পাসওয়ার্ড এক হতে হবে',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;

export const ProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'আপনার নাম অন্তত ২ অক্ষরের হতে হবে')
    .max(60, 'নাম সর্বোচ্চ ৬০ অক্ষরের হতে পারে'),
  phone: z
    .string()
    .regex(bdPhoneRegex, 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)'),
  whatsapp_number: z
    .string()
    .regex(bdPhoneRegex, 'সঠিক হোয়াটসঅ্যাপ নম্বর দিন')
    .optional()
    .or(z.literal('')),
  avatar_url: z
    .string()
    .url('সঠিক ইমেজ URL দিন')
    .optional()
    .or(z.literal('')),
});

export type ProfileUpdateValues = z.infer<typeof ProfileUpdateSchema>;
