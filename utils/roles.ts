export const ROLES = {
  ADMIN: "admin",
  TOP_MANAGER: "top_manager",
  INVENTORY_MANAGER: "inventory_manager",
  EMPLOYEE_MANAGER: "employee_manager",
  BLOG_MANAGER: "blog_manager",
  ORDER_MANAGER: "order_manager",
  CUSTOMER_MANAGER: "customer_manager",
  REPORT_MANAGER: "report_manager",
  STAFF: "staff",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_OPTIONS = [
  { value: "staff", label: "Staff" },
  { value: "inventory_manager", label: "Inventory Manager" },
  { value: "employee_manager", label: "Employee Manager" },
  { value: "blog_manager", label: "Blog Manager" },
  { value: "order_manager", label: "Order Manager" },
  { value: "customer_manager", label: "Customer Manager" },
  { value: "report_manager", label: "Report Manager" },
  { value: "top_manager", label: "Top Manager" },
  { value: "admin", label: "Admin" },
];

// Helper functions to check role permissions
export const hasInventoryAccess = (role?: string) => 
  role === "admin" || role === "top_manager" || role === "inventory_manager";

export const hasEmployeeAccess = (role?: string) => 
  role === "admin" || role === "top_manager" || role === "employee_manager";

export const hasBlogAccess = (role?: string) => 
  role === "admin" || role === "top_manager" || role === "blog_manager";

export const hasOrderAccess = (role?: string) => 
  role === "admin" || role === "top_manager" || role === "order_manager";

export const hasCustomerAccess = (role?: string) => 
  role === "admin" || role === "top_manager" || role === "customer_manager";

export const hasReportAccess = (role?: string) => 
  role === "admin" || role === "top_manager" || role === "report_manager";
