"use client";

import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import {
  AdminLayout,
  AdminListingsView,
} from "@/src/components/admin";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";

export default function AdminListingsPage() {
  const navigate = useLegacyNavigate();

  return (
    <ProtectedRoute
      onNavigate={navigate}
      allowedRoles={["admin"]}
      requiredViewName="admin/listings"
    >
      <AdminLayout currentAdminTab="listings" onNavigate={navigate}>
        <AdminListingsView onNavigate={navigate} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
