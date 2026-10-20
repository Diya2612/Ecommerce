import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { setLoggedInUser } from '@/utils/auth';
import { notifyError } from '@/utils';
import { ROUTES } from '@/lib/constants';
import { ENV } from '@/lib/config/env';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from Supabase (automatically handled)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          throw new Error('No session found. Please try logging in again.');
        }

        // Sync user to backend database
        try {
          // Use centralized configuration
          const response = await fetch(`${ENV.API_BASE_URL}auth/sync-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              name: session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                `${session.user.user_metadata?.firstName || ''} ${session.user.user_metadata?.lastName || ''}`.trim() ||
                session.user.email?.split('@')[0],
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to sync user to database');
          }
        } catch (syncError) {
          console.error('User sync failed:', syncError);
          // Continue with login even if sync fails
          // The sync will happen on next authenticated request
        }

        // Session is automatically managed by Supabase
        // Store user data for legacy compatibility (optional)
        if (session.user) {
          const user = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              `${session.user.user_metadata?.firstName || ''} ${session.user.user_metadata?.lastName || ''}`.trim() ||
              session.user.email || '',
            role: 'user',
            permissions: [],
          };
          setLoggedInUser(user);
        }

        // Redirect to the original destination or dashboard
        const from = (location.state as any)?.from || ROUTES.DASHBOARD;
        navigate(from, { replace: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        setError(message);
        notifyError(message);

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate(ROUTES.AUTH.LOGIN, { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, location]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0E042F] via-[#1a0f3e] to-[#0E042F]">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0E042F] via-[#1a0f3e] to-[#0E042F]">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-[#0E042F]" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we set up your account.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
