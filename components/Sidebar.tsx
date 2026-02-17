"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const navigation = [
    { name: "Dashboard", href: "/protected/dashboard", icon: "📊", roles: ["admin", "manager", "staff"] },
    { name: "Products", href: "/protected/products", icon: "📦", roles: ["admin", "manager"] },
    { name: "Stocks", href: "/protected/stocks", icon: "📈", roles: ["admin", "manager", "staff"] },
    { name: "Orders", href: "/protected/orders", icon: "🛒", roles: ["admin", "manager", "staff"] },
    { name: "Customers", href: "/protected/customers", icon: "👤", roles: ["admin", "manager"] },
    { name: "Complaints", href: "/protected/complaints", icon: "⚠️", roles: ["admin", "staff"] },
    { name: "Attendance", href: "/protected/attendance", icon: "📅", roles: ["admin", "manager", "staff"] },
    { name: "Reports", href: "/protected/reports", icon: "📋", roles: ["admin", "manager"] },
    { name: "Users", href: "/protected/users", icon: "👥", roles: ["admin", "manager"] },
    { name: "About Us", href: "/protected/about-us", icon: "ℹ️", roles: ["admin"] },
    { name: "Blogs", href: "/protected/blogs", icon: "📝", roles: ["admin"] },
    { name: "Employees", href: "/protected/employees", icon: "👔", roles: ["admin"] },
  ];

  const filteredNav = navigation.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <div
      className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className={`p-4 border-b border-gray-800 ${isOpen ? "" : "flex justify-center"}`}>
        {isOpen ? (
          <div>
            <h1 className="text-xl font-bold">Mini ERP</h1>
            <p className="text-sm text-gray-400 mt-1">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500">
              ({user?.role})
            </p>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`${
              pathname === item.href
                ? "bg-gray-800 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            } group flex items-center ${
              isOpen ? "px-3" : "px-0 justify-center"
            } py-2 text-sm font-medium rounded-md transition-colors`}
            title={!isOpen ? item.name : undefined}
          >
            <span className={`text-2xl ${isOpen ? "mr-3" : ""}`}>{item.icon}</span>
            {isOpen && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}

