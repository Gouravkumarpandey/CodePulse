import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { handleGoogleCallback } from '../utils/google-auth';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      handleGoogleCallback(code).then((result) => {
        if (result.success && result.data) {
          login(result.data.user, result.data.token);
          
          // Redirect based on role
          if (result.data.user.role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/user');
          }
        } else {
          console.error('Google authentication failed:', result.error);
          navigate('/login?error=auth_failed');
        }
      });
    } else {
      const error = searchParams.get('error');
      console.error('Google OAuth error:', error);
      navigate('/login?error=oauth_cancelled');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-700 text-lg">Completing Google sign in...</p>
      </div>
    </div>
  );
}
