"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { reviewAPI } from "@/services/apiService";
import { TableSkeleton } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import TiptapEditor from "@/components/TiptapEditor";
import { confirmToast } from "@/utils/confirmToast";

interface Review {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
  };
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  productId: {
    _id: string;
    name: string;
    imageUrl?: string;
  };
  variationId?: string;
  rating: number;
  description: string;
  images?: string[];
  status: "pending" | "approved" | "rejected";
  isVerified: boolean;
  helpful: number;
  adminReply?: string;
  repliedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewsPage() {
  useAuth(["admin", "customer_manager"]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      const response = await reviewAPI.getReviews(params);
      setReviews(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || "");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    confirmToast({
      title: "Delete Review",
      message: "Are you sure you want to delete this review?",
      onConfirm: async () => {
        try {
          await reviewAPI.deleteReview(id);
          toast.success("Review deleted successfully");
          fetchReviews();
        } catch (error) {
          console.error("Error deleting review:", error);
          toast.error("Failed to delete review");
        }
      },
    });
  };

  const handleAddReply = async () => {
    if (!selectedReview) return;
    
    // Remove HTML tags to check if there's actual content
    const textContent = replyText.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      setReplySubmitting(true);
      await reviewAPI.addReply(selectedReview._id, replyText);
      toast.success("Reply added successfully");
      setShowModal(false);
      setSelectedReview(null);
      setReplyText("");
      fetchReviews();
    } catch (error: any) {
      console.error("Error adding reply:", error);
      toast.error(error.response?.data?.message || "Failed to add reply");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!selectedReview) return;

    confirmToast({
      title: "Delete Reply",
      message: "Are you sure you want to delete this reply?",
      onConfirm: async () => {
        try {
          setReplySubmitting(true);
          await reviewAPI.deleteReply(selectedReview._id);
          toast.success("Reply deleted successfully");
          setShowModal(false);
          setSelectedReview(null);
          setReplyText("");
          fetchReviews();
        } catch (error: any) {
          console.error("Error deleting reply:", error);
          toast.error(error.response?.data?.message || "Failed to delete reply");
        } finally {
          setReplySubmitting(false);
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-500" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
          <p className="text-gray-600 mt-1">View and respond to customer reviews</p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <p className="text-gray-600 text-sm font-medium">Total Reviews</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
        <p className="text-sm text-gray-500 mt-1">All customer reviews are automatically published</p>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <TableSkeleton columns={7} rows={5} />
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <p className="text-gray-600 text-lg">No reviews found</p>
            <p className="text-gray-500 text-sm mt-1">
              Customer reviews will appear here
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Review
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {review.productId?.imageUrl && (
                            <img
                              src={review.productId.imageUrl}
                              alt={review.productId.name}
                              className="w-10 h-10 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {review.productId?.name || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Order: {review.orderId?.orderNumber || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {review.customerId?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {review.customerId?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(review.rating)}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-900 max-w-xs truncate"
                          dangerouslySetInnerHTML={{
                            __html:
                              review.description.substring(0, 100) +
                              (review.description.length > 100 ? "..." : ""),
                          }}
                        />
                        {review.images && review.images.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            📷 {review.images.length} image(s)
                          </div>
                        )}
                        {review.adminReply && (
                          <div className="text-xs text-blue-600 mt-1">
                            💬 Admin replied
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewReview(review)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={10}
                totalItems={total}
              />
            )}
          </>
        )}
      </div>

      {/* View/Moderate Review Modal */}
      {showModal && selectedReview && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedReview(null);
          }}
          title="Review Details"
        >
          <div className="space-y-6">
            {/* Product Info */}
            <div className="flex items-start gap-4 border-b pb-4">
              {selectedReview.productId?.imageUrl && (
                <img
                  src={selectedReview.productId.imageUrl}
                  alt={selectedReview.productId.name}
                  className="w-20 h-20 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedReview.productId?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Order: {selectedReview.orderId?.orderNumber}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-sm text-gray-600">
                    {selectedReview.rating}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Customer Name</label>
                <p className="text-gray-900">{selectedReview.customerId?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900 text-sm">{selectedReview.customerId?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <p className="text-gray-900 text-sm">{formatDate(selectedReview.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Helpful Votes</label>
                <p className="text-gray-900">{selectedReview.helpful}</p>
              </div>
            </div>

            {/* Review Description */}
            <div>
              <label className="text-sm font-medium text-gray-700">Review</label>
              <div
                className="mt-2 text-gray-900 prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg"
                dangerouslySetInnerHTML={{ __html: selectedReview.description }}
              />
            </div>

            {/* Images */}
            {selectedReview.images && selectedReview.images.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Images ({selectedReview.images.length})
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedReview.images.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={url}
                        alt={`Review image ${idx + 1}`}
                        className="w-full h-32 object-cover rounded border border-gray-300 hover:border-orange-500 transition"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedReview.isVerified && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Verified Purchase</span>
              </div>
            )}

            {/* Admin Reply Section */}
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Admin Reply
              </label>
              {selectedReview.adminReply && (
                <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      <span className="text-sm font-semibold text-blue-900">
                        {selectedReview.repliedBy?.name || "Admin"}
                      </span>
                    </div>
                    {selectedReview.repliedAt && (
                      <span className="text-xs text-gray-500">
                        {formatDate(selectedReview.repliedAt)}
                      </span>
                    )}
                  </div>
                  <div 
                    className="text-gray-700 text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedReview.adminReply }}
                  />
                  <button
                    onClick={handleDeleteReply}
                    disabled={replySubmitting}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    Delete Reply
                  </button>
                </div>
              )}
              <div className="mt-3">
                <TiptapEditor
                  content={replyText}
                  onChange={(content) => setReplyText(content)}
                  placeholder="Write your reply to the customer..."
                />
              </div>
              <button
                onClick={handleAddReply}
                disabled={replySubmitting || !replyText.replace(/<[^>]*>/g, '').trim()}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {replySubmitting ? "Submitting..." : selectedReview.adminReply ? "Update Reply" : "Add Reply"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
