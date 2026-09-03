"use client";

import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { AdminLayout, AdminUsersView } from "@/src/components/admin";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";

export default function AdminUsersPage() {
  const navigate = useLegacyNavigate();

  return (
    <ProtectedRoute
      onNavigate={navigate}
      allowedRoles={["admin"]}
      requiredViewName="admin/users"
    >
      <AdminLayout currentAdminTab="users" onNavigate={navigate}>
        <AdminUsersView onNavigate={navigate} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
