"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { dashboardAPI, orderAPI, productAPI } from "@/services/apiService";
import { CardSkeleton, ChartSkeleton } from "@/components/Skeleton";
import toast from "react-hot-toast";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ReportsPage() {
  useAuth(["admin", "manager"]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        dashboardAPI.getStats(),
        orderAPI.getOrders(),
        productAPI.getProducts(),
      ]);

      setStats(statsRes.data.data);
      setOrders(ordersRes.data.data);
      setProducts(productsRes.data.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate monthly sales for current year (all 12 months)
  const calculateMonthlySales = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11
    
    // Show all 12 months, but use null for future months
    const salesByMonth = new Array(12).fill(null);

    // Initialize past and current months with 0
    for (let i = 0; i <= currentMonth; i++) {
      salesByMonth[i] = 0;
    }

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      if (orderDate.getFullYear() === currentYear) {
        const monthIndex = orderDate.getMonth();
        // Only add data for months that have occurred (including current month)
        if (monthIndex <= currentMonth) {
          salesByMonth[monthIndex] += order.totalAmount || 0;
        }
      }
    });

    return { labels: monthNames, data: salesByMonth };
  };

  const monthlySales = calculateMonthlySales();

  // Sales Over Time Chart Data
  const salesChartData = {
    labels: monthlySales.labels,
    datasets: [
      {
        label: "Monthly Sales ($)",
        data: monthlySales.data,
        borderColor: "purple",
        backgroundColor: "lavender",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Orders Status Chart Data
  const orderStatusData = {
    labels: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    datasets: [
      {
        label: "Orders",
        data: [
          orders.filter((o) => o.status === "pending").length,
          orders.filter((o) => o.status === "processing").length,
          orders.filter((o) => o.status === "shipped").length,
          orders.filter((o) => o.status === "delivered").length,
          orders.filter((o) => o.status === "cancelled").length,
        ],
        backgroundColor: [
          "gold",
          "blue",
          "purple",
          "green",
          "red",
        ],
        borderColor: [
          "orange",
          "darkblue",
          "darkviolet",
          "darkgreen",
          "darkred",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Top Products Chart Data - sorted by stock
  const topProducts = [...products]
    .sort((a, b) => (b.stock || 0) - (a.stock || 0))
    .slice(0, 5);
  
  const topProductsData = {
    labels: topProducts.map((p) => p.name || "Unnamed Product"),
    datasets: [
      {
        label: "Stock Quantity",
        data: topProducts.map((p) => p.stock || 0),
        backgroundColor: [
          "purple",
          "blueviolet",
          "mediumpurple",
          "mediumorchid",
          "plum",
        ],
        borderColor: [
          "darkviolet",
          "indigo",
          "purple",
          "darkorchid",
          "mediumorchid",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Product Sales Distribution (Doughnut Chart)
  const calculateProductSales = () => {
    if (selectedProduct === "all") {
      // Show sales distribution by product
      const productSales: { [key: string]: { name: string; total: number } } = {};
      
      products.forEach((product) => {
        productSales[product._id] = { name: product.name, total: 0 };
      });

      orders.forEach((order) => {
        order.items?.forEach((item: any) => {
          if (productSales[item.productId]) {
            productSales[item.productId].total += (item.price || 0) * (item.quantity || 0);
          }
        });
      });

      // Filter out products with zero sales
      const productsWithSales = Object.values(productSales).filter((p) => p.total > 0);
      
      // If no sales, show product count instead
      if (productsWithSales.length === 0) {
        const labels = products.map((p) => p.name);
        const data = products.map(() => 1); // Equal distribution just to show products exist
        return { labels, data, noSales: true };
      }

      const labels = productsWithSales.map((p) => p.name);
      const data = productsWithSales.map((p) => p.total);

      return { labels, data, noSales: false };
    } else {
      // Show monthly breakdown for selected product
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      const salesByMonth = new Array(currentMonth + 1).fill(0);

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        if (orderDate.getFullYear() === currentYear) {
          const monthIndex = orderDate.getMonth();
          if (monthIndex <= currentMonth) {
            const hasProduct = order.items?.some((item: any) => item.productId === selectedProduct);
            if (hasProduct) {
              const productItems = order.items.filter((item: any) => item.productId === selectedProduct);
              productItems.forEach((item: any) => {
                salesByMonth[monthIndex] += (item.price || 0) * (item.quantity || 0);
              });
            }
          }
        }
      });

      const labels = monthNames.slice(0, currentMonth + 1);
      const data = salesByMonth;
      
      // Check if all data is zero
      const hasAnySales = data.some((val) => val > 0);
      if (!hasAnySales) {
        // Show equal distribution with black outline when no sales
        return { labels, data: data.map(() => 1), noSales: true };
      }

      return { labels, data, noSales: false };
    }
  };

  const productSalesData = calculateProductSales();
  
  const categoryData = {
    labels: productSalesData.labels,
    datasets: [
      {
        label: productSalesData.noSales ? "No Sales Yet" : "Sales ($)",
        data: productSalesData.data,
        backgroundColor: productSalesData.noSales
          ? Array(productSalesData.labels.length).fill("darkgray")
          : [
              "red",
              "orange",
              "gold",
              "green",
              "blue",
              "purple",
              "hotpink",
              "mediumorchid",
              "skyblue",
              "yellowgreen",
              "coral",
              "plum",
            ],
        borderColor: productSalesData.noSales 
          ? Array(productSalesData.labels.length).fill("black")
          : [
              "darkred",
              "darkorange",
              "orange",
              "darkgreen",
              "darkblue",
              "darkviolet",
              "deeppink",
              "darkorchid",
              "deepskyblue",
              "olivedrab",
              "orangered",
              "mediumorchid",
            ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      x: {
        offset: true,
      },
      y: {
        beginAtZero: false,
      },
    },
  };

  // Calculate real-time performance metrics
  const calculatePerformanceMetrics = () => {
    const totalOrders = orders.length;
    
    // Order Fulfillment Rate: (Delivered orders / Total orders) * 100
    const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
    const fulfillmentRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : "0.0";
    
    // Success Rate: (Delivered + Shipped orders / Total orders) * 100
    const successfulOrders = orders.filter((o) => o.status === "delivered" || o.status === "shipped").length;
    const successRate = totalOrders > 0 ? ((successfulOrders / totalOrders) * 100).toFixed(1) : "0.0";
    
    // Average Order Processing Time (if we have timestamps)
    const processingOrders = orders.filter((o) => o.status === "processing" || o.status === "shipped" || o.status === "delivered");
    const avgProcessingRate = totalOrders > 0 ? ((processingOrders.length / totalOrders) * 100).toFixed(1) : "0.0";
    
    return {
      fulfillmentRate,
      successRate,
      avgProcessingRate,
    };
  };

  const performanceMetrics = calculatePerformanceMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-56 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-72 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-l-4 border-gray-300 pl-4">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Business insights and performance metrics</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-purple-600 rounded-xl shadow-lg p-6 text-white border-2 border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">${stats?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-700 rounded-full flex items-center justify-center border-2 border-purple-800">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 rounded-xl shadow-lg p-6 text-white border-2 border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold mt-2">{orders.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center border-2 border-blue-800">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-600 rounded-xl shadow-lg p-6 text-white border-2 border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold mt-2">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center border-2 border-green-800">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-orange-600 rounded-xl shadow-lg p-6 text-white border-2 border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Avg Order Value</p>
              <p className="text-3xl font-bold mt-2">
                ${stats?.totalRevenue && orders.length ? (stats.totalRevenue / orders.length).toFixed(2) : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-700 rounded-full flex items-center justify-center border-2 border-orange-800">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Over Time */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Over Time</h2>
          <div style={{ height: "300px" }}>
            <Line data={salesChartData} options={salesChartOptions} />
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status Distribution</h2>
          <div style={{ height: "300px" }}>
            <Bar data={orderStatusData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products by Stock</h2>
          <div style={{ height: "300px" }}>
            <Bar data={topProductsData} options={chartOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Product Sales</h2>
            <select 
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Overall Sales</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ height: "300px" }}>
            <Doughnut data={categoryData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-purple-500 pl-4">
            <p className="text-gray-600 text-sm">Order Success Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{performanceMetrics.successRate}%</p>
            <p className="text-gray-500 text-xs mt-1">Delivered + Shipped orders</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-gray-600 text-sm">Order Processing Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{performanceMetrics.avgProcessingRate}%</p>
            <p className="text-gray-500 text-xs mt-1">Orders in active states</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-gray-600 text-sm">Order Fulfillment Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{performanceMetrics.fulfillmentRate}%</p>
            <p className="text-gray-500 text-xs mt-1">Successfully delivered orders</p>
          </div>
        </div>
      </div>
    </div>
  );
}
