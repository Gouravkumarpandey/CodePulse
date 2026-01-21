import { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { handleGoogleOAuthCallback } from '../utils/google-auth';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = handleGoogleOAuthCallback();
        if (result.success && result.code) {
          // Exchange code for tokens/user info via backend
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: result.code, state: result.state }),
          });
          const data = await response.json();
          if (response.ok && data.data) {
            login(data.data.user, data.data.token);
            setTimeout(() => {
              if (data.data.user.role === 'ADMIN') {
                navigate('/admin', { replace: true });
              } else {
                navigate('/user', { replace: true });
              }
            }, 100);
          } else {
            console.error('Backend returned error:', data);
            setError(data.message || 'Authentication failed');
            setTimeout(() => navigate('/login?error=auth_failed', { replace: true }), 2000);
          }
        } else {
          console.error('No valid result from Google redirect:', result);
          setError(result.error || 'Failed to get user information from Google');
          setTimeout(() => navigate('/login?error=auth_failed', { replace: true }), 2000);
        }
      } catch (err) {
        console.error('Error in Google callback:', err);
        setError('An unexpected error occurred');
        setTimeout(() => navigate('/login?error=auth_failed', { replace: true }), 2000);
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        {error ? (
          <>
            <div className="mb-4 text-red-600 text-lg font-semibold">{error}</div>
            <p className="text-gray-600">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 text-lg">Completing Google sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}
