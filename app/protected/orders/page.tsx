"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { orderAPI } from "@/services/apiService";
import { TableSkeleton } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    sku: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    address?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
}

export default function OrdersPage() {
  useAuth(["admin", "manager", "staff"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrders();
      setOrders(response.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      await orderAPI.updateOrderStatus(orderId, newStatus);
      toast.success("Order status updated successfully");
      
      // Update local state
      setOrders(orders.map((order) => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 border border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-orange-100 text-orange-800 border border-orange-300";
      case "paid":
        return "bg-green-100 text-green-800 border border-green-300";
      case "failed":
        return "bg-red-100 text-red-800 border border-red-300";
      case "refunded":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-56 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Status Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-100 border-l-4 border-gray-300 p-4 rounded-lg">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Items per page selector skeleton */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <TableSkeleton rows={8} columns={9} />
      </div>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track all orders</p>
        </div>
      </div>

      {/* Order Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <p className="text-sm text-yellow-700 font-medium">Pending</p>
          <p className="text-3xl font-bold text-yellow-900 mt-2">
            {orders.filter((o) => o.status === "pending").length}
          </p>
        </div>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-sm text-blue-700 font-medium">Processing</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            {orders.filter((o) => o.status === "processing").length}
          </p>
        </div>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
          <p className="text-sm text-purple-700 font-medium">Shipped</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">
            {orders.filter((o) => o.status === "shipped").length}
          </p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-sm text-green-700 font-medium">Delivered</p>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {orders.filter((o) => o.status === "delivered").length}
          </p>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-700 font-medium">Cancelled</p>
          <p className="text-3xl font-bold text-red-900 mt-2">
            {orders.filter((o) => o.status === "cancelled").length}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
          <div className="text-sm text-gray-500">
            Total Orders: <span className="font-semibold text-gray-900">{orders.length}</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold border-r border-purple-500">Order #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold border-r border-purple-500">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold border-r border-purple-500">Products</th>
                <th className="px-6 py-4 text-left text-sm font-semibold border-r border-purple-500">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold border-r border-purple-500">Delivery Address</th>
                <th className="px-6 py-4 text-left text-sm font-semibold border-r border-purple-500">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold border-r border-purple-500">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold border-r border-purple-500">Payment Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                      {order.orderNumber || `#${order._id.slice(-6)}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                      <div>
                        <div className="font-medium">{order.customerId?.name || "N/A"}</div>
                        <div className="text-xs text-gray-500">{order.customerId?.email || ""}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="font-medium">{item.productId?.name || "Unknown Product"}</div>
                            <div className="text-xs text-gray-500">SKU: {item.productId?.sku || "N/A"}</div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                      <div className="max-w-xs">
                        {order.customerId?.address ? (
                          <div className="whitespace-pre-wrap">{order.customerId.address}</div>
                        ) : (
                          <span className="text-gray-400">No address</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 border-r border-gray-200">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm border-r border-gray-200">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        disabled={updatingStatus === order._id || order.status === "cancelled" || order.status === "delivered"}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border-0 focus:ring-2 focus:ring-purple-500 disabled:opacity-75 disabled:cursor-not-allowed ${getStatusColor(order.status)}`}
                      >
                        <option value="pending" className="bg-yellow-100 text-yellow-800">Pending</option>
                        <option value="processing" className="bg-blue-100 text-blue-800">Processing</option>
                        <option value="shipped" className="bg-purple-100 text-purple-800">Shipped</option>
                        <option value="delivered" className="bg-green-100 text-green-800">Delivered</option>
                        <option value="cancelled" className="bg-red-100 text-red-800">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm border-r border-gray-200">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus || "pending")}`}>
                        {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {orders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={orders.length}
          />
        )}
      </div>

      {/* Summary Stats */}
      
    </div>
  );
}
