import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🛡️ GLOBAL ERROR INTERCEPTOR
// This automatically catches any backend error and displays a "Beautiful & Descriptive" Toast
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // 1. Handle our custom "ResumeMaxxingException" format
    if (data?.status === 'error' && data?.message) {
      toast.error(data.message, {
        description: data.code ? `Error Code: ${data.code}` : undefined,
        duration: 5000,
      });
    } 
    // 2. Handle standard FastAPI Validation Errors (422)
    else if (status === 422) {
      toast.error("DATA_VALIDATION_ERROR", {
        description: "Please check your input format and try again.",
      });
    }
    // 3. Handle System Level Errors (500, 404, etc)
    else {
      toast.error(data?.detail || "An unexpected network error occurred.", {
        description: `Status: ${status || 'Network Failure'}`,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
