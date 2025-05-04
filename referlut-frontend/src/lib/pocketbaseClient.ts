import PocketBase from "pocketbase";

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL;

// Create a PocketBase client if the URL is set
export const pocketbase = POCKETBASE_URL
  ? new PocketBase(POCKETBASE_URL)
  : null;

// Check if PocketBase is properly configured
if (!POCKETBASE_URL) {
  console.warn(
    "PocketBase URL not configured. Set VITE_POCKETBASE_URL in your environment to enable PocketBase integration."
  );
}

/**
 * Get the current PocketBase auth token
 */
export const getPocketbaseToken = () => {
  if (!pocketbase) return null;
  return pocketbase.authStore.token;
};

/**
 * Clear the PocketBase auth session
 */
export const clearPocketbaseAuth = () => {
  if (pocketbase) {
    pocketbase.authStore.clear();
  }
};

export default pocketbase;
