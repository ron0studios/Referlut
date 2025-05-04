import useSWR from "swr";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("Missing environment variable VITE_API_BASE_URL");
}

export async function fetcher(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  return res.json();
}

export function useApi<T = unknown>(path: string, options?: RequestInit) {
  const { data, error } = useSWR<T>(path, () => fetcher(path, options));
  return { data, error, isLoading: !error && !data };
}
