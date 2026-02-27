"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axiosInstance from "@/services/axios";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await axiosInstance.get("/chats");
      const chats = response.data?.chats || [];
      const total = chats.reduce((sum: number, chat: any) => {
        return sum + (chat.myUnreadCount || 0);
      }, 0);
      setUnreadCount(total);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const navigation = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: "📊", 
      roles: ["admin", "top_manager", "inventory_manager", "employee_manager", "blog_manager", "order_manager", "customer_manager", "report_manager", "staff"] 
    },
    { 
      name: "Products", 
      href: "/products", 
      icon: "📦", 
      roles: ["admin", "top_manager", "inventory_manager"] 
    },
    { 
      name: "Stocks", 
      href: "/stocks", 
      icon: "📈", 
      roles: ["admin", "top_manager", "inventory_manager", "staff"] 
    },
    { 
      name: "Orders", 
      href: "/orders", 
      icon: "🛒", 
      roles: ["admin", "top_manager", "order_manager", "staff"] 
    },
    { 
      name: "Refund", 
      href: "/refund", 
      icon: "💰", 
      roles: ["admin", "top_manager", "order_manager"] 
    },
    { 
      name: "Customers", 
      href: "/customers", 
      icon: "👤", 
      roles: ["admin", "top_manager", "customer_manager"] 
    },
    { 
      name: "Reviews", 
      href: "/reviews", 
      icon: "⭐", 
      roles: ["admin", "top_manager", "customer_manager"] 
    },
    { 
      name: "Complaints", 
      href: "/complaints", 
      icon: "⚠️", 
      roles: ["admin", "top_manager", "customer_manager", "staff"] 
    },
    { 
      name: "Attendance", 
      href: "/attendance", 
      icon: "📅", 
      roles: ["admin", "top_manager", "employee_manager", "inventory_manager", "employee_manager", "blog_manager", "order_manager", "customer_manager", "report_manager", "staff"] 
    },
    { 
      name: "Reports", 
      href: "/reports", 
      icon: "📋", 
      roles: ["admin", "top_manager", "report_manager"] 
    },
    { 
      name: "Users", 
      href: "/users", 
      icon: "👥", 
      roles: ["admin", "top_manager"] 
    },
    { 
      name: "Teams", 
      href: "/teams", 
      icon: "👨‍👩‍👧‍👦", 
      roles: ["admin", "top_manager"] 
    },
    { 
      name: "About Us", 
      href: "/about-us", 
      icon: "ℹ️", 
      roles: ["admin"] 
    },
    { 
      name: "Blogs", 
      href: "/blogs", 
      icon: "📝", 
      roles: ["admin", "top_manager", "blog_manager"] 
    },
    { 
      name: "Employees", 
      href: "/employees", 
      icon: "👔", 
      roles: ["admin", "top_manager", "employee_manager"] 
    },
  ];

  const filteredNav = navigation.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <div
      className={`bg-linear-to-r from-gray-700 via-gray-500 to-gray-700 text-white flex flex-col transition-all duration-300 ${
        isOpen ? "w-50" : "w-15"
      } h-full min-h-0 overflow-hidden shadow-xl`}
    >
      <div className={`p-4 border-b border-gray-700 ${isOpen ? "" : "flex justify-center"}`}>
        {isOpen ? (
          <div>
            <h1 className="text-xl font-bold text-white">Mini ERP</h1>
            <p className="text-sm text-gray-300 mt-1">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400">
              ({user?.role})
            </p>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-500 [&::-webkit-scrollbar-thumb]:bg-blue-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-blue-600">
        {filteredNav.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`${
              pathname === item.href
                ? "bg-blue-600 text-white shadow-lg"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            } group flex items-center ${
              isOpen ? "px-3" : "px-0 justify-center"
            } py-2.5 text-sm font-medium rounded-lg transition-all`}
            title={!isOpen ? item.name : undefined}
          >
            <span className={`text-xl ${isOpen ? "mr-3" : ""}`}>{item.icon}</span>
            {isOpen && <span>{item.name}</span>}
          </Link>
        ))}

      {/* Chat Button */}
      <div className="px-2 pb-4 border-t border-gray-700 pt-4">
        <Link
          href="/messages"
          className={`w-full ${
            pathname === "/messages"
              ? "bg-blue-600 text-white shadow-lg"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          } group flex items-center ${
            isOpen ? "px-3" : "px-0 justify-center"
          } py-2.5 text-sm font-medium rounded-lg transition-all relative`}
          title={!isOpen ? "Messages" : undefined}
        >
          <span className={`text-xl ${isOpen ? "mr-3" : ""}`}>💬</span>
          {isOpen && <span>Messages</span>}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-linear-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
      </nav>
    </div>
  );
}

