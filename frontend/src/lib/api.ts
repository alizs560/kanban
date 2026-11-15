import { getStoredToken } from "./auth";

/**
 * Creates headers with bearer authorization token if present.
 */
export function getAuthHeaders(extraHeaders?: HeadersInit): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (extraHeaders) {
    if (extraHeaders instanceof Headers) {
      extraHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(extraHeaders)) {
      extraHeaders.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, extraHeaders);
    }
  }

  return headers;
}

/**
 * Wrapper around fetch that automatically includes bearer token header.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = getAuthHeaders(init?.headers);
  return fetch(input, {
    ...init,
    headers,
  });
}
