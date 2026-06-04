import { sendAlert } from "./webhooks";

export type BudgetAlert = {
  department: string;
  spent: number;
  budget: number;
  percentage: number;
  level: "warning" | "critical";
};

export function checkBudgetThresholds(
  departments: { name: string; value: number; budget?: number }[]
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  for (const dept of departments) {
    const budget = dept.budget ?? 0;
    if (budget <= 0) continue;

    const percentage = (dept.value / budget) * 100;

    if (percentage >= 95) {
      alerts.push({
        department: dept.name,
        spent: dept.value,
        budget,
        percentage,
        level: "critical"
      });
    } else if (percentage >= 80) {
      alerts.push({
        department: dept.name,
        spent: dept.value,
        budget,
        percentage,
        level: "warning"
      });
    }
  }

  return alerts;
}

export async function fireBudgetAlerts(alerts: BudgetAlert[]): Promise<void> {
  await Promise.all(
    alerts.map((alert) => {
      const severity = alert.level === "critical" ? "Critical" : "High";
      const title = `Budget Alert: ${alert.department}`;
      const body = `${alert.department} has used ${alert.percentage.toFixed(0)}% of its monthly AI budget ($${alert.spent.toLocaleString()} / $${alert.budget.toLocaleString()}).`;

      return sendAlert(title, body, severity);
    })
  );
}
