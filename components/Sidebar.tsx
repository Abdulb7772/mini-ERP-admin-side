"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ChatModal from "./ChatModal";
import axiosInstance from "@/services/axios";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const [isChatOpen, setIsChatOpen] = useState(false);
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
      href: "/protected/dashboard", 
      icon: "📊", 
      roles: ["admin", "top_manager", "inventory_manager", "employee_manager", "blog_manager", "order_manager", "customer_manager", "report_manager", "staff"] 
    },
    { 
      name: "Products", 
      href: "/protected/products", 
      icon: "📦", 
      roles: ["admin", "top_manager", "inventory_manager"] 
    },
    { 
      name: "Stocks", 
      href: "/protected/stocks", 
      icon: "📈", 
      roles: ["admin", "top_manager", "inventory_manager", "staff"] 
    },
    { 
      name: "Orders", 
      href: "/protected/orders", 
      icon: "🛒", 
      roles: ["admin", "top_manager", "order_manager", "staff"] 
    },
    { 
      name: "Refund", 
      href: "/protected/refund", 
      icon: "💰", 
      roles: ["admin", "top_manager", "order_manager"] 
    },
    { 
      name: "Customers", 
      href: "/protected/customers", 
      icon: "👤", 
      roles: ["admin", "top_manager", "customer_manager"] 
    },
    { 
      name: "Reviews", 
      href: "/protected/reviews", 
      icon: "⭐", 
      roles: ["admin", "top_manager", "customer_manager"] 
    },
    { 
      name: "Complaints", 
      href: "/protected/complaints", 
      icon: "⚠️", 
      roles: ["admin", "top_manager", "customer_manager", "staff"] 
    },
    { 
      name: "Attendance", 
      href: "/protected/attendance", 
      icon: "📅", 
      roles: ["admin", "top_manager", "employee_manager", "inventory_manager", "employee_manager", "blog_manager", "order_manager", "customer_manager", "report_manager", "staff"] 
    },
    { 
      name: "Reports", 
      href: "/protected/reports", 
      icon: "📋", 
      roles: ["admin", "top_manager", "report_manager"] 
    },
    { 
      name: "Users", 
      href: "/protected/users", 
      icon: "👥", 
      roles: ["admin", "top_manager"] 
    },
    { 
      name: "Teams", 
      href: "/protected/teams", 
      icon: "👨‍👩‍👧‍👦", 
      roles: ["admin", "top_manager"] 
    },
    { 
      name: "About Us", 
      href: "/protected/about-us", 
      icon: "ℹ️", 
      roles: ["admin"] 
    },
    { 
      name: "Blogs", 
      href: "/protected/blogs", 
      icon: "📝", 
      roles: ["admin", "top_manager", "blog_manager"] 
    },
    { 
      name: "Employees", 
      href: "/protected/employees", 
      icon: "👔", 
      roles: ["admin", "top_manager", "employee_manager"] 
    },
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

      {/* Chat Button */}
      <div className="px-2 pb-4 border-t border-gray-800 pt-4">
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-full text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative"
          title={!isOpen ? "Chat" : undefined}
        >
          <span className={`text-2xl ${isOpen ? "mr-3" : ""}`}>💬</span>
          {isOpen && <span>Chat</span>}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-linear-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => {
          setIsChatOpen(false);
          fetchUnreadCount();
        }} 
      />
      </nav>
    </div>
  );
}

