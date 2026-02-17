"use client";

import { useRef, ChangeEvent, useState } from "react";
import toast from "react-hot-toast";

interface CloudinaryUploadProps {
  onUpload: (urls: string[]) => void;
  currentImages?: string[];
}

export default function CloudinaryUpload({ onUpload, currentImages = [] }: CloudinaryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dpilt8ofa';
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary error response:', errorData);
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      return null;
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    setUploading(true);
    
    // Process all files
    const filePromises = Array.from(files).map(async (file) => {
      // Validate file type
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image file`);
        return null;
      }

      // Validate file size
      if (file.size > maxSize) {
        toast.error(`${file.name} is larger than 5MB`);
        return null;
      }

      // Upload to Cloudinary
      const url = await uploadToCloudinary(file);
      return url;
    });

    // Wait for all files to be processed
    const results = await Promise.all(filePromises);
    const validImages = results.filter((img): img is string => img !== null);
    
    if (validImages.length > 0) {
      onUpload([...currentImages, ...validImages]);
      toast.success(`${validImages.length} image(s) uploaded successfully!`);
    }
    
    setUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (index: number) => {
    const updatedImages = currentImages.filter((_, i) => i !== index);
    onUpload(updatedImages);
  };

  return (
    <div className="space-y-3">
      {/* Images Grid */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-3">
          {currentImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {index === 0 && (
                <div className="absolute bottom-1 left-1">
                  <span className="inline-block px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                    Primary
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          multiple
          className="hidden"
          disabled={uploading}
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>{currentImages.length > 0 ? 'Add More Images' : 'Upload Images'}</span>
            </>
          )}
        </button>
      </div>
      
      <p className="text-xs text-center text-gray-600">
        Supported: JPG, PNG, GIF, WebP • Max 5MB each • First image will be primary
      </p>
    </div>
  );
}
