import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple request interceptor
instance.interceptors.request.use(
  (config) => {
    try {
      // Add token if available
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Handle FormData
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
    } catch (err) {
      console.log("Error in request interceptor");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Ultra-minimal response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors without any logging
    try {
      const status = error?.response?.status;
      if (status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    } catch (e) {
      // Silent catch
    }

    return Promise.reject(error);
  }
);

export default instance;
