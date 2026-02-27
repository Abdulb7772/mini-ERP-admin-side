"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import TextOnlyEditor from "@/components/TextOnlyEditor";
import { aboutUsAPI } from "@/services/apiService";

interface Block {
  id: string;
  type: "text" | "heading";
  content: string;
  style?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: string;
  };
}

export default function AboutUsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAboutUs = useCallback(async () => {
    try {
      setLoading(true);
      console.log("?? Fetching About Us data from admin API...");
      const response = await aboutUsAPI.get();
      if (response.data.success && response.data.data) {
        // Filter out non-text blocks (only text and heading allowed)
        const textBlocks = (response.data.data.blocks || []).filter(
          (block: Block) => block.type === "text" || block.type === "heading"
        );
        const blocksToSet = textBlocks.length > 0 ? textBlocks : getDefaultTextBlocks();
        console.log("? Setting blocks from API:", blocksToSet.length, "blocks");
        setBlocks(blocksToSet);
      } else {
        // Initialize with default text content if no content exists
        const defaultBlocks = getDefaultTextBlocks();
        console.log("?? No content found, setting default blocks:", defaultBlocks.length, "blocks");
        setBlocks(defaultBlocks);
      }
    } catch (err: any) {
      console.log("? No existing about us content, loading default text template");
      const defaultBlocks = getDefaultTextBlocks();
      console.log("?? Setting default blocks:", defaultBlocks.length, "blocks");
      setBlocks(defaultBlocks);
    } finally {
      setLoading(false);
    }
  }, []);

  // Default text blocks matching client-side About Us page
  const getDefaultTextBlocks = (): Block[] => {
    return [
      // Hero Section
      {
        id: "heading-1",
        type: "heading",
        content: "All-in-One Platform for Better Management",
        style: {
          fontSize: "56px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "transparent",
          textAlign: "left",
        },
      },
      {
        id: "text-1",
        type: "text",
        content: "<p style='font-size: 20px; line-height: 1.6; color: #e5e7eb;'>Secure, reliable, and built to support your business growth.</p>",
        style: {
          fontSize: "20px",
          fontWeight: "normal",
          color: "#e5e7eb",
          backgroundColor: "transparent",
          textAlign: "left",
        },
      },
      // Features Section Heading
      {
        id: "heading-2",
        type: "heading",
        content: "Powerful Features for Your Business",
        style: {
          fontSize: "40px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "transparent",
          textAlign: "center",
        },
      },
      // Feature Cards
      {
        id: "text-2",
        type: "text",
        content: `<div style="padding: 32px; background: #374151; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); transition: all 0.3s;">
          <div style="width: 56px; height: 56px; background: linear-gradient(to bottom right, #3b82f6, #2563eb); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="font-size: 32px;">??</span>
          </div>
          <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #ffffff;">Inventory Management</h3>
          <p style="color: #d1d5db; line-height: 1.6;">Track stock levels, manage products with variations, and get real-time inventory updates</p>
        </div>`,
        style: {
          fontSize: "16px",
          fontWeight: "normal",
          color: "#d1d5db",
          backgroundColor: "#374151",
          textAlign: "left",
        },
      },
      {
        id: "text-3",
        type: "text",
        content: `<div style="padding: 32px; background: #374151; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); transition: all 0.3s;">
          <div style="width: 56px; height: 56px; background: linear-gradient(to bottom right, #a855f7, #9333ea); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="font-size: 32px;">??</span>
          </div>
          <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #ffffff;">Order Processing</h3>
          <p style="color: #d1d5db; line-height: 1.6;">Streamline order management from creation to fulfillment with automated workflows</p>
        </div>`,
        style: {
          fontSize: "16px",
          fontWeight: "normal",
          color: "#d1d5db",
          backgroundColor: "#374151",
          textAlign: "left",
        },
      },
      {
        id: "text-4",
        type: "text",
        content: `<div style="padding: 32px; background: #374151; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); transition: all 0.3s;">
          <div style="width: 56px; height: 56px; background: linear-gradient(to bottom right, #22c55e, #16a34a); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="font-size: 32px;">??</span>
          </div>
          <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #ffffff;">Customer Management</h3>
          <p style="color: #d1d5db; line-height: 1.6;">Maintain detailed customer profiles and track purchase history for better relationships</p>
        </div>`,
        style: {
          fontSize: "16px",
          fontWeight: "normal",
          color: "#d1d5db",
          backgroundColor: "#374151",
          textAlign: "left",
        },
      },
      {
        id: "text-5",
        type: "text",
        content: `<div style="padding: 32px; background: #374151; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); transition: all 0.3s;">
          <div style="width: 56px; height: 56px; background: linear-gradient(to bottom right, #eab308, #ca8a04); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="font-size: 32px;">??</span>
          </div>
          <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #ffffff;">Analytics & Reports</h3>
          <p style="color: #d1d5db; line-height: 1.6;">Gain insights with comprehensive dashboards and detailed business analytics</p>
        </div>`,
        style: {
          fontSize: "16px",
          fontWeight: "normal",
          color: "#d1d5db",
          backgroundColor: "#374151",
          textAlign: "left",
        },
      },
      {
        id: "text-6",
        type: "text",
        content: `<div style="padding: 32px; background: #374151; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); transition: all 0.3s;">
          <div style="width: 56px; height: 56px; background: linear-gradient(to bottom right, #ef4444, #dc2626); border-radius: 12px; display: flex; align-items: center; justify-center; margin-bottom: 24px;">
            <span style="font-size: 32px;">?</span>
          </div>
          <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #ffffff;">Attendance Tracking</h3>
          <p style="color: #d1d5db; line-height: 1.6;">Monitor employee attendance and work hours with easy check-in/check-out system</p>
        </div>`,
        style: {
          fontSize: "16px",
          fontWeight: "normal",
          color: "#d1d5db",
          backgroundColor: "#374151",
          textAlign: "left",
        },
      },
      {
        id: "text-7",
        type: "text",
        content: `<div style="padding: 32px; background: #374151; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); transition: all 0.3s;">
          <div style="width: 56px; height: 56px; background: linear-gradient(to bottom right, #6366f1, #4f46e5); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
            <span style="font-size: 32px;">??</span>
          </div>
          <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #ffffff;">User Management</h3>
          <p style="color: #d1d5db; line-height: 1.6;">Role-based access control with secure authentication and authorization</p>
        </div>`,
        style: {
          fontSize: "16px",
          fontWeight: "normal",
          color: "#d1d5db",
          backgroundColor: "#374151",
          textAlign: "left",
        },
      },
      // Why Choose Section
      {
        id: "heading-3",
        type: "heading",
        content: "Why Choose MiniERP?",
        style: {
          fontSize: "40px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "transparent",
          textAlign: "left",
        },
      },
      {
        id: "text-8",
        type: "text",
        content: `<div style="padding: 32px; background: #1f2937; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
          <p style="font-size: 18px; line-height: 1.8; color: #d1d5db; margin-bottom: 24px;">
            MiniERP is designed to simplify business operations for small to medium-sized enterprises. Our intuitive platform brings together all essential business functions in one place.
          </p>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 16px; color: #d1d5db; display: flex; align-items: start;">
              <svg style="width: 24px; height: 24px; color: #10b981; margin-right: 12px; margin-top: 4px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Easy to use interface with minimal learning curve</span>
            </li>
            <li style="margin-bottom: 16px; color: #d1d5db; display: flex; align-items: start;">
              <svg style="width: 24px; height: 24px; color: #10b981; margin-right: 12px; margin-top: 4px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Real-time updates and notifications</span>
            </li>
            <li style="margin-bottom: 16px; color: #d1d5db; display: flex; align-items: start;">
              <svg style="width: 24px; height: 24px; color: #10b981; margin-right: 12px; margin-top: 4px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure and reliable cloud-based solution</span>
            </li>
            <li style="margin-bottom: 0; color: #d1d5db; display: flex; align-items: start;">
              <svg style="width: 24px; height: 24px; color: #10b981; margin-right: 12px; margin-top: 4px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Scalable architecture that grows with your business</span>
            </li>
          </ul>
        </div>`,
        style: {
          fontSize: "16px",
          fontWeight: "normal",
          color: "#d1d5db",
          backgroundColor: "#1f2937",
          textAlign: "left",
        },
      },
      // CTA Section
      {
        id: "text-9",
        type: "text",
        content: `<div style="padding: 48px; text-align: center; background: linear-gradient(to right, #2563eb, #9333ea); border-radius: 16px;">
          <h2 style="font-size: 40px; font-weight: bold; color: #ffffff; margin-bottom: 16px;">
            Ready to Transform Your Business?
          </h2>
          <p style="font-size: 20px; color: #dbeafe; margin-bottom: 24px;">
            Join hundreds of businesses already using MiniERP to streamline their operations
          </p>
        </div>`,
        style: {
          fontSize: "16px",
          fontWeight: "normal",
          color: "#ffffff",
          backgroundColor: "transparent",
          textAlign: "center",
        },
      },
    ];
  };

  // Log blocks state changes
  useEffect(() => {
    console.log("?? Blocks state changed:", blocks.length, "blocks");
  }, [blocks]);

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") {
      return;
    }

    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // If not admin, redirect to dashboard
    if (session?.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Fetch data
    fetchAboutUs();
  }, [status, session?.user?.role, router, fetchAboutUs]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      console.log("?? ========== SAVE CLICKED ==========");
      console.log("?? Current blocks state:", blocks);
      console.log("?? Block count:", blocks.length);
      console.log("?? First 3 blocks:", blocks.slice(0, 3).map(b => ({ 
        id: b.id, 
        type: b.type, 
        contentPreview: b.content.substring(0, 50) 
      })));

      if (blocks.length === 0) {
        console.error("? BLOCKS IS EMPTY! Cannot save.");
        setError("No content to save. Please wait for page to load or add content.");
        setSaving(false);
        return;
      }

      const payload = { 
        blocks,
        pageBackgroundColor: "#111827" // gray-900 to match display
      };

      console.log("?? Sending payload:", { 
        blockCount: payload.blocks.length,
        pageBackgroundColor: payload.pageBackgroundColor
      });

      const response = await aboutUsAPI.post(payload);

      console.log("? Save response:", response.data);

      if (response.data.success) {
        setSuccess("About Us content saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to save content");
      }
    } catch (err: any) {
      console.error("? Save error:", err);
      setError(err.response?.data?.message || err.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white border-b border-gray-200 px-6 py-4 rounded-lg">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 animate-pulse">
            <div className="h-20 w-full bg-gray-200 rounded"></div>
            <div className="h-20 w-full bg-gray-200 rounded"></div>
            <div className="h-20 w-full bg-gray-200 rounded"></div>
            <div className="h-20 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">About Us Content Manager</h1>
            <p className="text-gray-600 mt-1">
              Manage text content for your About Us page
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {error && (
              <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {success}
              </div>
            )}
            <Button variant="secondary" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save & Publish"}
            </Button>
          </div>
        </div>
      </div>

      {/* Text Editor */}
      <div className="flex-1 overflow-hidden">
        <TextOnlyEditor blocks={blocks} onChange={setBlocks} />
      </div>
    </div>
  );
}
