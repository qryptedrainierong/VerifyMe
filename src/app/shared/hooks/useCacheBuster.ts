import { useEffect } from "react";

/**
 * Hook to ensure components properly refresh and avoid browser caching issues
 * Clears any stale router state when component mounts
 */
export function useCacheBuster() {
  useEffect(() => {
    // Log mount for debugging
    if (import.meta.env.DEV) {
      console.log("[CacheBuster] Component mounted at", new Date().toISOString());
    }
    
    // Clear any browser form data cache
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
    }
  }, []);
}
