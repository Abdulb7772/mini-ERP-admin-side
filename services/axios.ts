import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token from NextAuth session
axiosInstance.interceptors.request.use(
  async (config) => {
    console.log("🔍 [Axios] Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    if (typeof window !== 'undefined') {
      const session = await getSession();
      console.log("🔍 [Axios] Session exists:", !!session);
      console.log("🔍 [Axios] Session user:", session?.user?.email);
      console.log("🔍 [Axios] Access token exists:", !!session?.user?.accessToken);
      
      if (session?.user?.accessToken) {
        config.headers.Authorization = `Bearer ${session.user.accessToken}`;
        console.log("✅ [Axios] Authorization header added");
      } else {
        console.warn("⚠️ [Axios] No access token found in session");
      }
    }
    return config;
  },
  (error) => {
    console.error("❌ [Axios] Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ [Axios] Response received:", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      dataKeys: Object.keys(response.data || {})
    });
    return response;
  },
  (error) => {
    console.error("❌ [Axios] Response error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      url: error.config?.url,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.warn("⚠️ [Axios] Unauthorized - redirecting to login");
      if (typeof window !== 'undefined') {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
