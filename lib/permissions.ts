export type Role = "CEO" | "Admin" | "Manager" | "Employee";

const permissions: Record<Role, string[]> = {
  CEO: ["analytics:company", "reports:roi", "forecasting:read", "security:summary", "employees:read"],
  Admin: ["*"],
  Manager: ["analytics:team", "employees:team", "reports:team", "usage:create"],
  Employee: ["analytics:self", "usage:self", "profile:read"]
};

export function can(role: Role | undefined, permission: string) {
  if (!role) return false;
  return permissions[role]?.includes("*") || permissions[role]?.includes(permission);
}

export function scopeForRole(role: Role, userId?: string, departmentId?: string) {
  if (role === "CEO" || role === "Admin") return { scope: "company" as const };
  if (role === "Manager") return { scope: "department" as const, departmentId };
  return { scope: "self" as const, userId };
}
