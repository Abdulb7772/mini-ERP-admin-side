"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TiptapEditor from "@/components/TiptapEditor";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import { blogAPI } from "@/services/apiService";

export default function AddBlogPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    author: (session?.user as any)?.name || "Admin",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      await blogAPI.createBlog(formData);
      toast.success("Blog created successfully!");
      router.push("/protected/blogs");
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Blog</h1>
        <p className="text-gray-600 mt-1">Create a new blog post</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 text-black space-y-6">
        <Input className="text-black"
          label="Title"
          type="text"
          placeholder="Enter blog title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <Input 
          label ="Author"
          className="text-black"
          type="text"
          placeholder="Author name"
          required
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <TiptapEditor
            content={formData.description}
            onChange={(content) => setFormData({ ...formData, description: content })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Blog Image
          </label>
          <CloudinaryUpload
            onUpload={(urls) => setFormData({ ...formData, imageUrl: urls[0] || "" })}
            currentImages={formData.imageUrl ? [formData.imageUrl] : []}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/protected/blogs")}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Blog
          </Button>
        </div>
      </form>
    </div>
  );
}
