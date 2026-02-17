"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TiptapEditor from "@/components/TiptapEditor";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import { blogAPI } from "@/services/apiService";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    author: "",
    status: "published" as "published" | "blocked",
  });

  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      const response = await blogAPI.getBlog(blogId);
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching blog:", error);
      toast.error("Failed to fetch blog");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      await blogAPI.updateBlog(blogId, formData);
      toast.success("Blog updated successfully!");
      router.push("/protected/blogs");
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error("Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
        <p className="text-gray-600 mt-1">Update blog post details</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white text-black rounded-lg shadow-md p-6 space-y-6">
        <Input
          label="Title"
          type="text"
          placeholder="Enter blog title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <Input
          label="Author"
          type="text"
          placeholder="Author name"
          required
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as "published" | "blocked" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="published">Published</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

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
            Update Blog
          </Button>
        </div>
      </form>
    </div>
  );
}
