'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axios from '@/services/axios';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import Input from '@/components/Input';
import {Skeleton} from '@/components/Skeleton';

interface Order {
  _id: string;
  orderNumber: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  walletBalance: number;
  isRefunded: boolean;
  refundedAt?: string;
  refundAmount?: number;
  refundDeclined?: boolean;
  refundDeclinedReason?: string;
  refundDeclinedAt?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface RefundStats {
  totalRefunds: number;
  totalRefundAmount: number;
}

interface RefundFormData {
  amount: number;
  reason: string;
}

export default function RefundManagementPage() {
  useAuth(["admin", "order_manager"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [refundForm, setRefundForm] = useState<RefundFormData>({
    amount: 0,
    reason: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/refund/orders', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          status: statusFilter,
        },
      });

      if (response.data.success) {
        setOrders(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/refund/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleOpenRefundModal = (order: Order) => {
    setSelectedOrder(order);
    setRefundForm({
      amount: order.totalAmount,
      reason: `Refund for order ${order.orderNumber}`,
    });
    setShowRefundModal(true);
  };

  const handleProcessRefund = async () => {
    if (!selectedOrder) return;

    if (!refundForm.amount || refundForm.amount <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    if (refundForm.amount > selectedOrder.totalAmount) {
      toast.error('Refund amount cannot exceed order total');
      return;
    }

    try {
      setProcessing(true);
      const response = await axios.post(`/refund/${selectedOrder._id}/process`, {
        amount: refundForm.amount,
        reason: refundForm.reason,
      });

      if (response.data.success) {
        toast.success('Refund processed successfully');
        setShowRefundModal(false);
        fetchOrders();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error processing refund:', error);
      toast.error(error.response?.data?.message || 'Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineRefund = async () => {
    if (!selectedOrder) return;

    if (!refundForm.reason) {
      toast.error('Please provide a reason for declining');
      return;
    }

    try {
      setDeclining(true);
      const response = await axios.post(`/refund/${selectedOrder._id}/decline`, {
        reason: refundForm.reason,
      });

      if (response.data.success) {
        toast.success('Refund declined successfully');
        setShowRefundModal(false);
        fetchOrders();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error declining refund:', error);
      toast.error(error.response?.data?.message || 'Failed to decline refund');
    } finally {
      setDeclining(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-600">Refund Management</h1>
        <p className="text-gray-600">Process refunds for paid orders and manage wallet credits</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Refunds Processed</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalRefunds}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Refund Amount</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalRefundAmount)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
          <Input
            label="Search"
            placeholder="Order number or customer name"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Order Status</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No paid orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{order.customerId?.name || 'N/A'}</div>
                        <div className="text-gray-500">{order.customerId?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {order.isRefunded ? (
                        <div className="text-sm">
                          <div className="text-green-600 font-medium">✓ Refunded</div>
                          <div className="text-gray-500 text-xs">
                            {formatCurrency(order.refundAmount || 0)}
                          </div>
                        </div>
                      ) : order.refundDeclined ? (
                        <div className="text-sm">
                          <div className="text-red-600 font-medium">✗ Declined</div>
                          <div className="text-gray-500 text-xs">
                            {order.refundDeclinedReason}
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenRefundModal(order)}
                        >
                          Process Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={orders.length}
            itemsPerPage={10}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Refund Modal */}
      {selectedOrder && (
        <Modal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          title="Process Refund"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Order Number</p>
                  <p className="font-medium">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Customer</p>
                  <p className="font-medium">{selectedOrder.customerId?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Order Total</p>
                  <p className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Current Wallet Balance</p>
                  <p className="font-medium text-blue-600">{selectedOrder.walletBalance} points</p>
                </div>
              </div>
            </div>

            <Input
              label="Refund Amount"
              type="number"
              value={refundForm.amount}
              onChange={(e) =>
                setRefundForm({ ...refundForm, amount: parseFloat(e.target.value) || 0 })
              }
              placeholder="Enter refund amount"
              required
            />

            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={refundForm.reason}
                onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                placeholder="Enter refund reason (optional)"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The refund amount will be added to the customer&apos;s wallet as
                points. These points can be used for future purchases.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowRefundModal(false)}
                disabled={processing || declining}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeclineRefund}
                loading={declining}
                disabled={processing || declining}
              >
                Decline Refund
              </Button>
              <Button
                variant="primary"
                onClick={handleProcessRefund}
                loading={processing}
                disabled={processing || declining}
              >
                Process Refund
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
