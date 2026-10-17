"use client";

import { useWorkspace } from "@/lib/workspace";
import { TenantDashboard } from "@/components/dashboard/tenant-dashboard";
import { OemDashboard } from "@/components/dashboard/oem-dashboard";

// One route, two role-shaped products: the tenant gets a calm self-service
// home, the OEM partner gets the cross-tenant consulting cockpit.
export default function DashboardPage() {
  const { isOem } = useWorkspace();
  return isOem ? <OemDashboard /> : <TenantDashboard />;
}
