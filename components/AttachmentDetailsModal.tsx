"use client";

import React from "react";

interface AttachmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "order" | "product" | "customer";
  data: any;
}

export default function AttachmentDetailsModal({
  isOpen,
  onClose,
  type,
  data,
}: AttachmentDetailsModalProps) {
  if (!isOpen || !data) return null;

  const renderOrderDetails = () => (
    <div className="space-y-4">
      <div className="bg-linear-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Order #{data.orderNumber}
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Status:</span>
            <span
              className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                data.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : data.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : data.status === "processing"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {data.status}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Total:</span>
            <span className="ml-2 font-bold text-gray-900">
              Rs. {data.totalAmount?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      </div>
      
      {/* Products */}
      {data.items && data.items.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Ordered Products:</h4>
          <div className="space-y-2">
            {data.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm py-2 border-b last:border-b-0">
                <div>
                  <span className="font-medium text-gray-900">
                    {item.productId?.name || "Product"}
                  </span>
                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  Rs. {item.subtotal?.toFixed(2) || "0.00"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProductDetails = () => (
    <div className="space-y-4">
      <div className="bg-linear-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
        {data.images && data.images[0] && (
          <img
            src={data.images[0]}
            alt={data.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{data.name}</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          
          <div>
            <span className="text-gray-600">Stock:</span>
            <span className="ml-2 font-bold text-gray-900">
              {data.stock || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomerDetails = () => (
    <div className="space-y-4">
      <div className="bg-linear-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{data.name}</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600">Email:</span>
            <span className="ml-2 text-gray-900">{data.email}</span>
          </div>
          <div>
            <span className="text-gray-600">Phone:</span>
            <span className="ml-2 text-gray-900">{data.phone || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-linear-to-r from-blue-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {type === "order" ? "📦" : type === "product" ? "🛍️" : "👤"}
              </span>
              <h2 className="text-2xl font-bold text-white">
                {type === "order"
                  ? "Order Details"
                  : type === "product"
                  ? "Product Details"
                  : "Customer Details"}
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

        {/* Content */}
        <div className="p-6">
          {type === "order" && renderOrderDetails()}
          {type === "product" && renderProductDetails()}
          {type === "customer" && renderCustomerDetails()}
        </div>
      </div>
    </div>
  );
}
