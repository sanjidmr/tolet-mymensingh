/**
 * Navigation vocabulary bridge between the legacy state-machine router
 * (view strings + params) and Next.js App Router paths.
 *
 * Existing components call `onNavigate(view, params)` where `view` is a
 * string like 'tolet/detail', 'dashboard', 'admin/users', etc. This module
 * maps those view strings to real Next.js route URLs.
 */

export function viewToPathname(view: string, params?: any): string {
  if (!view || view === 'home' || view === '/') {
    return '/';
  }

  if (view === 'tolet' || view === 'mess' || view === 'hostel' || view === 'sublet') {
    return `/${view}`;
  }

  if (view === 'tolet/detail') return `/tolet/${decodeSlug(params?.slug)}`;
  if (view === 'mess/detail') return `/mess/${decodeSlug(params?.slug)}`;
  if (view === 'hostel/detail') return `/hostel/${decodeSlug(params?.slug)}`;
  if (view === 'sublet/detail') return `/sublet/${decodeSlug(params?.slug)}`;

  if (view === 'dashboard/listings/edit') {
    return `/dashboard/listings/${params?.id}/edit`;
  }

  if (view.startsWith('admin/') || view === 'admin') {
    return `/${view}`;
  }

  return `/${view}`;
}

function decodeSlug(slug?: string): string {
  if (!slug) return '';
  try {
    return encodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/**
 * Derive the legacy view string + params from a Next.js route.
 */
export function pathnameToView(pathname: string): { view: string; params: any } {
  const path = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  const params: any = {};

  if (!path || path === 'home') return { view: 'home', params };

  const toletDetail = path.match(/^tolet\/([^/]+)$/);
  if (toletDetail) return { view: 'tolet/detail', params: { slug: decodeURIComponent(toletDetail[1]) } };

  const messDetail = path.match(/^mess\/([^/]+)$/);
  if (messDetail) return { view: 'mess/detail', params: { slug: decodeURIComponent(messDetail[1]) } };

  const hostelDetail = path.match(/^hostel\/([^/]+)$/);
  if (hostelDetail) return { view: 'hostel/detail', params: { slug: decodeURIComponent(hostelDetail[1]) } };

  const subletDetail = path.match(/^sublet\/([^/]+)$/);
  if (subletDetail) return { view: 'sublet/detail', params: { slug: decodeURIComponent(subletDetail[1]) } };

  const edit = path.match(/^dashboard\/listings\/([^/]+)\/edit$/);
  if (edit) return { view: 'dashboard/listings/edit', params: { id: edit[1] } };

  return { view: path, params };
}
