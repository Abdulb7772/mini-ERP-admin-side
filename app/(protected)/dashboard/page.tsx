"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { dashboardAPI, productAPI, notificationAPI } from "@/services/apiService";
import { CardSkeleton, TableSkeleton } from "@/components/Skeleton";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  lowStock: any[];
  recentOrders: any[];
}

interface Notification {
  _id: string;
  type: "complaint_filed" | "complaint_replied" | "order_status" | "general";
  title: string;
  message: string;
  relatedId?: string;
  relatedModel?: string;
  isRead: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  useAuth(["admin", "inventory_manager", "employee_manager", "blog_manager", "order_manager", "customer_manager", "report_manager", "staff"]);
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log("🔍 [Dashboard] Starting data fetch...");
      console.log("🔍 [Dashboard] API URL:", process.env.NEXT_PUBLIC_API_URL);
      
      setLoading(true);
      setError(null);
      
      console.log("🔍 [Dashboard] Calling dashboardAPI.getStats()...");
      const dashboardRes = await dashboardAPI.getStats();
      console.log("✅ [Dashboard] Stats response:", dashboardRes);
      
      console.log("🔍 [Dashboard] Calling productAPI.getProducts()...");
      const productsRes = await productAPI.getProducts();
      console.log("✅ [Dashboard] Products response:", productsRes);

      console.log("🔍 [Dashboard] Calling notificationAPI.getNotifications()...");
      const notificationsRes = await notificationAPI.getNotifications();
      console.log("✅ [Dashboard] Notifications response:", notificationsRes);

      setStats(dashboardRes.data.data);
      setProducts(productsRes.data.data);
      setNotifications(notificationsRes.data.data?.slice(0, 5) || []);
      
      console.log("✅ [Dashboard] Data loaded successfully");
      console.log("📊 [Dashboard] Stats:", dashboardRes.data.data);
      console.log("📦 [Dashboard] Products count:", productsRes.data.data?.length);
    } catch (error: any) {
      console.error("❌ [Dashboard] Error fetching dashboard data:", error);
      console.error("❌ [Dashboard] Error response:", error.response);
      console.error("❌ [Dashboard] Error message:", error.message);
      console.error("❌ [Dashboard] Error stack:", error.stack);
      setError(error.response?.data?.message || "Failed to load dashboard data. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-72 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <TableSkeleton rows={5} columns={3} />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <TableSkeleton rows={5} columns={4} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to Mini ERP Dashboard</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getFullName = () => {
    return session?.user?.name || "User";
  };

  const mainTiles = [
    {
      title: "Total Products",
      value: products.length || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgColor: "bg-gradient-to-br from-blue-700 via-blue-400 to-blue-800",
      iconBg: "bg-white/20",
      change: "+12%",
    },
    {
      title: "Low Stock Items",
      value: products.filter((p: any) => p.stock >= 3 && p.stock <= 5).length || 0,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-4.41 0-8-3.59-8-8V8.5l8-4.5 8 4.5V12c0 4.41-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      ),
      bgColor: "bg-gradient-to-br from-orange-700 via-orange-400 to-orange-700",
      iconBg: "bg-white/20",
      change: "+8%",
    },
    {
      title: "Out of Stock",
      value: products.filter((p: any) => p.stock === 0).length || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-gradient-to-br from-red-700 via-red-400 to-red-800",
      iconBg: "bg-white/20",
      change: "-3%",
    },
    {
      title: "Total Sales",
      value: `$${stats?.totalSales.toFixed(2) || "24,750.00"}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
        </svg>
      ),
      bgColor: "bg-gradient-to-br from-green-700 via-green-400 to-green-800",
      iconBg: "bg-white/20",
      change: "+21%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {getFullName()} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening in your <span className="font-semibold italic">store</span> today.
        </p>
      </div>

      {/* Main Stats Grid - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainTiles.map((tile, index) => (
          <div
            key={index}
            className={`${tile.bgColor} rounded-lg shadow-md p-5 text-white relative overflow-hidden hover:shadow-lg transition-shadow duration-200 h-32`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-white/90">{tile.title}</p>
              <div className={`${tile.iconBg} rounded-md p-2`}>
                {tile.icon}
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold mb-2">{tile.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Recent Notifications
            </h2>
            <a href="/orders" className="text-sm text-blue-600 hover:text-blue-700">
              Last 5
            </a>
          </div>
          
          <div className="space-y-3">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 5).map((order: any, index: number) => {
                const isOdd = index % 2 === 1;
                return (
                  <div
                    key={order._id}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      isOdd ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'
                    } transition-colors`}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      isOdd ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      {isOdd ? (
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {isOdd ? 'New Complaint Filed' : 'New Order Placed'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {isOdd 
                          ? `A new complaint has been filed. Order ID: ${order.orderId || order._id?.slice(-12)} latest 01:28:02, 07/08/2016`
                          : `New order: ${order.orderId || `#${order._id?.slice(-12)}`} has been placed via ${order.paymentStatus || "card"} for ${order.totalAmount ? `$${order.totalAmount.toFixed(2)}` : "$0.00"}`
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleString('en-US', { 
                          month: '2-digit', 
                          day: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>
                    
                    <button className="shrink-0 text-blue-600 hover:text-blue-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="font-medium">No recent notifications</p>
                <p className="text-sm mt-1">New notifications will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Status */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Low Stock Status
            </h2>
            <span className="text-sm text-gray-500">Items to restock</span>
          </div>
          
          {/* Stock Status Message */}
          <div className="text-center py-4 mb-6">
            <p className="text-gray-600 text-sm">
              {products.filter((p: any) => p.stock <= 2).length === 0 
                ? "All products are well stocked!" 
                : "Some items need restocking"}
            </p>
          </div>

          {/* Inventory Status Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Inventory Status</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {products.length > 0 ? (
                products.map((product: any) => {
                  const stock = product.stock || 0;
                  const maxStock = 50; // Maximum stock threshold for 100% bar
                  const percentage = Math.min((stock / maxStock) * 100, 100);
                  
                  // Color based on stock level
                  let barColor = 'bg-red-500';
                  if (stock >= 10) barColor = 'bg-green-500';
                  else if (stock >= 6) barColor = 'bg-yellow-500';
                  else if (stock >= 3) barColor = 'bg-orange-500';
                  
                  return (
                    <div key={product._id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700 truncate flex-1">
                          {product.name}
                        </span>
                        <span className="text-gray-600 ml-2 shrink-0">
                          {stock} {stock === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <div className="relative h-6 bg-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className={`absolute inset-y-0 left-0 ${barColor} transition-all duration-300 rounded-lg flex items-center justify-end pr-2`}
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 15 && (
                            <span className="text-white text-xs font-semibold">
                              {Math.round(percentage)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No products available</p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">High Stock (10+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600">Medium (6-9)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-600">Low (3-5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Critical (0-2)</span>
              </div>
            </div>
          </div>

          {/* Action Required Banner */}
          {products.filter((p: any) => p.stock <= 2).length > 0 && (
            <div className="space-y-4">
              <div className="bg-red-500 rounded-lg p-4 flex items-center gap-3">
                <div className="shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">ACTION REQUIRED:</p>
                  <p className="text-white text-xs mt-0.5">Some items low stock. Restock now.</p>
                </div>
              </div>

              {/* Low Stock Items List */}
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  Low Stock Items
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {products
                    .filter((p: any) => p.stock <= 2)
                    .sort((a: any, b: any) => a.stock - b.stock)
                    .map((product: any) => (
                      <div 
                        key={product._id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            SKU: {product.sku || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            product.stock === 0 
                              ? 'bg-red-100 text-red-700' 
                              : product.stock <= 2 
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {product.stock === 0 ? 'OUT OF STOCK' : `${product.stock} left`}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
