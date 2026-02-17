"use client";

import { useState } from "react";
import Input from "./Input";
import Button from "./Button";

interface Variation {
  name: string;
  size?: string;
  color?: string;
  sku: string;
  price: number;
  stock: number;
}

interface VariationManagerProps {
  variations: Variation[];
  onChange: (variations: Variation[]) => void;
}

export default function VariationManager({ variations, onChange }: VariationManagerProps) {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [color, setColor] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [showForm, setShowForm] = useState(variations.length === 0);

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleAddVariations = () => {
    if (selectedSizes.length === 0) {
      alert("Please select at least one size");
      return;
    }

    if (!color) {
      alert("Please enter a color");
      return;
    }

    // Create variations for each selected size
    const newVariations = selectedSizes.map(size => {
      const timestamp = Date.now().toString().slice(-6);
      const sizeCode = size.substring(0, 2).toUpperCase();
      const colorCode = color.substring(0, 3).toUpperCase();
      const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      const autoSku = `VAR-${timestamp}-${sizeCode}${colorCode}-${randomNum}`;

      return {
        name: `${size} - ${color}`,
        size: size,
        color: color,
        sku: autoSku,
        price: price,
        stock: stock,
      };
    });

    onChange([...variations, ...newVariations]);
    
    // Reset form and hide it
    setSelectedSizes([]);
    setColor("");
    setPrice(0);
    setStock(0);
    setShowForm(false);
  };

  const handleRemoveVariation = (index: number) => {
    const newVariations = variations.filter((_, i) => i !== index);
    onChange(newVariations);
  };

  return (
    <div className="space-y-4">
      {/* Variation List */}
      {variations.length > 0 && (
        <div className="bg-white/10 rounded-lg p-4 space-y-2">
          <h3 className="text-white font-semibold mb-3">Variations ({variations.length})</h3>
          {variations.map((variation, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
            >
              <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">{variation.name}</span>
                </div>
                {variation.size && (
                  <div className="text-gray-600">
                    Size: <span className="font-medium">{variation.size}</span>
                  </div>
                )}
                {variation.color && (
                  <div className="text-gray-600">
                    Color: <span className="font-medium">{variation.color}</span>
                  </div>
                )}
                <div className="text-gray-600">
                  SKU: <span className="font-mono text-xs">{variation.sku}</span>
                </div>
                <div className="text-gray-600">
                  Price: <span className="font-semibold">${variation.price}</span>
                </div>
                <div className="text-gray-600">
                  Stock: <span className="font-semibold">{variation.stock}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveVariation(index)}
                className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove variation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Variation Form or Button */}
      {!showForm ? (
        <div className="bg-white/10 rounded-lg p-4">
          <Button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Another Variation</span>
          </Button>
        </div>
      ) : (
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Add Variation</h3>
            {variations.length > 0 && (
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-white/70 hover:text-white text-sm"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="space-y-4">
            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select Sizes <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedSizes.includes(size)
                        ? "bg-white text-purple-600 shadow-md scale-105"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {selectedSizes.length > 0 && (
                <p className="mt-2 text-sm text-white/70">
                  Selected: {selectedSizes.join(", ")}
                </p>
              )}
            </div>

            {/* Color Input */}
            <Input
              label="Color"
              placeholder="e.g., Red, Blue, Black"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Price (for all selected sizes)"
                type="number"
                step="0.01"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
              />

              <Input
                label="Stock (for each size)"
                type="number"
                placeholder="Enter stock quantity"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAddVariations}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-purple-600 font-semibold py-2 rounded-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add {selectedSizes.length > 0 ? `${selectedSizes.length} Variation${selectedSizes.length > 1 ? 's' : ''}` : 'Variations'}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
