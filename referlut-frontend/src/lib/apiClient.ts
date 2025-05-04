import { useEffect, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { useSupabaseAuth } from "@/components/auth/SupabaseAuth";
import { getAccessToken, supabase } from "@/lib/supabaseClient";

// Get API base URL from environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Default fetcher function for SWR
const defaultFetcher = async (url: string, token?: string) => {
  // Automatically get the latest auth token if not provided
  const authToken = token || (await getAccessToken());

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if token is available
  if (authToken) {
    // Ensure we're using the correct Bearer format
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, { headers });

  // Handle error responses
  if (!response.ok) {
    const error = new Error(
      "An error occurred while fetching the data."
    ) as ApiError;
    try {
      const info = await response.json();
      error.status = response.status;
      error.info = info;
      console.error("API Error:", error.status, info);

      // Handle authentication errors by attempting to refresh the token
      if (
        error.status === 401 ||
        (error.info?.detail &&
          error.info.detail.includes("Authentication failed"))
      ) {
        console.log("Authentication error detected, refreshing session...");
        // Refresh the session
        const { data } = await supabase.auth.refreshSession();
        if (data.session) {
          console.log("Session refreshed successfully");
          // Retry the request with the new token
          return defaultFetcher(url);
        }
      }
    } catch (e) {
      error.status = response.status;
      error.info = { message: await response.text() };
    }
    throw error;
  }

  return response.json();
};

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
}

// Error type for API errors
interface ApiError extends Error {
  status?: number;
  info?: any;
}

/**
 * API client for making authenticated requests to the backend
 */
export const apiClient = {
  /**
   * Make a fetch request to the API
   */
  fetch: async (path: string, options: FetchOptions = {}) => {
    const { method = "GET", body, headers = {} } = options;

    // Get the latest auth token automatically
    const token = await getAccessToken();

    // Create request headers with Authorization if token is provided
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for non-GET requests
    if (method !== "GET" && body) {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Request failed with status ${response.status}`
        );
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error(`API request failed: ${path}`, error);
      throw error;
    }
  },

  /**
   * Banking API endpoints
   */
  banking: {
    /**
     * Get list of available banking institutions
     */
    getInstitutions: async (countryCode: string = "GB") => {
      return apiClient.fetch(
        `/api/banking/institutions?country=${countryCode}`
      );
    },

    /**
     * Initiate a bank connection
     */
    initiateConnection: async (data: {
      institution_id: string;
      redirect_url: string;
    }) => {
      // Call the API endpoint to initiate the bank connection
      return apiClient.fetch(
        `/api/banking/link/initiate?institution_id=${
          data.institution_id
        }&redirect_url=${encodeURIComponent(data.redirect_url)}`,
        {
          method: "POST",
        }
      );
    },

    /**
     * Complete the bank connection after the user has authenticated
     */
    completeConnection: async (ref: string) => {
      // Call the API endpoint to complete the bank connection
      return apiClient.fetch(
        `/api/banking/link/callback?ref=${encodeURIComponent(ref)}`
      );
    },

    /**
     * Get user's connected accounts
     */
    getAccounts: async () => {
      return apiClient.fetch(`/api/banking/accounts`);
    },

    /**
     * Get user's bank connection status
     */
    getBankStatus: async () => {
      return apiClient.fetch(`/api/banking/status`);
    },

    /**
     * Get transactions for an account
     */
    getTransactions: async (
      accountId: string,
      params: {
        months?: number;
      } = {}
    ) => {
      const searchParams = new URLSearchParams();

      if (params.months)
        searchParams.append("months", params.months.toString());

      const queryString = searchParams.toString();
      const path = `/api/banking/transactions?account_id=${accountId}${
        queryString ? `&${queryString}` : ""
      }`;

      return apiClient.fetch(path);
    },

    /**
     * Check if a user has connected any bank accounts
     */
    hasConnectedBank: async () => {
      try {
        const status = await apiClient.banking.getBankStatus();
        return status.has_connected_bank;
      } catch (error) {
        console.error("Error checking bank connection status:", error);

        // As a fallback, try to check if there are any accounts
        try {
          const accounts = await apiClient.banking.getAccounts();
          return Array.isArray(accounts) && accounts.length > 0;
        } catch (accountError) {
          console.error("Error checking connected banks:", accountError);
          return false;
        }
      }
    },
  },

  /**
   * Statistics API endpoints
   */
  statistics: {
    /**
     * Get financial statistics summary for a user
     */
    getSummary: async (months = 12) => {
      return apiClient.fetch(`/api/statistics/summary?months=${months}`);
    },

    /**
     * Get spending chart data for visualization
     */
    getSpendingChart: async (category = "all") => {
      return apiClient.fetch(
        `/api/statistics/spending/chart?category=${category}`
      );
    },
  },

  /**
   * User management endpoints
   */
  users: {
    /**
     * Get user profile
     */
    getProfile: async () => {
      return apiClient.fetch(`/api/users/profile`);
    },

    /**
     * Update user profile
     */
    updateProfile: async (userId: string, data: any) => {
      return apiClient.fetch(`/api/users/${userId}`, {
        method: "PATCH",
        body: data,
      });
    },

    /**
     * Update bank connection status manually
     */
    updateBankStatus: async (hasConnected: boolean) => {
      return apiClient.fetch(`/api/users/update-bank-status`, {
        method: "PATCH",
        body: { has_connected_bank: hasConnected },
      });
    },
  },

  /**
   * AI endpoints
   */
  ai: {
    /**
     * Get AI-powered financial insights for a user
     */
    getInsights: async () => {
      return apiClient.fetch(`/api/ai/insights`, {
        method: "POST",
      });
    },

    /**
     * Get expert tips based on spending patterns
     */
    getExpertTips: async () => {
      return apiClient.fetch(`/api/ai/expert-tips`);
    },

    /**
     * Get deals and savings for a specific category
     */
    getDeals: async (category: string) => {
      return apiClient.fetch(
        `/api/ai/deals?category=${encodeURIComponent(category)}`
      );
    },
  },
};

/**
 * Custom hook for making authenticated API requests with SWR
 */
export function useApi<T = any>(
  path: string,
  options: {
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    refreshInterval?: number;
    shouldRetryOnError?: boolean;
  } = {}
) {
  const { isAuthenticated, isLoading } = useSupabaseAuth();

  // Set default SWR options
  const swrOptions = {
    revalidateOnFocus: options.revalidateOnFocus !== false,
    revalidateOnReconnect: options.revalidateOnReconnect !== false,
    refreshInterval: options.refreshInterval || 0,
    shouldRetryOnError: options.shouldRetryOnError !== false,
  };

  // Define the fetcher function that includes the auth token
  const fetcherWithAuth = async (url: string) => {
    // Always get the latest token when making requests
    const token = await getAccessToken();
    return defaultFetcher(url, token);
  };

  // Use SWR hook with our custom fetcher
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<T>(path, fetcherWithAuth, swrOptions);

  // Refresh data when authentication state changes
  useEffect(() => {
    if (!isLoading) {
      revalidate();
    }
  }, [isAuthenticated, isLoading, revalidate]);

  return {
    data,
    error,
    isLoading: !error && !data,
    isError: !!error,
    revalidate,
  };
}

/**
 * Invalidate cached data for a specific path
 */
export function invalidateCache(path: string) {
  mutate(path);
}

export default useApi;
