"use client";

import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { AdminLayout, AdminAreasView } from "@/src/components/admin";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";

export default function AdminAreasPage() {
  const navigate = useLegacyNavigate();

  return (
    <ProtectedRoute
      onNavigate={navigate}
      allowedRoles={["admin"]}
      requiredViewName="admin/areas"
    >
      <AdminLayout currentAdminTab="areas" onNavigate={navigate}>
        <AdminAreasView onNavigate={navigate} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
