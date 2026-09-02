import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Building2, 
  Home, 
  MapPin, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Phone, 
  MessageSquare, 
  DollarSign, 
  Sparkles, 
  HelpCircle, 
  Eye, 
  Star,
  ChevronRight,
  MoveLeft,
  MoveRight,
  Plus,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { useAuth } from '../../lib/supabase';
import { generateListingSlug } from '../../lib/slug';
import { 
  ListingFormSchema, 
  ListingFormValues, 
  PropertyTypeEnum, 
  TargetAudienceEnum,
  ImageItem 
} from '../../validations/listing';
import { fetchAreas } from '../../lib/supabase/services/areas';
import { fetchAmenities } from '../../lib/supabase/services/amenities';
import { 
  createListing, 
  updateListing, 
  fetchListingById 
} from '../../lib/supabase/services/listings';
import { uploadListingImage } from '../../lib/supabase/services/storage';
import { Area, Amenity, Listing, PropertyType, TargetAudience } from '../../types';
import { formatPrice, toBengaliNumber } from '../../lib/utils';
import { Button } from '../ui/button';
import { Container } from '../layout/Container';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useSEO } from '../../lib/useSEO';

interface ListingWizardFormProps {
  onNavigate: (view: string, params?: Record<string, unknown>) => void;
  listingIdToEdit?: string;
}

const STEPS = [
  { id: 1, titleBn: 'প্রপার্টির ধরন', titleEn: 'Property Type' },
  { id: 2, titleBn: 'মৌলিক তথ্য', titleEn: 'Basic Info' },
  { id: 3, titleBn: 'ভাড়া ও বিল', titleEn: 'Pricing' },
  { id: 4, titleBn: 'ঠিকানা ও এলাকা', titleEn: 'Location' },
  { id: 5, titleBn: 'সুবিধাসমূহ', titleEn: 'Amenities' },
  { id: 6, titleBn: 'ছবি আপলোড', titleEn: 'Photos' },
  { id: 7, titleBn: 'যোগাযোগের তথ্য', titleEn: 'Contact' },
  { id: 8, titleBn: 'প্রিভিউ', titleEn: 'Preview' },
  { id: 9, titleBn: 'সাবমিশন', titleEn: 'Submit' },
];

const DEFAULT_SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop',
];

export const ListingWizardForm: React.FC<ListingWizardFormProps> = ({
  onNavigate,
  listingIdToEdit,
}) => {
  const { language } = useLanguage();
  const { user, profile, isAdmin } = useAuth();

  const isEditing = Boolean(listingIdToEdit);
  const [currentStep, setCurrentStep] = useState<number>(1);

  useSEO({
    title: isEditing ? 'বিজ্ঞাপন সম্পাদনা' : 'নতুন বাসা বা মেসের বিজ্ঞাপন দিন',
    noindex: true,
  });
  const [areas, setAreas] = useState<Area[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(isEditing);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existingListing, setExistingListing] = useState<Listing | null>(null);

  const ownerId = user?.id || profile?.id || 'demo-owner-mymensingh';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    control,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(ListingFormSchema) as any,
    defaultValues: {
      property_type: 'apartment',
      audience: 'family',
      title_bn: '',
      title_en: '',
      description_bn: '',
      description_en: '',
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      floor_number: 3,
      total_floors: 6,
      area_sqft: 1100,
      seat_count: 1,
      available_from: '১লা আগামী মাস থেকে',
      rent_monthly: 12000,
      security_deposit: 12000,
      service_charge: 1000,
      is_negotiable: false,
      gas_bill_included: false,
      electricity_bill_included: false,
      water_bill_included: true,
      area_id: '',
      address_street_bn: '',
      landmark_bn: '',
      amenity_ids: [],
      images: [
        {
          id: 'default-img-1',
          url: DEFAULT_SAMPLE_PHOTOS[0],
          storage_path: 'mock/default-1.jpg',
          is_primary: true,
          order_index: 0,
        },
      ],
      contact_name: profile?.name || 'বাড়িওয়ালা',
      contact_phone: profile?.phone || '01712345678',
      contact_whatsapp: profile?.whatsapp_number || profile?.phone || '01712345678',
      hide_exact_phone: false,
      agree_to_terms: true,
      submission_action: 'pending',
    },
  });


  const formValues = watch();

  // Load catalogs and existing data
  useEffect(() => {
    async function loadData() {
      try {
        const [areasData, amenitiesData] = await Promise.all([
          fetchAreas(),
          fetchAmenities(),
        ]);
        setAreas(areasData);
        setAmenities(amenitiesData);
        if (areasData.length > 0 && !formValues.area_id) {
          setValue('area_id', areasData[0].id);
        }

        if (isEditing && listingIdToEdit) {
          const fetched = await fetchListingById(listingIdToEdit);
          if (fetched) {
            setExistingListing(fetched);
            // Verify ownership
            if (fetched.owner_id !== ownerId && !isAdmin) {
              setSubmitError(
                language === 'bn'
                  ? 'অননুমোদিত: আপনি শুধুমাত্র নিজের বিজ্ঞাপন সম্পাদনা করতে পারেন।'
                  : 'Unauthorized: You can only edit your own listings.'
              );
              return;
            }

            reset({
              property_type: fetched.property_type,
              audience: fetched.audience,
              title_bn: fetched.title_bn,
              title_en: fetched.title_en || '',
              description_bn: fetched.description_bn,
              description_en: fetched.description_en || '',
              bedrooms: fetched.bedrooms || 0,
              bathrooms: fetched.bathrooms || 0,
              balconies: fetched.balconies || 0,
              floor_number: fetched.floor_number || 0,
              total_floors: fetched.total_floors || 0,
              area_sqft: fetched.area_sqft || 0,
              seat_count: fetched.seat_count || 1,
              available_from: fetched.available_from || '১লা আগামী মাস থেকে',
              rent_monthly: fetched.rent_monthly,
              security_deposit: fetched.security_deposit || 0,
              service_charge: fetched.service_charge || 0,
              is_negotiable: fetched.is_negotiable || false,
              gas_bill_included: fetched.gas_bill_included || false,
              electricity_bill_included: fetched.electricity_bill_included || false,
              water_bill_included: fetched.water_bill_included ?? true,
              area_id: fetched.area_id,
              address_street_bn: fetched.address_street_bn,
              address_street_en: fetched.address_street_en || '',
              landmark_bn: fetched.landmark_bn || '',
              landmark_en: fetched.landmark_en || '',
              amenity_ids: fetched.amenity_ids || [],
              images: fetched.images.map((img, idx) => ({
                id: img.id || `img-${idx}`,
                url: img.url,
                storage_path: img.storage_path || '',
                is_primary: img.is_primary ?? idx === 0,
                order_index: img.order_index ?? idx,
              })),
              contact_name: fetched.contact_name,
              contact_phone: fetched.contact_phone,
              contact_whatsapp: fetched.contact_whatsapp || '',
              hide_exact_phone: fetched.hide_exact_phone || false,
              agree_to_terms: true,
              submission_action: fetched.status === 'draft' ? 'draft' : 'pending',
            });
          }
        }
      } catch (err) {
        console.error('Error loading form data:', err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
  }, [listingIdToEdit, isEditing, reset, setValue, ownerId, isAdmin, language]);

  // Step Validation before progressing
  const handleNextStep = async () => {
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = await trigger(['property_type', 'audience']);
        break;
      case 2:
        isValid = await trigger([
          'title_bn',
          'description_bn',
          'bedrooms',
          'bathrooms',
          'balconies',
          'floor_number',
          'total_floors',
          'area_sqft',
          'available_from',
        ]);
        break;
      case 3:
        isValid = await trigger(['rent_monthly', 'security_deposit', 'service_charge']);
        break;
      case 4:
        isValid = await trigger(['area_id', 'address_street_bn']);
        break;
      case 5:
        isValid = true; // Amenities are optional
        break;
      case 6:
        isValid = await trigger(['images']);
        if (!formValues.images || formValues.images.length === 0) {
          setSubmitError(language === 'bn' ? 'অন্তত ১টি ছবি দিন' : 'Please provide at least 1 image');
          isValid = false;
        } else {
          setSubmitError(null);
        }
        break;
      case 7:
        isValid = await trigger(['contact_name', 'contact_phone']);
        break;
      case 8:
        isValid = true;
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 9));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Image Management
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const remainingSlots = 10 - (formValues.images?.length || 0);
    if (remainingSlots <= 0) {
      setSubmitError(language === 'bn' ? 'সর্বোচ্চ ১০টি ছবি আপলোড করা যাবে।' : 'Max 10 images allowed.');
      return;
    }

    const filesToUpload: File[] = fileList.slice(0, remainingSlots) as File[];
    setUploadProgress(10);

    try {
      const currentImages = formValues.images || [];
      const newImages: ImageItem[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const progressChunk = 10 + Math.round(((i + 1) / filesToUpload.length) * 80);
        
        const result = await uploadListingImage(
          file,
          ownerId,
          listingIdToEdit || 'new-listing',
          (pct) => setUploadProgress(progressChunk)
        );


        newImages.push({
          id: `img-up-${Date.now()}-${i}`,
          url: result.url,
          storage_path: result.storagePath,
          is_primary: currentImages.length === 0 && i === 0,
          order_index: currentImages.length + i,
        });
      }

      setValue('images', [...currentImages, ...newImages], { shouldValidate: true });
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 1000);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setSubmitError(err.message || 'Image upload failed');
      setUploadProgress(null);
    }
  };

  const handleAddSamplePhoto = (sampleUrl: string) => {
    const currentImages = formValues.images || [];
    if (currentImages.length >= 10) return;

    const newImg: ImageItem = {
      id: `img-sample-${Date.now()}`,
      url: sampleUrl,
      storage_path: `mock/sample-${Date.now()}.jpg`,
      is_primary: currentImages.length === 0,
      order_index: currentImages.length,
    };
    setValue('images', [...currentImages, newImg], { shouldValidate: true });
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = [...(formValues.images || [])];
    const removed = currentImages.splice(index, 1);
    
    // If we removed primary, assign primary to first remaining
    if (removed[0]?.is_primary && currentImages.length > 0) {
      currentImages[0].is_primary = true;
    }
    // Re-index
    const reindexed = currentImages.map((img, idx) => ({ ...img, order_index: idx }));
    setValue('images', reindexed, { shouldValidate: true });
  };

  const handleSetPrimary = (index: number) => {
    const currentImages = (formValues.images || []).map((img, idx) => ({
      ...img,
      is_primary: idx === index,
    }));
    setValue('images', currentImages, { shouldValidate: true });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const currentImages = [...(formValues.images || [])];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;

    const temp = currentImages[index];
    currentImages[index] = currentImages[targetIndex];
    currentImages[targetIndex] = temp;

    const reindexed = currentImages.map((img, idx) => ({ ...img, order_index: idx }));
    setValue('images', reindexed, { shouldValidate: true });
  };

  const toggleAmenity = (amenityId: string) => {
    const current = formValues.amenity_ids || [];
    if (current.includes(amenityId)) {
      setValue(
        'amenity_ids',
        current.filter((id) => id !== amenityId),
        { shouldValidate: true }
      );
    } else {
      setValue('amenity_ids', [...current, amenityId], { shouldValidate: true });
    }
  };

  // Final Form Submission
  const onFinalSubmit = async (data: ListingFormValues, actionType: 'draft' | 'pending') => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const targetArea = areas.find((a) => a.id === data.area_id);
      const generatedSlug = isEditing && existingListing?.slug 
        ? existingListing.slug 
        : generateListingSlug({
            title_bn: data.title_bn,
            title_en: data.title_en,
            area_name_en: targetArea?.name_en,
            area_name_bn: targetArea?.name_bn,
            property_type: data.property_type,
            audience: data.audience,
            bedrooms: data.bedrooms,
            seat_count: data.seat_count,
            id: existingListing?.id,
          });

      const listingPayload = {
        owner_id: ownerId,
        title_bn: data.title_bn,
        title_en: data.title_en || null,
        slug: generatedSlug,
        description_bn: data.description_bn,
        description_en: data.description_en || null,
        property_type: data.property_type,
        audience: data.audience,
        status: actionType, // strictly 'draft' or 'pending' - never 'approved'
        rent_monthly: Number(data.rent_monthly),
        security_deposit: data.security_deposit ? Number(data.security_deposit) : null,
        is_negotiable: Boolean(data.is_negotiable),
        service_charge: data.service_charge ? Number(data.service_charge) : null,
        gas_bill_included: Boolean(data.gas_bill_included),
        electricity_bill_included: Boolean(data.electricity_bill_included),
        water_bill_included: Boolean(data.water_bill_included),
        bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
        balconies: data.balconies ? Number(data.balconies) : null,
        floor_number: data.floor_number ? Number(data.floor_number) : null,
        total_floors: data.total_floors ? Number(data.total_floors) : null,
        area_sqft: data.area_sqft ? Number(data.area_sqft) : null,
        seat_count: data.seat_count ? Number(data.seat_count) : null,
        area_id: data.area_id,
        address_street_bn: data.address_street_bn,
        address_street_en: data.address_street_en || null,
        landmark_bn: data.landmark_bn || null,
        landmark_en: data.landmark_en || null,
        latitude: null,
        longitude: null,
        contact_name: data.contact_name,
        contact_phone: data.contact_phone,
        contact_whatsapp: data.contact_whatsapp || null,
        hide_exact_phone: Boolean(data.hide_exact_phone),
        available_from: data.available_from,
      };

      const imagesPayload = (data.images || []).map((img, idx) => ({
        url: img.url,
        storage_path: img.storage_path || `mock/img-${idx}.jpg`,
        is_primary: img.is_primary ?? idx === 0,
        order_index: img.order_index ?? idx,
      }));

      if (isEditing && listingIdToEdit) {
        const updateSuccess = await updateListing(
          listingIdToEdit,
          ownerId,
          listingPayload,
          imagesPayload,
          data.amenity_ids
        );
        if (!updateSuccess) {
          throw new Error('Failed to update listing.');
        }
      } else {
        await createListing(listingPayload, imagesPayload, data.amenity_ids || []);
      }

      // Success -> navigate to listings list
      onNavigate('dashboard/listings');
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'Something went wrong while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-bold">
          {language === 'bn' ? 'বিজ্ঞাপনের তথ্য লোড হচ্ছে...' : 'Loading listing data...'}
        </p>
      </div>
    );
  }

  const selectedArea = areas.find((a) => a.id === formValues.area_id);

  return (
    <div className="py-8 sm:py-12 bg-stone-50/60 min-h-[calc(100vh-200px)]">
      <Container className="max-w-4xl">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('dashboard/listings')}
              className="h-9 px-3 rounded-xl border-stone-200 bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>{language === 'bn' ? 'আমার বিজ্ঞাপনে ফিরুন' : 'Back to Listings'}</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                {isEditing 
                  ? (language === 'bn' ? 'বিজ্ঞাপন সম্পাদনা করুন' : 'Edit Rental Listing')
                  : (language === 'bn' ? 'নতুন টু-লেট বিজ্ঞাপন দিন' : 'Create New Rental Listing')}
              </h1>
              <p className="text-xs text-stone-500">
                {language === 'bn'
                  ? `ধাপ ${toBengaliNumber(currentStep, language)} / ${toBengaliNumber(9, language)}: ${STEPS[currentStep - 1].titleBn}`
                  : `Step ${currentStep} of 9: ${STEPS[currentStep - 1].titleEn}`}
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-extrabold">
            {isEditing ? 'সম্পাদনা মোড' : '৯-ধাপের স্মার্ট উইজার্ড'}
          </span>
        </div>

        {/* Multi-step Horizontal Stepper */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 mb-6 shadow-2xs">
          {/* Mobile Step Bar (<640px) */}
          <div className="sm:hidden space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-800">
              <span className="text-emerald-700">
                {language === 'bn' ? `ধাপ ${toBengaliNumber(currentStep, language)} / ৯: ${STEPS[currentStep - 1].titleBn}` : `Step ${currentStep} of 9: ${STEPS[currentStep - 1].titleEn}`}
              </span>
              <span className="text-stone-400 font-semibold">
                {Math.round((currentStep / 9) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 9) * 100}%` }}
              />
            </div>
          </div>

          {/* Desktop Stepper (>=640px) */}
          <div className="hidden sm:flex items-center justify-between overflow-x-auto no-scrollbar pt-1">
            {STEPS.map((step) => {
              const isPast = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (step.id < currentStep) {
                      setCurrentStep(step.id);
                    }
                  }}
                  disabled={step.id > currentStep}
                  className={`flex flex-col items-center gap-1.5 transition-all text-center ${
                    isCurrent
                      ? 'text-emerald-700 font-extrabold'
                      : isPast
                      ? 'text-stone-700 cursor-pointer'
                      : 'text-stone-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all border ${
                      isCurrent
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs ring-4 ring-emerald-50'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-stone-100 text-stone-400 border-stone-200'
                    }`}
                  >
                    {isPast ? <Check className="h-4 w-4" /> : toBengaliNumber(step.id, language)}
                  </div>
                  <span className="text-[11px] whitespace-nowrap">
                    {language === 'bn' ? step.titleBn : step.titleEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Error Banner */}
        {submitError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 mb-6 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{submitError}</span>
            </div>
            <button onClick={() => setSubmitError(null)} className="text-rose-500 hover:text-rose-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step Container Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 mb-8">
          {/* ================= STEP 1: PROPERTY TYPE & AUDIENCE ================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 mb-1">
                  {language === 'bn' ? '১. প্রপার্টি ও ভাড়াটিয়ার ধরন নির্বাচন করুন' : '1. Select Property Type & Target Audience'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'bn' ? 'আপনার বাসা বা মেসের ধরন অনুযায়ী সঠিক ক্যাটাগরি বেছে নিন।' : 'Choose the category that best matches your rental listing.'}
                </p>
              </div>

              {/* Property Type Grid */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'প্রপার্টির ধরন *' : 'Property Type *'}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'apartment', nameBn: 'পারিবারিক ফ্ল্যাট', nameEn: 'Family Apartment', icon: '🏢' },
                    { id: 'room', nameBn: 'সিঙ্গেল / মাস্টার রুম', nameEn: 'Single Room', icon: '🚪' },
                    { id: 'sublet', nameBn: 'সাবলেট রুম', nameEn: 'Sublet', icon: '🔑' },
                    { id: 'mess', nameBn: 'রুম মেস (ছাত্র/চাকরিজীবী)', nameEn: 'Mess Seat/Room', icon: '👥' },
                    { id: 'hostel', nameBn: 'ছাত্র/ছাত্রী হোস্টেল', nameEn: 'Hostel', icon: '🛏️' },
                    { id: 'seat', nameBn: 'সিট ভাড়া', nameEn: 'Single Seat', icon: '🛋️' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setValue('property_type', item.id as PropertyType, { shouldValidate: true })}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                        formValues.property_type === item.id
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50/50'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-bold text-sm text-stone-900">{language === 'bn' ? item.nameBn : item.nameEn}</div>
                        <div className="text-[11px] text-stone-500">{item.nameEn}</div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.property_type && <p className="text-rose-500 text-xs font-bold">{errors.property_type.message}</p>}
              </div>

              {/* Target Audience */}
              <div className="space-y-3 pt-4 border-t border-stone-100">
                <Label className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'ভাড়াটিয়া ক্যাটাগরি (কাদের জন্য প্রযোজ্য) *' : 'Target Audience *'}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'family', nameBn: 'পরিবার (Family)', desc: 'শুধুমাত্র পরিবার' },
                    { id: 'bachelor', nameBn: 'ব্যাচেলর (Bachelor)', desc: 'চাকরিজীবী বা ছাত্র' },
                    { id: 'student', nameBn: 'শিক্ষার্থী (Student)', desc: 'মেডিকেল/বিশ্ববিদ্যালয় শিক্ষার্থী' },
                    { id: 'female', nameBn: 'মহিলা / ছাত্রী', desc: 'শুধুমাত্র নারী' },
                    { id: 'male', nameBn: 'পুরুষ / ছাত্র', desc: 'শুধুমাত্র পুরুষ' },
                    { id: 'mixed', nameBn: 'যেকোনো (Mixed)', desc: 'সকলের জন্য গ্রহণযোগ্য' },
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setValue('audience', aud.id as TargetAudience, { shouldValidate: true })}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        formValues.audience === aud.id
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-stone-900">{aud.nameBn}</div>
                      <div className="text-[10px] text-stone-500">{aud.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: BASIC INFORMATION ================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 mb-1">
                  {language === 'bn' ? '২. বাসার মৌলিক বিবরণ ও স্পেসিফিকেশন' : '2. Basic Details & Specifications'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'bn' ? 'আকর্ষণীয় শিরোনাম ও বিস্তারিত বিবরণ লিখুন।' : 'Enter a clear title and room breakdown.'}
                </p>
              </div>

              {/* Title Bangla */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'বিজ্ঞাপনের শিরোনাম (বাংলায়) *' : 'Listing Title (Bangla) *'}
                </Label>
                <input
                  type="text"
                  {...register('title_bn')}
                  placeholder="যেমন: নতুন বাজার মেইন রোডে ৩ রুমের লাক্সারি ফ্ল্যাট ভাড়া হবে"
                  className="w-full h-11 px-4 rounded-xl border border-stone-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {errors.title_bn && <p className="text-rose-500 text-xs font-bold">{errors.title_bn.message}</p>}
              </div>

              {/* Title English */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'শিরোনাম (ইংরেজিতে - ঐচ্ছিক)' : 'Title (English - Optional)'}
                </Label>
                <input
                  type="text"
                  {...register('title_en')}
                  placeholder="e.g. 3 Bedroom Modern Flat for Rent in Notun Bazar"
                  className="w-full h-11 px-4 rounded-xl border border-stone-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Description Bangla */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'বিস্তারিত বিবরণ (বাংলায়) *' : 'Detailed Description (Bangla) *'}
                </Label>
                <textarea
                  rows={4}
                  {...register('description_bn')}
                  placeholder="বাসার পরিবেশ, খোলামেলা বারান্দা, গ্যাস/বিদ্যুৎ লাইন, নিরাপত্তা ও আশপাশের সুযোগ সুবিধা বিস্তারিত লিখুন..."
                  className="w-full p-4 rounded-xl border border-stone-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {errors.description_bn && <p className="text-rose-500 text-xs font-bold">{errors.description_bn.message}</p>}
              </div>

              {/* Numerical Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-stone-100">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">{language === 'bn' ? 'বেডরুম' : 'Bedrooms'}</Label>
                  <input
                    type="number"
                    min={0}
                    {...register('bedrooms')}
                    className="w-full h-11 px-3 rounded-xl border border-stone-200 text-sm font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">{language === 'bn' ? 'বাথরুম' : 'Bathrooms'}</Label>
                  <input
                    type="number"
                    min={0}
                    {...register('bathrooms')}
                    className="w-full h-11 px-3 rounded-xl border border-stone-200 text-sm font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">{language === 'bn' ? 'বারান্দা' : 'Balconies'}</Label>
                  <input
                    type="number"
                    min={0}
                    {...register('balconies')}
                    className="w-full h-11 px-3 rounded-xl border border-stone-200 text-sm font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">{language === 'bn' ? 'আয়তন (স্কয়ার ফিট)' : 'Area (sqft)'}</Label>
                  <input
                    type="number"
                    min={0}
                    {...register('area_sqft')}
                    placeholder="1200"
                    className="w-full h-11 px-3 rounded-xl border border-stone-200 text-sm font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">{language === 'bn' ? 'ফ্লোর নম্বর' : 'Floor No.'}</Label>
                  <input
                    type="number"
                    min={0}
                    {...register('floor_number')}
                    className="w-full h-11 px-3 rounded-xl border border-stone-200 text-sm font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">{language === 'bn' ? 'মোট তলা' : 'Total Floors'}</Label>
                  <input
                    type="number"
                    min={1}
                    {...register('total_floors')}
                    className="w-full h-11 px-3 rounded-xl border border-stone-200 text-sm font-bold"
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">{language === 'bn' ? 'কবে থেকে বরাদ্দ *' : 'Available From *'}</Label>
                  <input
                    type="text"
                    {...register('available_from')}
                    placeholder="যেমন: আগামী ১লা মার্চ থেকে"
                    className="w-full h-11 px-3 rounded-xl border border-stone-200 text-sm font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PRICING & UTILITIES ================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 mb-1">
                  {language === 'bn' ? '৩. মাসিক ভাড়া ও ইউটিলিটি বিলের হিসাব' : '3. Pricing & Utility Breakdown'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'bn' ? 'সঠিক ভাড়া ও অন্যান্য খরচের বিবরণ দিয়ে ভাড়াটিয়াদের স্পষ্ট ধারণা দিন।' : 'Specify rent, advance deposit, and bill inclusion flags.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">
                    {language === 'bn' ? 'মাসিক ভাড়া (টাকায়) *' : 'Monthly Rent (BDT) *'}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-700">৳</span>
                    <input
                      type="number"
                      {...register('rent_monthly')}
                      className="w-full h-11 pl-8 pr-3 rounded-xl border border-stone-200 text-base font-extrabold text-emerald-700"
                    />
                  </div>
                  {errors.rent_monthly && <p className="text-rose-500 text-xs font-bold">{errors.rent_monthly.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">
                    {language === 'bn' ? 'অ্যাডভান্স / সিকিউরিটি ডিপোজিট' : 'Security Deposit (BDT)'}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-500">৳</span>
                    <input
                      type="number"
                      {...register('security_deposit')}
                      className="w-full h-11 pl-8 pr-3 rounded-xl border border-stone-200 text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">
                    {language === 'bn' ? 'সার্ভিস চার্জ (যদি থাকে)' : 'Service Charge (BDT)'}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-500">৳</span>
                    <input
                      type="number"
                      {...register('service_charge')}
                      className="w-full h-11 pl-8 pr-3 rounded-xl border border-stone-200 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Negotiable Flag */}
              <label className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_negotiable')}
                  className="h-4 w-4 text-emerald-600 rounded"
                />
                <span className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'ভাড়া আলোচনা সাপেক্ষ (Negotiable)' : 'Rent is Negotiable'}
                </span>
              </label>

              {/* Bills Included */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <Label className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'ভাড়ার মধ্যে অন্তর্ভুক্ত বিলসমূহ' : 'Bills Included in Monthly Rent'}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      {...register('gas_bill_included')}
                      className="h-4 w-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-bold text-stone-800">🔥 {language === 'bn' ? 'গ্যাস বিল অন্তর্ভুক্ত' : 'Gas Bill Included'}</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      {...register('electricity_bill_included')}
                      className="h-4 w-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-bold text-stone-800">⚡ {language === 'bn' ? 'বিদ্যুৎ বিল অন্তর্ভুক্ত' : 'Electricity Included'}</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      {...register('water_bill_included')}
                      className="h-4 w-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-bold text-stone-800">💧 {language === 'bn' ? 'পানি বিল অন্তর্ভুক্ত' : 'Water Bill Included'}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: LOCATION ================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 mb-1">
                  {language === 'bn' ? '৪. ময়মনসিংহের সঠিক লোকেশন ও ঠিকানা' : '4. Mymensingh Location & Address'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'bn' ? 'এলাকা এবং নিকটস্থ ল্যান্ডমার্ক উল্লেখ করলে ভাড়াটিয়ারা সহজে খুঁজে পাবে।' : 'Select area in Mymensingh city and specify road/landmark.'}
                </p>
              </div>

              {/* Area Dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'ময়মনসিংহের এলাকা নির্বাচন করুন *' : 'Select Mymensingh Area *'}
                </Label>
                <select
                  {...register('area_id')}
                  className="w-full h-11 px-4 rounded-xl border border-stone-200 text-sm font-bold bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">{language === 'bn' ? '-- এলাকা বেছে নিন --' : '-- Select Area --'}</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {language === 'bn' ? area.name_bn : area.name_en} {area.is_popular ? '⭐ (জনপ্রিয়)' : ''}
                    </option>
                  ))}
                </select>
                {errors.area_id && <p className="text-rose-500 text-xs font-bold">{errors.area_id.message}</p>}
              </div>

              {/* Street Address Bangla */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'রাস্তা / পাড়া / মহল্লার নাম (বাংলায়) *' : 'Road / Mahalla Name (Bangla) *'}
                </Label>
                <input
                  type="text"
                  {...register('address_street_bn')}
                  placeholder="যেমন: কলেজ রোড, বাসা নং ১২/বি, ব্রাহ্মপল্লী"
                  className="w-full h-11 px-4 rounded-xl border border-stone-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {errors.address_street_bn && <p className="text-rose-500 text-xs font-bold">{errors.address_street_bn.message}</p>}
              </div>

              {/* Landmark */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-stone-800">
                  {language === 'bn' ? 'নিকটবর্তী ল্যান্ডমার্ক বা চেনার উপায়' : 'Nearest Landmark'}
                </Label>
                <input
                  type="text"
                  {...register('landmark_bn')}
                  placeholder="যেমন: জিলা স্কুলের বিপরীতে, আনন্দ মোহন কলেজ গেট সংলগ্ন"
                  className="w-full h-11 px-4 rounded-xl border border-stone-200 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* ================= STEP 5: AMENITIES ================= */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 mb-1">
                  {language === 'bn' ? '৫. বাসা ও মেসের সুবিধাসমূহ নির্বাচন করুন' : '5. Select Amenities & Features'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'bn' ? 'যেসব সুবিধা বিদ্যমান তাতে টিক দিন।' : 'Check all the amenities available in this property.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {amenities.map((amenity) => {
                  const isSelected = (formValues.amenity_ids || []).includes(amenity.id);

                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-500'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                      }`}
                    >
                      <span className="font-bold text-xs">{language === 'bn' ? amenity.name_bn : amenity.name_en}</span>
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                          isSelected ? 'bg-emerald-600 text-white' : 'border border-stone-300'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= STEP 6: PHOTOS & UPLOAD ================= */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 mb-1">
                  {language === 'bn' ? '৬. বাসার ছবি আপলোড ও সাজানো' : '6. Photos & Gallery Upload'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'bn' ? 'পরিষ্কার ছবি দিলে ৩ গুণ বেশি ভাড়াটিয়া যোগাযোগ করে। প্রথম ছবিটি কভার ফটো হিসেবে প্রদর্শিত হবে।' : 'High quality images increase tenant inquiries significantly.'}
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-emerald-300 rounded-3xl p-6 sm:p-8 bg-emerald-50/40 text-center relative hover:bg-emerald-50/70 transition-all">
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <Upload className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-stone-900">
                  {language === 'bn' ? 'ছবি আপলোড করতে ক্লিক করুন বা টেনে আনুন' : 'Click or Drag & Drop Photos here'}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  PNG, JPG, WEBP (সর্বোচ্চ ১০টি ছবি)
                </p>
              </div>

              {/* Upload Progress Bar */}
              {uploadProgress !== null && (
                <div className="space-y-1.5 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="flex justify-between text-xs font-bold text-emerald-900">
                    <span>{language === 'bn' ? 'ছবি প্রসেস হচ্ছে...' : 'Uploading images...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-emerald-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Sample Presets for Testing */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-stone-600">
                  {language === 'bn' ? 'দ্রুত টেস্ট ছবি যোগ করুন:' : 'Add quick demo photo:'}
                </span>
                {DEFAULT_SAMPLE_PHOTOS.map((sUrl, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSamplePhoto(sUrl)}
                    className="h-7 px-2 text-[11px] rounded-lg bg-white border-stone-200"
                  >
                    + ছবি {idx + 1}
                  </Button>
                ))}
              </div>

              {/* Uploaded Photos Grid with Ordering & Delete */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-stone-800">
                  {language === 'bn'
                    ? `সংযুক্ত ছবি (${toBengaliNumber(formValues.images?.length || 0, language)}/১০)`
                    : `Attached Photos (${formValues.images?.length || 0}/10)`}
                </Label>

                {formValues.images && formValues.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {formValues.images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className={`relative rounded-2xl overflow-hidden border-2 bg-stone-100 group shadow-xs ${
                          img.is_primary ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-stone-200'
                        }`}
                      >
                        <div className="h-32 w-full">
                          <img
                            src={img.url}
                            alt={`Preview ${idx + 1}`}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Primary Badge */}
                        {img.is_primary && (
                          <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                            <Star className="h-3 w-3 fill-white" />
                            <span>{language === 'bn' ? 'কভার ছবি' : 'Cover Photo'}</span>
                          </div>
                        )}

                        {/* Actions overlay */}
                        <div className="p-2 bg-white/95 backdrop-blur-xs flex items-center justify-between border-t border-stone-100">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, 'left')}
                              className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                              title="Move Left"
                            >
                              <MoveLeft className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === formValues.images.length - 1}
                              onClick={() => handleMoveImage(idx, 'right')}
                              className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30"
                              title="Move Right"
                            >
                              <MoveRight className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {!img.is_primary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(idx)}
                                className="text-[10px] font-bold text-emerald-700 hover:underline px-1"
                              >
                                {language === 'bn' ? 'কভার করুন' : 'Make Cover'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 text-rose-500 hover:text-rose-700"
                              title="Delete Photo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-rose-500 font-bold">
                    {language === 'bn' ? 'বিজ্ঞাপন সাবমিট করতে অন্তত ১টি ছবি দিন।' : 'Please upload at least 1 image.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 7: CONTACT INFORMATION ================= */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 mb-1">
                  {language === 'bn' ? '৭. যোগাযোগের তথ্য ও নম্বর' : '7. Contact Details'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'bn' ? 'ভাড়াটিয়ারা যাতে সরাসরি কল বা হোয়াটসঅ্যাপে যোগাযোগ করতে পারে।' : 'Provide direct phone and WhatsApp contact details for inquiries.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">
                    {language === 'bn' ? 'যোগাযোগের ব্যক্তির নাম *' : 'Contact Person Name *'}
                  </Label>
                  <input
                    type="text"
                    {...register('contact_name')}
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 text-sm font-bold"
                  />
                  {errors.contact_name && <p className="text-rose-500 text-xs font-bold">{errors.contact_name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">
                    {language === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Phone Number *'}
                  </Label>
                  <input
                    type="tel"
                    {...register('contact_phone')}
                    placeholder="01712345678"
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 text-sm font-bold text-emerald-800"
                  />
                  {errors.contact_phone && <p className="text-rose-500 text-xs font-bold">{errors.contact_phone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-stone-800">
                    {language === 'bn' ? 'হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)' : 'WhatsApp Number (Optional)'}
                  </Label>
                  <input
                    type="tel"
                    {...register('contact_whatsapp')}
                    placeholder="01712345678"
                    className="w-full h-11 px-4 rounded-xl border border-stone-200 text-sm font-bold"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('hide_exact_phone')}
                      className="h-4 w-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-bold text-stone-700">
                      {language === 'bn' ? 'শুধুমাত্র রেজিস্টার্ড ব্যবহারকারীদের নম্বর দেখান' : 'Show phone only to registered users'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 8: REALISTIC LIVE PREVIEW ================= */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 mb-1">
                  {language === 'bn' ? '৮. লাইভ প্রিভিউ (ভাড়াটিয়ারা যেভাবে দেখবে)' : '8. Live Preview of Your Listing'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'bn' ? 'সাবমিট করার আগে নিশ্চিত হোন সব তথ্য ও ছবি সঠিকভাবে প্রদর্শিত হচ্ছে।' : 'Review the exact appearance of your listing before submission.'}
                </p>
              </div>

              {/* Realistic Preview Card */}
              <div className="border border-stone-200 rounded-3xl overflow-hidden bg-white shadow-sm max-w-xl mx-auto">
                <div className="relative h-56 w-full bg-stone-100">
                  <img
                    src={formValues.images?.[0]?.url || DEFAULT_SAMPLE_PHOTOS[0]}
                    alt="Preview cover"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                    {formValues.property_type.toUpperCase()}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    📷 {formValues.images?.length || 1} ছবি
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      {selectedArea?.name_bn || 'ময়মনসিংহ'}
                    </span>
                    <span className="text-lg font-extrabold text-emerald-800">
                      {formatPrice(formValues.rent_monthly || 0, language)}
                      <span className="text-xs font-normal text-stone-500"> /মাস</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-stone-900">
                    {formValues.title_bn || 'শিরোনাম দিন'}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2">
                    {formValues.description_bn || 'বিস্তারিত বিবরণ...'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-100 text-xs font-semibold text-stone-500">
                    <span>🛏️ {toBengaliNumber(formValues.bedrooms || 0, language)} রুম</span>
                    <span>🚿 {toBengaliNumber(formValues.bathrooms || 0, language)} বাথ</span>
                    <span>📐 {toBengaliNumber(formValues.area_sqft || 0, language)} স্কয়ার ফিট</span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-2xl flex items-center justify-between text-xs font-bold text-stone-700">
                    <span>📞 {formValues.contact_name}: {formValues.contact_phone}</span>
                    <span className="text-emerald-700">✓ ভেরিফাইড পোস্ট</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 9: SUBMIT FOR MODERATION ================= */}
          {currentStep === 9 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 mb-1">
                  {language === 'bn' ? '৯. মডারেশন ও সাবমিশন নীতিমালা' : '9. Moderation Review & Final Submission'}
                </h2>
                <p className="text-xs text-stone-500">
                  {language === 'bn'
                    ? 'নিরাপদ ও নির্ভরযোগ্য টু-লেট সেবার জন্য প্রতিটি নতুন বিজ্ঞাপন মডারেশন টিমের পর্যালোচনার পর লাইভ করা হয়।'
                    : 'To protect tenants from fake ads, all listings enter Pending status for moderation before going live.'}
                </p>
              </div>

              {/* Security Banner */}
              <div className="p-5 bg-amber-50 rounded-3xl border border-amber-200 text-amber-900 space-y-3">
                <div className="flex items-center gap-2 font-extrabold text-sm">
                  <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                  <span>{language === 'bn' ? 'বিজ্ঞাপন মডারেশন নীতি (Pending Review)' : 'Moderation Policy'}</span>
                </div>
                <ul className="text-xs space-y-1.5 list-disc list-inside text-amber-800/90 font-medium">
                  <li>
                    {language === 'bn'
                      ? 'বিজ্ঞাপন সাবমিটের পর এটি স্বয়ংক্রিয়ভাবে "Pending" স্ট্যাটাসে থাকবে।'
                      : 'Newly submitted listings enter Pending status for moderation review.'}
                  </li>
                  <li>
                    {language === 'bn'
                      ? 'ভুল বা অসত্য তথ্য থাকলে বিজ্ঞাপন বাতিল হতে পারে।'
                      : 'Listings with incorrect contact info or misleading photos will be rejected.'}
                  </li>
                  <li>
                    {language === 'bn'
                      ? 'কোনো ব্যবহারকারী সরাসরি "Approved" স্ট্যাটাস সেট করতে পারে না।'
                      : 'Users cannot directly approve listings without verification.'}
                  </li>
                </ul>
              </div>

              {/* Terms Agreement Checkbox */}
              <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('agree_to_terms')}
                  className="h-4 w-4 text-emerald-600 rounded"
                />
                <span className="text-xs font-bold text-stone-800">
                  {language === 'bn'
                    ? 'আমি টু-লেট ময়মনসিংহের সকল শর্তাবলী মেনে নিশ্চিত করছি যে প্রদত্ত তথ্যসমূহ সঠিক।'
                    : 'I agree to the terms and certify that the listing details are accurate.'}
                </span>
              </label>

              {/* Final Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-100">
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit((data: any) => onFinalSubmit(data as ListingFormValues, 'draft'))}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl text-stone-700 font-bold border-stone-300"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span>{language === 'bn' ? 'খসড়া (Draft) হিসেবে রাখুন' : 'Save as Draft'}</span>
                </Button>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit((data: any) => onFinalSubmit(data as ListingFormValues, 'pending'))}
                  className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'bn' ? 'সাবমিট হচ্ছে...' : 'Submitting...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>{language === 'bn' ? 'মডারেশনে জমা দিন' : 'Submit for Moderation'}</span>
                    </div>
                  )}
                </Button>
              </div>

            </div>
          )}

          {/* Stepper Navigation Footer */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 1 || isSubmitting}
              onClick={handlePrevStep}
              className="h-10 px-4 rounded-xl border-stone-200 font-bold text-xs"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span>{language === 'bn' ? 'পূর্ববর্তী ধাপ' : 'Previous'}</span>
            </Button>

            {currentStep < 9 && (
              <Button
                type="button"
                onClick={handleNextStep}
                className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                <span>{language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};
