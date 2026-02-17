"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import TiptapEditor from "@/components/TiptapEditor";
import VariationManager from "@/components/VariationManager";
import { productAPI } from "@/services/apiService";

interface ProductFormProps {
  product?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEditing = !!product;
  const [loadingVariations, setLoadingVariations] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    category: Yup.string().required("Category is required"),
    price: Yup.number()
      .min(0, "Price must be positive")
      .required("Price is required"),
    stock: Yup.number()
      .min(0, "Stock must be positive")
      .required("Stock is required"),
    description: Yup.string(),
    images: Yup.array().of(Yup.string()),
  });

  const formik = useFormik({
    initialValues: {
      name: product?.name || "",
      category: product?.category || "",
      price: product?.price || 0,
      stock: product?.stock || 0,
      description: product?.description || "",
      images: product?.images || (product?.imageUrl ? [product.imageUrl] : []),
      hasVariations: product?.hasVariations || false,
      variations: [],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Prepare data with imageUrl as the first image (for backward compatibility)
        const productData = {
          ...values,
          imageUrl: values.images && values.images.length > 0 ? values.images[0] : undefined,
        };

        if (isEditing) {
          await productAPI.updateProduct(product._id, productData);
        } else {
          // Auto-generate SKU for new products
          const categoryPrefix = values.category.substring(0, 3).toUpperCase();
          const timestamp = Date.now().toString().slice(-6);
          const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          const autoSku = `${categoryPrefix}-${timestamp}-${randomNum}`;
          
          await productAPI.createProduct({ ...productData, sku: autoSku });
        }
        onSuccess();
      } catch (error) {
        console.error("Error saving product:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Fetch variations when editing a product with variations
  useEffect(() => {
    const fetchVariations = async () => {
      if (isEditing && product?.hasVariations && product?._id) {
        setLoadingVariations(true);
        try {
          const response = await productAPI.getProduct(product._id);
          if (response.data.data.variations) {
            formik.setFieldValue('variations', response.data.data.variations);
          }
        } catch (error) {
          console.error("Error fetching variations:", error);
        } finally {
          setLoadingVariations(false);
        }
      }
    };
    fetchVariations();
  }, [product?._id, isEditing]);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4 bg-purple-500 p-6 rounded-lg">
      <Input
        label="Product Name"
        name="name"
        placeholder="Enter product name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name && formik.errors.name ? String(formik.errors.name) : undefined}
        required
      />

      {isEditing && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU (Auto-generated)
          </label>
          <p className="font-mono text-gray-900 font-semibold">{product.sku}</p>
        </div>
      )}

      <Input
        label="Category"
        name="category"
        placeholder="Enter category"
        value={formik.values.category}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.category && formik.errors.category ? String(formik.errors.category) : undefined}
        required
      />

      {/* Has Variations Toggle */}
      <div className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg">
        <input
          type="checkbox"
          id="hasVariations"
          checked={formik.values.hasVariations}
          onChange={(e) => {
            formik.setFieldValue('hasVariations', e.target.checked);
            if (!e.target.checked) {
              formik.setFieldValue('variations', []);
            }
          }}
          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
        <label htmlFor="hasVariations" className="text-white font-medium cursor-pointer">
          This product has variations (Size/Color)
        </label>
      </div>

      {!formik.values.hasVariations ? (
        <>
          <Input
            label="Price"
            name="price"
            type="number"
            step="0.01"
            placeholder="Enter price"
            value={formik.values.price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.price && formik.errors.price ? String(formik.errors.price) : undefined}
            required
          />

          <Input
            label="Stock"
            name="stock"
            type="number"
            placeholder="Enter stock quantity"
            value={formik.values.stock}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.stock && formik.errors.stock ? String(formik.errors.stock) : undefined}
            required
          />
        </>
      ) : (
        <VariationManager
          variations={formik.values.variations}
          onChange={(variations) => formik.setFieldValue('variations', variations)}
        />
      )}

      <CloudinaryUpload
        onUpload={(urls) => formik.setFieldValue('images', urls)}
        currentImages={formik.values.images}
      />

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Description
        </label>
        <TiptapEditor
          content={formik.values.description}
          onChange={(content) => formik.setFieldValue('description', content)}
          placeholder="Enter product description (optional)..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={formik.isSubmitting}
          className="px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg"
        >
          {formik.isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
