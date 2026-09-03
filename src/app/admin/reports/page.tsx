"use client";

import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { AdminLayout, AdminReportsView } from "@/src/components/admin";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";

export default function AdminReportsPage() {
  const navigate = useLegacyNavigate();

  return (
    <ProtectedRoute
      onNavigate={navigate}
      allowedRoles={["admin"]}
      requiredViewName="admin/reports"
    >
      <AdminLayout currentAdminTab="reports" onNavigate={navigate}>
        <AdminReportsView onNavigate={navigate} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
