// client/src/lib/queryClient.ts
import { QueryClient, QueryFunction, useQuery } from "@tanstack/react-query";

//
// 1) Centralize your API base URL
//
const API_BASE = import.meta.env.VITE_API_BASE;

//
// 2) Core fetch+JSON+error+credentials helper
//
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T>(
  method: string,
  path: string,
  data?: unknown
): Promise<T> {
  if (!API_BASE) {
    throw new Error("Missing VITE_API_BASE in your .env");
  }

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json() as Promise<T>;
}

//
// 3) Generic Query-Function factory
//
export type UnauthorizedBehavior = "returnNull" | "throw";

export function getQueryFn<T>(
  opts: { on401: UnauthorizedBehavior }
): QueryFunction<T> {
  const { on401 } = opts;
  return async ({ queryKey }) => {
    const path = queryKey[0] as string;

    // 👇 Important: Skip known keys that do not need this!
    if (path.startsWith("/podcasts/professor/")) {
      throw new Error(
        "queryClient: do not call /podcasts/professor here — use Supabase client directly"
      );
    }

    if (!API_BASE) {
      throw new Error("Missing VITE_API_BASE in your .env");
    }

    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
    });

    if (res.status === 401 && on401 === "returnNull") {
      return null as any;
    }

    await throwIfResNotOk(res);
    return (await res.json()) as T;
  };
}

//
// 4) Instantiate your QueryClient
//
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

//
// 5) A small `useSession()` hook that gracefully returns `null` on 401
//
export function useSession() {
  return useQuery<{ id: number; email: string } | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: Infinity,
  });
}
