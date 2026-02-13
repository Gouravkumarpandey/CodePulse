/**
 * Initiate Google OAuth 2.0 flow (standard, not Firebase)
 * Redirects user to Google OAuth consent screen
 */
export const signInWithGoogle = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
  const scope = 'openid email profile';
  const responseType = 'code';
  const state = Math.random().toString(36).substring(2); // Optional: for CSRF protection
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=${responseType}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${state}`;
  window.location.href = url;
};

/**
 * Handle Google OAuth 2.0 callback (extract code from URL)
 * Returns { code, state } if present, else error
 */
export const handleGoogleOAuthCallback = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  if (code) {
    return { success: true, code, state };
  } else {
    return { success: false, error: params.get('error') || 'No code found in callback' };
  }
};

export const handleGoogleCallback = async (code: string) => {
  try {
    // Send the code to your backend to exchange for access token
    // The backend will handle the token exchange using the client secret
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Google');
    }

    const data = await response.json();

    // Store the token and user data
    sessionStorage.setItem('token', data.data.token);
    sessionStorage.setItem('user', JSON.stringify(data.data.user));

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

export const fetchGoogleUser = async (accessToken: string) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch user');

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching Google user:', error);
    return null;
  }
};
