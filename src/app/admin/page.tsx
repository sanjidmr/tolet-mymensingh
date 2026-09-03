"use client";

import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import {
  AdminLayout,
  AdminOverviewView,
} from "@/src/components/admin";
import { useLegacyNavigate } from "@/src/lib/useLegacyNavigate";

export default function AdminOverviewPage() {
  const navigate = useLegacyNavigate();

  return (
    <ProtectedRoute
      onNavigate={navigate}
      allowedRoles={["admin"]}
      requiredViewName="admin"
    >
      <AdminLayout currentAdminTab="overview" onNavigate={navigate}>
        <AdminOverviewView onNavigate={navigate} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
