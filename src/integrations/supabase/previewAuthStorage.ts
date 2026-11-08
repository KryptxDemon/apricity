// Clean browser-safe auth storage for Supabase without iframe or external broker dependencies.
import type { SupportedStorage } from "@supabase/supabase-js";

export function createBrowserAuthStorage(): SupportedStorage {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    // Memory fallback during SSR
    const memoryStore = new Map<string, string>();
    return {
      getItem: (key: string) => memoryStore.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memoryStore.set(key, value);
      },
      removeItem: (key: string) => {
        memoryStore.delete(key);
      },
    };
  }

  return {
    getItem: (key: string) => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Handle storage quota or private browsing exceptions safely
      }
    },
    removeItem: (key: string) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Safe no-op
      }
    },
  };
}

export const browserAuthStorage = createBrowserAuthStorage;
