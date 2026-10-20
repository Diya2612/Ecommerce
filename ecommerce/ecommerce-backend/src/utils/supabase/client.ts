import { createClient } from '@supabase/supabase-js';
import { logger } from '../logging/logger';

const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

// Resolve environment variables, supporting both Cloud (Publishable/Secret) and local CLI (Anon/ServiceRole) keys
const supabasePublicKey =
  process.env.SUPABASE_PUBLISHABLE_KEY || // New format (Supabase Cloud)
  process.env.SUPABASE_ANON_KEY; // Legacy format (Local CLI)

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY || // New format (Supabase Cloud)
  process.env.SUPABASE_SERVICE_ROLE_KEY; // Legacy format (Local CLI)

if (!supabasePublicKey || !supabaseSecretKey) {
  throw new Error(
    'Missing Supabase environment variables. Need either (PUBLISHABLE_KEY + SECRET_KEY) or (ANON_KEY + SERVICE_ROLE_KEY)',
  );
}

/**
 * Service Role Client
 * Bypasses RLS. Intended for internal system jobs or elevated admin-level tasks.
 */
export const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Anonymous Client
 * Subject to RLS policies. Generally used for typical unauthenticated or pre-authenticated flows.
 */
export const supabaseAnon = createClient(supabaseUrl, supabasePublicKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

logger.info('Supabase clients initialized', {
  url: supabaseUrl,
  hasSecretKey: true,
  hasPublicKey: true,
  keyType: process.env.SUPABASE_PUBLISHABLE_KEY ? 'new (platform)' : 'legacy (CLI)',
});
