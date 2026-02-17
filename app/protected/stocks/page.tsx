"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { productAPI } from "@/services/apiService";
import { TableSkeleton } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";

interface StockItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  variationName?: string;
  size?: string;
  color?: string;
  isVariation: boolean;
  imageUrl?: string;
}

export default function StocksPage() {
  useAuth(["admin", "manager", "staff"]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts();
      const products = response.data.data;

      const items: StockItem[] = [];

      for (const product of products) {
        if (product.hasVariations) {
          // Fetch variations for this product
          const productDetail = await productAPI.getProduct(product._id);
          const variations = productDetail.data.data.variations || [];

          variations.forEach((variation: any) => {
            items.push({
              id: variation._id,
              productId: product._id,
              productName: product.name,
              sku: variation.sku,
              category: product.category,
              price: variation.price,
              stock: variation.stock,
              variationName: variation.name,
              size: variation.size,
              color: variation.color,
              isVariation: true,
              imageUrl: product.imageUrl,
            });
          });
        } else {
          items.push({
            id: product._id,
            productId: product._id,
            productName: product.name,
            sku: product.sku,
            category: product.category,
            price: product.price,
            stock: product.stock,
            isVariation: false,
            imageUrl: product.imageUrl,
          });
        }
      }

      setStockItems(items);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      toast.error("Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: StockItem) => {
    setEditingId(item.id);
    setEditValue(item.stock);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const handleSaveStock = async (item: StockItem) => {
    try {
      if (editValue < 0) {
        toast.error("Stock cannot be negative");
        return;
      }

      if (item.isVariation) {
        await productAPI.updateVariationStock(item.id, editValue);
      } else {
        await productAPI.updateProductStock(item.id, editValue);
      }

      toast.success("Stock updated successfully");
      setEditingId(null);
      fetchStocks();
    } catch (error: any) {
      console.error("Error updating stock:", error);
      const message = error.response?.data?.message || "Failed to update stock";
      toast.error(message);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(stockItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStockItems = stockItems.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-72 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <TableSkeleton rows={10} columns={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">Manage inventory stock levels</p>
        </div>
        <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
        
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Image</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Product Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Variation</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Stock</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockItems.length > 0 ? (
                paginatedStockItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                    </td>
                    <td className="px-6 py-4">
                      {item.isVariation ? (
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{item.variationName}</p>
                          {item.size && (
                            <span className="text-xs text-gray-600">Size: {item.size}</span>
                          )}
                          {item.color && (
                            <span className="text-xs text-gray-600 ml-2">Color: {item.color}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-700">
                        {item.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        ${item.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 text-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span
                          className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                            item.stock > 10
                              ? "bg-green-100 text-green-800"
                              : item.stock >= 5
                              ? "bg-yellow-100 text-yellow-800"
                              : item.stock > 0
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2 ">
                        {editingId === item.id ? (
                          <>
                            <button
                              onClick={() => handleSaveStock(item)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Save"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Cancel"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Stock"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No stock items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {stockItems.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={stockItems.length}
          />
        )}
      </div>
    </div>
  );
}
