import axiosInstance from "./axios";

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    axiosInstance.post("/auth/login", { email, password }),
  
  register: (name: string, email: string, password: string, role?: string) =>
    axiosInstance.post("/auth/register", { name, email, password, role }),
  
  getMe: () => axiosInstance.get("/auth/me"),
};

// User APIs
export const userAPI = {
  getUsers: (params?: any) => axiosInstance.get("/users", { params }),
  createUser: (data: any) => axiosInstance.post("/users", data),
  updateUser: (id: string, data: any) => axiosInstance.put(`/users/${id}`, data),
  deleteUser: (id: string) => axiosInstance.delete(`/users/${id}`),
  toggleUserStatus: (id: string) => axiosInstance.patch(`/users/${id}/toggle-status`),
  resendVerificationEmail: (id: string) => axiosInstance.post(`/users/${id}/resend-verification`),
};

// Product APIs
export const productAPI = {
  getProducts: (params?: any) => axiosInstance.get("/products", { params }),
  getProduct: (id: string) => axiosInstance.get(`/products/${id}`),
  createProduct: (data: any) => axiosInstance.post("/products", data),
  updateProduct: (id: string, data: any) => axiosInstance.put(`/products/${id}`, data),
  deleteProduct: (id: string) => axiosInstance.delete(`/products/${id}`),
  updateProductStock: (id: string, stock: number) => 
    axiosInstance.patch(`/products/${id}/stock`, { stock }),
  updateVariationStock: (id: string, stock: number) => 
    axiosInstance.patch(`/products/variations/${id}/stock`, { stock }),
};

// Inventory APIs
export const inventoryAPI = {
  stockIn: (data: any) => axiosInstance.post("/inventory/stock-in", data),
  stockOut: (data: any) => axiosInstance.post("/inventory/stock-out", data),
  getLogs: (params?: any) => axiosInstance.get("/inventory/logs", { params }),
  getLowStock: (params?: any) => axiosInstance.get("/inventory/low-stock", { params }),
};

// Customer APIs
export const customerAPI = {
  getCustomers: (params?: any) => axiosInstance.get("/customers", { params }),
  getCustomer: (id: string) => axiosInstance.get(`/customers/${id}`),
  createCustomer: (data: any) => axiosInstance.post("/customers", data),
  updateCustomer: (id: string, data: any) => axiosInstance.put(`/customers/${id}`, data),
  deleteCustomer: (id: string) => axiosInstance.delete(`/customers/${id}`),
};

// Order APIs
export const orderAPI = {
  getOrders: (params?: any) => axiosInstance.get("/orders", { params }),
  getOrder: (id: string) => axiosInstance.get(`/orders/${id}`),
  createOrder: (data: any) => axiosInstance.post("/orders", data),
  updateOrderStatus: (id: string, status: string) =>
    axiosInstance.patch(`/orders/${id}/status`, { status }),
  updatePaymentStatus: (id: string, paymentStatus: string) =>
    axiosInstance.patch(`/orders/${id}/payment-status`, { paymentStatus }),
  cancelOrder: (id: string) => axiosInstance.post(`/orders/${id}/cancel`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => axiosInstance.get("/dashboard/stats"),
};

// Attendance APIs
export const attendanceAPI = {
  getAttendanceByDate: (date: string) => 
    axiosInstance.get("/attendance", { params: { date } }),
  getMyAttendance: (date: string) =>
    axiosInstance.get("/attendance/my-attendance", { params: { date } }),
  checkIn: (userId: string, date: string) => 
    axiosInstance.post("/attendance/check-in", { userId, date }),
  checkOut: (userId: string, date: string) => 
    axiosInstance.post("/attendance/check-out", { userId, date }),
  getHistory: (params?: any) => 
    axiosInstance.get("/attendance/history", { params }),
};

// About Us APIs
export const aboutUsAPI = {
  get: () => axiosInstance.get("/about-us"),
  post: (data: any) => axiosInstance.post("/about-us", data),
  put: (data: any) => axiosInstance.put("/about-us", data),
  delete: () => axiosInstance.delete("/about-us"),
};

// Blog APIs
export const blogAPI = {
  getBlogs: () => axiosInstance.get("/blogs"),
  getPublishedBlogs: () => axiosInstance.get("/blogs/published"),
  getBlog: (id: string) => axiosInstance.get(`/blogs/${id}`),
  createBlog: (data: any) => axiosInstance.post("/blogs", data),
  updateBlog: (id: string, data: any) => axiosInstance.put(`/blogs/${id}`, data),
  toggleBlogStatus: (id: string) => axiosInstance.patch(`/blogs/${id}/toggle-status`),
  deleteBlog: (id: string) => axiosInstance.delete(`/blogs/${id}`),
};

// Employee APIs
export const employeeAPI = {
  getEmployees: () => axiosInstance.get("/employees"),
  getActiveEmployees: () => axiosInstance.get("/employees/active"),
  getEmployee: (id: string) => axiosInstance.get(`/employees/${id}`),
  createEmployee: (data: any) => axiosInstance.post("/employees", data),
  updateEmployee: (id: string, data: any) => axiosInstance.put(`/employees/${id}`, data),
  toggleEmployeeStatus: (id: string) => axiosInstance.patch(`/employees/${id}/toggle-status`),
  deleteEmployee: (id: string) => axiosInstance.delete(`/employees/${id}`),
};

// Complaint APIs
export const complaintAPI = {
  getComplaints: (params?: any) => axiosInstance.get("/complaints", { params }),
  getComplaint: (id: string) => axiosInstance.get(`/complaints/${id}`),
  updateComplaintStatus: (id: string, data: any) => axiosInstance.put(`/complaints/${id}`, data),
  deleteComplaint: (id: string) => axiosInstance.delete(`/complaints/${id}`),
  getComplaintStats: () => axiosInstance.get("/complaints/stats"),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (unreadOnly?: boolean) => 
    axiosInstance.get("/notifications", { params: { unreadOnly: unreadOnly ? "true" : "false" } }),
  markAsRead: (id: string) => axiosInstance.patch(`/notifications/${id}/read`),
  markAllAsRead: () => axiosInstance.patch("/notifications/mark-all-read"),
  deleteNotification: (id: string) => axiosInstance.delete(`/notifications/${id}`),
};

// Review APIs
export const reviewAPI = {
  getReviews: (params?: any) => axiosInstance.get("/reviews", { params }),
  getReview: (id: string) => axiosInstance.get(`/reviews/${id}`),
  updateReviewStatus: (id: string, data: any) => axiosInstance.patch(`/reviews/${id}/status`, data),
  deleteReview: (id: string) => axiosInstance.delete(`/reviews/${id}`),
  addReply: (id: string, reply: string) => axiosInstance.post(`/reviews/${id}/reply`, { reply }),
  deleteReply: (id: string) => axiosInstance.delete(`/reviews/${id}/reply`),
};

// Team APIs
export const teamAPI = {
  getTeams: () => axiosInstance.get("/teams"),
  getTeam: (id: string) => axiosInstance.get(`/teams/${id}`),
  createTeam: (data: any) => axiosInstance.post("/teams", data),
  updateTeam: (id: string, data: any) => axiosInstance.put(`/teams/${id}`, data),
  deleteTeam: (id: string) => axiosInstance.delete(`/teams/${id}`),
  toggleTeamStatus: (id: string) => axiosInstance.patch(`/teams/${id}/toggle-status`),
};
