import { useEffect } from "react";
import useSWR, { mutate } from "swr";
import { useAuth0 } from "@auth0/auth0-react";

// Get API base URL from environment variable
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Default fetcher function for SWR
const defaultFetcher = async (
  url: string,
  token?: string,
  authProvider: string = "auth0"
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if token is provided
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    // Add Auth-Provider header to specify which authentication system to use
    headers["Auth-Provider"] = authProvider;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, { headers });

  // Handle error responses
  if (!response.ok) {
    const error = new Error(
      "An error occurred while fetching the data."
    ) as ApiError;
    const info = await response.json().catch(() => ({}));
    error.status = response.status;
    error.info = info;
    throw error;
  }

  return response.json();
};

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  authProvider?: "auth0" | "supabase" | "pocketbase";
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
  fetch: async (path: string, options: FetchOptions = {}, token?: string) => {
    const {
      method = "GET",
      body,
      headers = {},
      authProvider = "auth0",
    } = options;

    // Create request headers with Authorization if token is provided
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
      requestHeaders["Auth-Provider"] = authProvider;
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
    getInstitutions: async (
      countryCode: string = "GB",
      token?: string,
      authProvider: string = "auth0"
    ) => {
      return apiClient.fetch(
        `/api/banking/institutions?country=${countryCode}`,
        { authProvider },
        token
      );
    },

    /**
     * Initiate a bank connection
     */
    initiateConnection: async (
      data: {
        institution_id: string;
        redirect_url: string;
      },
      token?: string,
      authProvider: string = "auth0"
    ) => {
      // Call the API endpoint to initiate the bank connection
      return apiClient.fetch(
        `/api/banking/link/initiate?institution_id=${
          data.institution_id
        }&redirect_url=${encodeURIComponent(data.redirect_url)}`,
        {
          method: "POST",
          authProvider,
        },
        token
      );
    },

    /**
     * Complete the bank connection after the user has authenticated
     */
    completeConnection: async (
      ref: string,
      token?: string,
      authProvider: string = "auth0"
    ) => {
      // Call the API endpoint to complete the bank connection
      return apiClient.fetch(
        `/api/banking/link/callback?ref=${encodeURIComponent(ref)}`,
        { authProvider },
        token
      );
    },

    /**
     * Get user's connected accounts
     */
    getAccounts: async (token?: string, authProvider: string = "auth0") => {
      return apiClient.fetch(`/api/banking/accounts`, { authProvider }, token);
    },

    /**
     * Get transactions for an account
     */
    getTransactions: async (
      accountId: string,
      params: {
        months?: number;
      } = {},
      token?: string,
      authProvider: string = "auth0"
    ) => {
      const searchParams = new URLSearchParams();

      if (params.months)
        searchParams.append("months", params.months.toString());

      const queryString = searchParams.toString();
      const path = `/api/banking/transactions?account_id=${accountId}${
        queryString ? `&${queryString}` : ""
      }`;

      return apiClient.fetch(path, { authProvider }, token);
    },

    /**
     * Check if a user has connected any bank accounts
     */
    hasConnectedBank: async (
      token?: string,
      authProvider: string = "auth0"
    ) => {
      try {
        const accounts = await apiClient.banking.getAccounts(
          token,
          authProvider
        );
        return Array.isArray(accounts) && accounts.length > 0;
      } catch (error) {
        console.error("Error checking connected banks:", error);
        return false;
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
    getSummary: async (
      months = 12,
      token?: string,
      authProvider: string = "auth0"
    ) => {
      return apiClient.fetch(
        `/api/statistics/summary?months=${months}`,
        { authProvider },
        token
      );
    },

    /**
     * Get spending chart data for visualization
     */
    getSpendingChart: async (
      category = "all",
      token?: string,
      authProvider: string = "auth0"
    ) => {
      return apiClient.fetch(
        `/api/statistics/spending/chart?category=${category}`,
        { authProvider },
        token
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
    getProfile: async (
      userId: string,
      token?: string,
      authProvider: string = "auth0"
    ) => {
      return apiClient.fetch(`/api/users/${userId}`, { authProvider }, token);
    },

    /**
     * Update user profile
     */
    updateProfile: async (
      userId: string,
      data: any,
      token?: string,
      authProvider: string = "auth0"
    ) => {
      return apiClient.fetch(
        `/api/users/${userId}`,
        {
          method: "PATCH",
          body: data,
          authProvider,
        },
        token
      );
    },

    /**
     * Update bank connection status
     */
    updateBankConnectionStatus: async (
      userId: string,
      hasConnected: boolean,
      token?: string,
      authProvider: string = "auth0"
    ) => {
      return apiClient.fetch(
        `/api/users/${userId}/bank-connection`,
        {
          method: "PATCH",
          body: { has_connected_bank: hasConnected },
          authProvider,
        },
        token
      );
    },
  },

  /**
   * AI endpoints
   */
  ai: {
    /**
     * Get AI-powered financial insights for a user
     */
    getInsights: async (token?: string, authProvider: string = "auth0") => {
      return apiClient.fetch(
        `/api/ai/insights`,
        {
          method: "POST",
          authProvider,
        },
        token
      );
    },

    /**
     * Get expert tips based on spending patterns
     */
    getExpertTips: async (token?: string, authProvider: string = "auth0") => {
      return apiClient.fetch(`/api/ai/expert-tips`, { authProvider }, token);
    },

    /**
     * Get deals and savings for a specific category
     */
    getDeals: async (
      category: string,
      token?: string,
      authProvider: string = "auth0"
    ) => {
      return apiClient.fetch(
        `/api/ai/deals?category=${encodeURIComponent(category)}`,
        { authProvider },
        token
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
    authProvider?: "auth0" | "supabase" | "pocketbase";
  } = {}
) {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const authProvider = options.authProvider || "auth0";

  // Set default SWR options
  const swrOptions = {
    revalidateOnFocus: options.revalidateOnFocus !== false,
    revalidateOnReconnect: options.revalidateOnReconnect !== false,
    refreshInterval: options.refreshInterval || 0,
    shouldRetryOnError: options.shouldRetryOnError !== false,
  };

  // Define the fetcher function that includes the auth token
  const fetcherWithAuth = async (url: string) => {
    // If user is authenticated, get token and include it in the request
    if (isAuthenticated && !isLoading) {
      try {
        const token = await getAccessTokenSilently();
        return defaultFetcher(url, token, authProvider);
      } catch (error) {
        console.error("Error getting access token:", error);
        throw error;
      }
    }

    // If not authenticated, make request without token
    return defaultFetcher(url);
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
  return mutate(path);
}

export default useApi;
