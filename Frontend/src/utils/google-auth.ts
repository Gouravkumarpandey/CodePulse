import { signInWithPopup, UserCredential } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

/**
 * Initiate Google OAuth using Firebase Authentication
 * This opens a popup for Google sign-in
 */
export const initiateGoogleOAuth = async () => {
  try {
    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get the ID token from Firebase
    const idToken = await user.getIdToken();
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      idToken,
    };
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    return {
      success: false,
      error: error.message || 'Google authentication failed',
    };
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
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
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
