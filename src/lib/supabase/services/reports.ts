import { getSupabaseBrowserClient } from '../client';
import { ListingReport, ReportReason, ReportStatus } from '../../../types';
import { Database } from '../../../types/database';

export interface SubmitReportParams {
  listing_id: string;
  reporter_id?: string;
  reason: ReportReason;
  comment?: string;
}

const LOCAL_REPORTS_KEY = 'tolet_submitted_reports';

/**
 * Checks local storage and Supabase to see if a listing has already been reported by this user or browser.
 */
export async function checkUserReportedListing(
  listingId: string,
  reporterId?: string
): Promise<{ hasReported: boolean; reason?: ReportReason; submittedAt?: string }> {
  // 1. Check local storage cache
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[listingId]) {
        return {
          hasReported: true,
          reason: parsed[listingId].reason,
          submittedAt: parsed[listingId].submittedAt,
        };
      }
    }
  } catch {
    // Ignore local storage errors
  }

  // 2. Check Supabase if authenticated user is provided
  if (reporterId) {
    const client = getSupabaseBrowserClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('listing_reports')
          .select('id, reason, created_at, status')
          .eq('listing_id', listingId)
          .eq('reporter_id', reporterId)
          .in('status', ['pending', 'reviewed'])
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return {
            hasReported: true,
            reason: data.reason as ReportReason,
            submittedAt: data.created_at,
          };
        }
      } catch (err) {
        console.warn('Error checking existing report in Supabase:', err);
      }
    }
  }

  return { hasReported: false };
}

/**
 * Submits a community moderation report against a listing.
 * RLS allows both authenticated users and anonymous visitors to submit reports.
 * Prevents obvious duplicate reports from the same user or device.
 */
export async function submitListingReport(
  params: SubmitReportParams
): Promise<{ success: boolean; isDuplicate?: boolean; error?: string }> {
  // Check for duplicate report
  const duplicateCheck = await checkUserReportedListing(params.listing_id, params.reporter_id);
  if (duplicateCheck.hasReported) {
    return {
      success: false,
      isDuplicate: true,
      error: 'এই বিজ্ঞাপনের জন্য আপনি ইতোমধ্যে একটি রিপোর্ট জমা দিয়েছেন। আমাদের মডারেশন টিম এটি যাচাই করছে।',
    };
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    // Graceful simulation when offline or pre-configured
    recordLocalReport(params.listing_id, params.reason);
    return { success: true };
  }

  try {
    const { error } = await client.from('listing_reports').insert({
      listing_id: params.listing_id,
      reporter_id: params.reporter_id || null,
      reason: params.reason,
      comment: params.comment ? params.comment.trim() : null,
      status: 'pending' as ReportStatus,
    });

    if (error) {
      // Check if error is unique violation
      if (error.code === '23505') {
        recordLocalReport(params.listing_id, params.reason);
        return {
          success: false,
          isDuplicate: true,
          error: 'আপনি ইতোমধ্যেই এই লিস্টিংটি রিপোর্ট করেছেন।',
        };
      }
      return { success: false, error: error.message };
    }

    recordLocalReport(params.listing_id, params.reason);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error submitting report' };
  }
}

function recordLocalReport(listingId: string, reason: ReportReason) {
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[listingId] = {
      reason,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(parsed));
  } catch (e) {
    console.error('Error saving local report cache:', e);
  }
}

/**
 * Fetches reports for administrative moderation (Admin RLS policy applies)
 */
export async function fetchListingReports(statusFilter?: ReportStatus): Promise<ListingReport[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];

  try {
    let query = client
      .from('listing_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error || !data) {
      console.error('Error fetching listing reports:', error);
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      listing_id: item.listing_id,
      reporter_id: item.reporter_id || undefined,
      reason: item.reason as ReportReason,
      comment: item.comment || undefined,
      status: item.status as ReportStatus,
      created_at: item.created_at,
    }));
  } catch (err) {
    console.error('Error in fetchListingReports:', err);
    return [];
  }
}

/**
 * Admin action to resolve, dismiss, or review a listing report
 */
export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  moderatorNotes?: string,
  reviewerId?: string
): Promise<boolean> {
  const client = getSupabaseBrowserClient();
  if (!client) return false;

  const { error } = await client
    .from('listing_reports')
    .update({
      status,
      moderator_notes: moderatorNotes || null,
      reviewed_by: reviewerId || null,
    })
    .eq('id', reportId);

  if (error) {
    console.error('Error updating report status:', error);
    return false;
  }
  return true;
}
