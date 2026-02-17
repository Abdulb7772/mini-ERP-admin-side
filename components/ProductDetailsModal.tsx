"use client";

import Modal from "./Modal";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  variations?: any[];
}

export default function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  variations = [],
}: ProductDetailsModalProps) {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name}>
      <div className="space-y-6">
        {/* Product Image */}
        {product.imageUrl && (
          <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU
            </label>
            <p className="font-mono text-gray-900">{product.sku}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <p className="text-gray-900">{product.category}</p>
          </div>
          {!product.hasVariations && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <p className="text-gray-900 font-semibold">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <p className="text-gray-900">{product.stock} units</p>
              </div>
            </>
          )}
        </div>

        {/* Variations */}
        {product.hasVariations && variations.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Variations
            </label>
            <div className="space-y-2">
              {variations.map((variation: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {variation.name}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      {variation.size && <span>Size: {variation.size}</span>}
                      {variation.color && <span>Color: {variation.color}</span>}
                      <span className="font-mono text-xs">{variation.sku}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${variation.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {variation.stock} units
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div
              className="prose prose-sm max-w-none text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-200"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
