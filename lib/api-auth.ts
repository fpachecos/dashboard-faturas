import type { NextApiRequest } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a Supabase client for server-side auth
function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'faturas',
    },
  });
}

// Get user ID from API request
export async function getUserIdFromRequest(req: NextApiRequest): Promise<string | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    // Get auth token from request headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

// Get user ID from request (tries both methods)
export async function getUserId(req: NextApiRequest): Promise<string | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  try {
    // First try Authorization header (for API calls from frontend)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        return user.id;
      }
    }

    // Fallback: try to get session from cookies (for browser requests)
    // Supabase stores the access token in cookies with the name: sb-<project-ref>-auth-token
    // We need to extract it and use it to get the user
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      // Parse cookies
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = decodeURIComponent(value);
        return acc;
      }, {} as Record<string, string>);

      // Find Supabase auth token cookie (format: sb-<project-ref>-auth-token)
      const authTokenKey = Object.keys(cookies).find(key => 
        key.startsWith('sb-') && key.endsWith('-auth-token')
      );

      if (authTokenKey) {
        try {
          // The cookie contains a JSON string with the session data
          const sessionData = JSON.parse(cookies[authTokenKey]);
          if (sessionData?.access_token) {
            const { data: { user }, error } = await supabase.auth.getUser(sessionData.access_token);
            if (!error && user) {
              return user.id;
            }
          }
        } catch (parseError) {
          // Cookie might not be valid JSON, try alternative approach
          console.warn('Could not parse auth token from cookie');
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

