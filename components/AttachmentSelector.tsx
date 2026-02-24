"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/services/axios";

interface AttachmentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  type: "order" | "product" | "customer";
  onSelect: (id: string) => void;
}

export default function AttachmentSelector({
  isOpen,
  onClose,
  type,
  onSelect,
}: AttachmentSelectorProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen, type, page]);

  const loadItems = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      if (type === "order") {
        endpoint = `/orders?page=${page}&limit=10`;
      } else if (type === "product") {
        endpoint = `/products?page=${page}&limit=10`;
      } else if (type === "customer") {
        endpoint = `/customers?page=${page}&limit=10`;
      }

      const response = await axiosInstance.get(endpoint);
      
      // All endpoints now return data directly in response.data.data
      // and pagination info in response.data.pagination
      setItems(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error(`Error loading ${type}s:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: any) => {
    onSelect(item._id);
    onClose();
  };

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    if (type === "order") {
      return item.orderNumber?.toLowerCase().includes(query);
    } else if (type === "product") {
      return item.name?.toLowerCase().includes(query);
    } else if (type === "customer") {
      return (
        item.name?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query)
      );
    }
    return false;
  });

  if (!isOpen) return null;

  const getTypeIcon = () => {
    if (type === "order") return "📦";
    if (type === "product") return "🛍️";
    if (type === "customer") return "👤";
  };

  const getTypeTitle = () => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const renderItem = (item: any) => {
    if (type === "order") {
      return (
        <button
          key={item._id}
          onClick={() => handleSelect(item)}
          className="w-full text-left p-4 hover:bg-blue-50 border-b border-gray-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                Order #{item.orderNumber}
              </p>
              <p className="text-sm text-gray-600">
                Customer: {item.customerId?.name || "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                Total: Rs. {item.totalAmount?.toFixed(2) || "0.00"}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : item.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {item.status}
            </span>
          </div>
        </button>
      );
    } else if (type === "product") {
      return (
        <button
          key={item._id}
          onClick={() => handleSelect(item)}
          className="w-full text-left p-4 hover:bg-blue-50 border-b border-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            {item.images?.[0] && (
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-600">
                Rs. {item.basePrice?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-gray-500">
                Stock: {item.stock || 0}
              </p>
            </div>
          </div>
        </button>
      );
    } else if (type === "customer") {
      return (
        <button
          key={item._id}
          onClick={() => handleSelect(item)}
          className="w-full text-left p-4 hover:bg-blue-50 border-b border-gray-100 transition-colors"
        >
          <div>
            <p className="font-semibold text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-600">{item.email}</p>
            <p className="text-xs text-gray-500">
              Phone: {item.phone || "N/A"}
            </p>
          </div>
        </button>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-linear-to-r from-blue-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getTypeIcon()}</span>
              <h2 className="text-2xl font-bold text-white">
                Select {getTypeTitle()}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${type}s...`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <span className="text-4xl mb-2">🔍</span>
              <p>No {type}s found</p>
            </div>
          ) : (
            filteredItems.map(renderItem)
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
