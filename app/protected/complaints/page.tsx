"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { complaintAPI } from "@/services/apiService";
import { TableSkeleton } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import TiptapEditor from "@/components/TiptapEditor";

interface Complaint {
  _id: string;
  orderId?: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  };
  customerId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  subject: string;
  description: string;
  status: "pending" | "in-review" | "resolved" | "rejected";
  priority: "low" | "medium" | "high";
  attachments?: string[];
  response?: string;
  respondedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ComplaintStats {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
  rejected: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

export default function ComplaintsPage() {
  useAuth(["admin", "staff"]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [updating, setUpdating] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, [statusFilter, priorityFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;

      const response = await complaintAPI.getComplaints(params);
      const complaintsData = response.data.data || [];
      
      // Log for debugging
      console.log('Received complaints:', complaintsData.length);
      if (complaintsData.length > 0) {
        console.log('Sample complaint:', JSON.stringify(complaintsData[0], null, 2));
      }
      
      setComplaints(complaintsData);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await complaintAPI.getComplaintStats();
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching complaint stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setResponseText(complaint.response || "");
    setShowModal(true);
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;

    if (!responseText.trim()) {
      toast.error("Please provide a response");
      return;
    }

    try {
      setUpdating(true);
      await complaintAPI.updateComplaintStatus(selectedComplaint._id, {
        status: newStatus,
        response: responseText,
      });

      toast.success("Complaint updated successfully");
      setShowModal(false);
      setSelectedComplaint(null);
      setResponseText("");
      fetchComplaints();
      fetchStats();
    } catch (error: any) {
      console.error("Error updating complaint:", error);
      toast.error(error.response?.data?.message || "Failed to update complaint");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this complaint?")) return;

    try {
      await complaintAPI.deleteComplaint(id);
      toast.success("Complaint deleted successfully");
      fetchComplaints();
      fetchStats();
    } catch (error) {
      console.error("Error deleting complaint:", error);
      toast.error("Failed to delete complaint");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "in-review":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "resolved":
        return "bg-green-100 text-green-800 border border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border border-red-300";
      case "medium":
        return "bg-orange-100 text-orange-800 border border-orange-300";
      case "low":
        return "bg-gray-100 text-gray-800 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = complaints.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(complaints.length / itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Complaints Management</h1>
          <p className="text-gray-600 mt-1">Manage and respond to customer complaints</p>
        </div>
      </div>

      {/* Stats Cards */}
      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Total Complaints</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm font-medium">In Review</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inReview}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Resolved</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.resolved}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-medium">Rejected</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-400">
            <p className="text-gray-600 text-sm font-medium">High Priority</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.highPriority}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-400">
            <p className="text-gray-600 text-sm font-medium">Medium Priority</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.mediumPriority}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
            <p className="text-gray-600 text-sm font-medium">Low Priority</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.lowPriority}</p>
          </div>
        </div>
      ) : null}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Filter
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <TableSkeleton columns={7} rows={5} />
        ) : complaints.length === 0 ? (
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-600 text-lg">No complaints found</p>
            <p className="text-gray-500 text-sm mt-1">
              Customer complaints will appear here
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {currentItems.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {complaint.orderId?.orderNumber || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${complaint.orderId?.totalAmount?.toFixed(2) || "0.00"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{complaint.customerId?.name || "Unknown"}</div>
                        <div className="text-xs text-gray-500">{complaint.customerId?.email || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {complaint.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(
                            complaint.priority
                          )}`}
                        >
                          {complaint.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {complaint.status.toUpperCase().replace("-", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(complaint.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewComplaint(complaint)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(complaint._id)}
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
                itemsPerPage={itemsPerPage}
                totalItems={complaints.length}
              />
            )}
          </>
        )}
      </div>

      {/* View/Edit Complaint Modal */}
      {showModal && selectedComplaint && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedComplaint(null);
            setResponseText("");
          }}
          title="Complaint Details"
        >
          <div className="space-y-6">
            {/* Complaint Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Order Number</label>
                <p className="text-gray-900">{selectedComplaint.orderId?.orderNumber || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Customer</label>
                <p className="text-gray-900">{selectedComplaint.customerId?.name || "Unknown Customer"}</p>
                <p className="text-xs text-gray-500">{selectedComplaint.customerId?.email || "N/A"}</p>
                {selectedComplaint.customerId?.phone && (
                  <p className="text-xs text-gray-500">📞 {selectedComplaint.customerId.phone}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <span
                  className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                    selectedComplaint.priority
                  )}`}
                >
                  {selectedComplaint.priority.toUpperCase()}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <p className="text-gray-900 text-sm">{formatDate(selectedComplaint.createdAt)}</p>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <p className="text-gray-900 mt-1">{selectedComplaint.subject}</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <div
                className="mt-1 text-gray-900 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedComplaint.description }}
              />
            </div>

            {/* Attachments */}
            {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Attachments</label>
                <div className="flex flex-wrap gap-2">
                  {selectedComplaint.attachments.map((url, idx) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
                    return (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {isImage ? (
                          <img
                            src={url}
                            alt={`Attachment ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded border border-gray-300 hover:border-purple-500 transition"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-100 rounded border border-gray-300 hover:border-purple-500 transition flex flex-col items-center justify-center p-2">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-xs text-gray-500 mt-1">File</span>
                          </div>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="in-review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Response */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Response <span className="text-red-500">*</span>
              </label>
              <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>This response will be visible to the customer on their order page.</span>
                </p>
              </div>
              <TiptapEditor
                content={responseText}
                onChange={setResponseText}
                placeholder="Enter your response to the customer..."
              />
            </div>

            {/* Previous Response */}
            {selectedComplaint.respondedBy && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label className="text-sm font-medium text-green-900">Previous Response</label>
                <p className="text-xs text-green-700 mt-1">
                  By {selectedComplaint.respondedBy.name} on{" "}
                  {selectedComplaint.respondedAt && formatDate(selectedComplaint.respondedAt)}
                </p>
                <div
                  className="mt-2 text-green-900 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedComplaint.response || "" }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedComplaint(null);
                  setResponseText("");
                }}
                disabled={updating}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateComplaint}
                disabled={updating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Complaint"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
