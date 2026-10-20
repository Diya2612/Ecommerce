import type { JwtPayload } from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import { supabase } from "@/lib/supabase";

export interface DecodedToken extends JwtPayload {
  user_id?: string;
  email?: string;
  name?: string;
  roles?: string[];
  permissions?: string[];
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * @deprecated Use Supabase session directly via useAuth() hook instead
 * This function is kept for backward compatibility only
 */
export const getLoggedInUser = async (): Promise<DecodedToken | null> => {
  try {
    // Get user from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) return null;

    const decoded = jwtDecode<DecodedToken>(session.access_token);

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      // Session expired, sign out
      await supabase.auth.signOut();
      return null;
    }

    return decoded;
  } catch (_error) {
    return null;
  }
};

// Helper to get user from Supabase session
export const getSupabaseUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

