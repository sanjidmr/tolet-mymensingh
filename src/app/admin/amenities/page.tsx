"use client";

import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { AdminLayout, AdminAmenitiesView } from "@/src/components/admin";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";

export default function AdminAmenitiesPage() {
  const navigate = useLegacyNavigate();

  return (
    <ProtectedRoute
      onNavigate={navigate}
      allowedRoles={["admin"]}
      requiredViewName="admin/amenities"
    >
      <AdminLayout currentAdminTab="amenities" onNavigate={navigate}>
        <AdminAmenitiesView onNavigate={navigate} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
