/**
 * 인증 관련 API 서비스
 */

import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  provider?: 'google' | 'kakao' | 'email';
  createdAt: string;
  updatedAt: string;
  preferences?: {
    interests?: string[];
    newsletterFrequency?: 'daily' | 'weekly' | 'monthly';
    notifications?: boolean;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OAuthCallbackData {
  code: string;
  state?: string;
}

export interface AdditionalInfo {
  name: string;
  interests?: string[];
  newsletterFrequency?: 'daily' | 'weekly' | 'monthly';
}

class AuthService {
  /**
   * 이메일 로그인
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    
    // 토큰을 API 클라이언트에 설정
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    
    return response;
  }

  /**
   * 이메일 회원가입
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', credentials);
    
    // 토큰을 API 클라이언트에 설정
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    
    return response;
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>('/api/auth/logout');
    
    // 토큰 제거
    apiClient.removeAuthToken();
    
    return response;
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/api/auth/me');
  }

  /**
   * 사용자 정보 업데이트
   */
  async updateUser(data: Partial<User>): Promise<User> {
    return apiClient.patch<User>('/api/auth/me', data);
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>('/api/auth/change-password', data);
  }

  /**
   * 비밀번호 재설정 요청
   */
  async requestPasswordReset(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/api/auth/forgot-password', data);
  }

  /**
   * 비밀번호 재설정 확인
   */
  async confirmPasswordReset(data: ResetPasswordConfirm): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/api/auth/reset-password', data);
  }

  /**
   * OAuth 로그인 (Google, Kakao)
   */
  async oauthLogin(provider: 'google' | 'kakao', data: OAuthCallbackData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`/api/auth/oauth/${provider}`, data);
    
    // 토큰을 API 클라이언트에 설정
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    
    return response;
  }

  /**
   * OAuth 추가 정보 입력
   */
  async submitAdditionalInfo(data: AdditionalInfo): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/oauth/additional-info', data);
    
    // 토큰을 API 클라이언트에 설정
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    
    return response;
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<{ token: string; expiresIn?: number }> {
    const response = await apiClient.post<{ token: string; expiresIn?: number }>('/api/auth/refresh');
    
    // 새 토큰을 API 클라이언트에 설정
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    
    return response;
  }

  /**
   * 계정 삭제
   */
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>('/api/auth/me');
    
    // 토큰 제거
    apiClient.removeAuthToken();
    
    return response;
  }

  /**
   * 이메일 인증
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/api/auth/verify-email', { token });
  }

  /**
   * 이메일 인증 재전송
   */
  async resendVerificationEmail(): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/api/auth/resend-verification');
  }
}

export const authService = new AuthService();
