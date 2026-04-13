import { api } from './api';
import { User } from '@/types/user';

interface AuthResponse {
  user: User;
  token: string;
  githubAccessToken?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

interface GitHubAuthData {
  githubId: string;
  username: string;
  email?: string;
  avatar?: string;
  accessToken: string;
}

interface ClerkAuthData {
  clerkId: string;
  email: string;
  username: string;
  avatar?: string;
  clerkToken?: string | null;
}


export const authService = {
  // Email/Password Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
    return response.data.data;
  },

  // Email/Password Signup
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/signup', credentials);
    return response.data.data;
  },

  // GitHub OAuth
  async githubAuth(data: GitHubAuthData): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/github', data);
    return response.data.data;
  },

  // Google OAuth
  async googleAuth(accessToken: string): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/google/callback', { accessToken });
    return response.data.data;
  },

  // Clerk Auth
  async clerkAuth(data: ClerkAuthData): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/clerk', data);
    return response.data.data;
  },

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  // Get current user from token
  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('token');
    const user = this.getCurrentUser();
    return !!(token && user);
  },
};
