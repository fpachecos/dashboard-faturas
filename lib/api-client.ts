import { supabase } from './supabase';

// Get authentication headers for API requests
export async function getAuthHeaders(): Promise<HeadersInit> {
  if (!supabase) {
    return {};
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return {};
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return {};
  }
}

// Fetch with authentication
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = await getAuthHeaders();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Redirect to login if unauthorized
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return response;
}

