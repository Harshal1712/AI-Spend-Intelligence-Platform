export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEnterpriseDashboard } from "@/lib/postgres-repository";
import { checkBudgetThresholds, fireBudgetAlerts } from "@/lib/budget-alerts";
import type { AnalyticsScope } from "@/lib/postgres-repository";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);

  // Build role-based scope
  const scope: AnalyticsScope = {};
  if (session?.user) {
    const role = session.user.role;
    const userId = session.user.id;
    const departmentId = session.user.departmentId;

    if (role === "Employee") {
      scope.role = "Employee";
      scope.userId = userId;
    } else if (role === "Manager") {
      scope.role = "Manager";
      scope.departmentId = departmentId;
    }
    // CEO and Admin get full company scope (no filter)
  }

  const data = await getEnterpriseDashboard(scope);

  // Run budget threshold check and fire alerts if needed
  if (data.departments && data.departments.length > 0) {
    const budgetAlerts = checkBudgetThresholds(data.departments);
    if (budgetAlerts.length > 0) {
      // Fire alerts asynchronously — don't await so we don't slow down response
      fireBudgetAlerts(budgetAlerts).catch(console.error);
      // Include budget alerts in response so UI can show banners
      return NextResponse.json({ ...data, budgetAlerts });
    }
  }

  return NextResponse.json(data);
}
