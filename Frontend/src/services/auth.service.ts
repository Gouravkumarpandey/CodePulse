import { api } from './api';
import { User } from '@/types/user';

interface AuthResponse {
  user: User;
  token: string;
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

interface GoogleAuthData {
  googleId: string;
  username: string;
  email: string;
  avatar?: string;
  accessToken: string;
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
  async googleAuth(data: GoogleAuthData): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/auth/google', data);
    return response.data.data;
  },

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from token
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = this.getCurrentUser();
    return !!(token && user);
  },
};
