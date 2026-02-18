"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { attendanceAPI } from "@/services/apiService";
import { TableSkeleton } from "@/components/Skeleton";
import toast from "react-hot-toast";

interface AttendanceRecord {
  userId: string;
  name: string;
  email: string;
  role: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: number;
  attendanceId: string | null;
}

export default function AttendancePage() {
  const { user: currentUser, role, status } = useAuth(["admin", "manager", "staff"]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [realUserId, setRealUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Update current date every second
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Extract real user ID from JWT token
    if (currentUser?.accessToken) {
      try {
        const tokenPayload = JSON.parse(atob(currentUser.accessToken.split('.')[1]));
        setRealUserId(tokenPayload.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [currentUser]);

  // Ensure staff users always view today's date
  useEffect(() => {
    if (role === "staff") {
      const today = new Date().toISOString().split("T")[0];
      setSelectedDate(today);
    }
  }, [role]);

  useEffect(() => {
    if (status === "authenticated" && currentUser && realUserId) {
      fetchAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, realUserId, role]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      // Staff users fetch only their own attendance
      if (role === "staff") {
        const response = await attendanceAPI.getMyAttendance(selectedDate);
        // Wrap single record in array for consistency
        setAttendanceRecords([response.data.data]);
      } else {
        // Admin and manager fetch all attendance records
        const response = await attendanceAPI.getAttendanceByDate(selectedDate);
        setAttendanceRecords(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (userId: string) => {
    try {
      await attendanceAPI.checkIn(userId, selectedDate);
      toast.success("Checked in successfully");
      fetchAttendance();
    } catch (error: any) {
      console.error("Error checking in:", error);
      const message = error.response?.data?.message || "Failed to check in";
      toast.error(message);
    }
  };

  const handleCheckOut = async (userId: string) => {
    try {
      await attendanceAPI.checkOut(userId, selectedDate);
      toast.success("Checked out successfully");
      fetchAttendance();
    } catch (error: any) {
      console.error("Error checking out:", error);
      const message = error.response?.data?.message || "Failed to check out";
      toast.error(message);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Filter attendance records based on search term - Memoized to prevent re-renders
  const sortedRecords = useMemo(() => {
    // Filter by search term
    const filtered = attendanceRecords.filter((record) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        record.name.toLowerCase().includes(searchLower) ||
        record.email.toLowerCase().includes(searchLower) ||
        record.role.toLowerCase().includes(searchLower)
      );
    });

    // For staff, only show their own record
    const accessible = role === "staff" 
      ? filtered.filter(record => record.userId === realUserId)
      : filtered;

    // Sort records to show logged-in user first
    return [...accessible].sort((a, b) => {
      if (a.userId === realUserId) return -1;
      if (b.userId === realUserId) return 1;
      return 0;
    });
  }, [attendanceRecords, searchTerm, role, realUserId]);

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="bg-purple-200 rounded-xl shadow-lg p-6 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="h-6 w-48 bg-purple-300 rounded mb-2"></div>
              <div className="h-8 w-64 bg-purple-300 rounded"></div>
            </div>
            <div className="h-10 w-40 bg-purple-300 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <TableSkeleton rows={8} columns={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Attendance Management</h1>
            <p className="text-purple-100 mt-2 text-base md:text-lg">
              {formatDate(currentDate)}
            </p>
            <p className="text-purple-200 text-sm mt-1">
              Current Time: {formatDateTime(currentDate)}
            </p>
          </div>
          {role !== "staff" && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="px-4 py-2 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      {/* Search Bar - Only for admin and manager */}
      {role !== "staff" && (
        <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Employee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Check In</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Check Out</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Total Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedRecords.length > 0 ? (
                sortedRecords.map((record) => (
                  <tr
                    key={record.userId}
                    className={`transition-colors ${
                      record.userId === realUserId
                        ? "bg-linear-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${
                          record.userId === realUserId
                            ? "bg-linear-to-br from-purple-600 to-indigo-600 text-white"
                            : "bg-linear-to-br from-purple-100 to-indigo-100 text-purple-600"
                        }`}>
                          {record.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {record.name}
                            {record.userId === realUserId && (
                              <span className="ml-2 text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{record.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                        {record.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center space-y-2">
                        {record.checkIn ? (
                          <span className="text-sm font-semibold text-green-600">
                            {formatTime(record.checkIn)}
                          </span>
                        ) : realUserId === record.userId ? (
                          <button
                            onClick={() => handleCheckIn(record.userId)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition flex items-center space-x-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                              />
                            </svg>
                            <span>Check In</span>
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center space-y-2">
                        {record.checkOut ? (
                          <span className="text-sm font-semibold text-red-600">
                            {formatTime(record.checkOut)}
                          </span>
                        ) : record.checkIn && realUserId === record.userId ? (
                          <button
                            onClick={() => handleCheckOut(record.userId)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition flex items-center space-x-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            <span>Check Out</span>
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {record.totalHours > 0 ? (
                          <span className="inline-block px-4 py-2 text-sm font-bold rounded-lg bg-linear-to-r from-purple-100 to-indigo-100 text-purple-700">
                            {record.totalHours.toFixed(2)} hrs
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? `No employees found matching "${searchTerm}"` : "No employees found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats - Only for admin and manager */}
      {role !== "staff" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {attendanceRecords.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Present Today</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {attendanceRecords.filter((r) => r.checkIn).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Checked Out</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {attendanceRecords.filter((r) => r.checkOut).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
