const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('healthlink_jwt_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API error: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson && (errorJson.error || errorJson.message)) {
        errorMessage = errorJson.error || errorJson.message;
      }
    } catch {
      // non-JSON error body
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export default apiRequest;
