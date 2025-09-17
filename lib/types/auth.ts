/**
 * 인증 관련 타입 정의
 */

import { BaseComponentProps, PaginationParams } from './index';

// 사용자 타입
export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  provider: AuthProvider;
  providerId?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences: UserPreferences;
  profile: UserProfile;
}

// 인증 제공자
export type AuthProvider = 'email' | 'google' | 'kakao' | 'apple' | 'github';

// 사용자 역할
export type UserRole = 'user' | 'editor' | 'admin' | 'super_admin';

// 사용자 프로필
export interface UserProfile {
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  interests: string[];
  newsletterFrequency: NewsletterFrequency;
  timezone: string;
  language: string;
  notifications: NotificationSettings;
}

// 사용자 선호도
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  itemsPerPage: number;
  autoSave: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

// 뉴스레터 빈도
export type NewsletterFrequency = 'daily' | 'weekly' | 'monthly' | 'never';

// 알림 설정
export interface NotificationSettings {
  email: {
    newArticles: boolean;
    newsletters: boolean;
    comments: boolean;
    likes: boolean;
    follows: boolean;
    system: boolean;
  };
  push: {
    newArticles: boolean;
    newsletters: boolean;
    comments: boolean;
    likes: boolean;
    follows: boolean;
    system: boolean;
  };
  sms: {
    urgent: boolean;
    security: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
    timezone: string;
  };
}

// 인증 응답
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

// 로그인 자격증명
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  captcha?: string;
}

// 회원가입 자격증명
export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToMarketing?: boolean;
  captcha?: string;
}

// 비밀번호 재설정 요청
export interface ResetPasswordRequest {
  email: string;
  captcha?: string;
}

// 비밀번호 재설정 확인
export interface ResetPasswordConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// OAuth 콜백 데이터
export interface OAuthCallbackData {
  code: string;
  state?: string;
  error?: string;
  error_description?: string;
}

// OAuth 추가 정보
export interface AdditionalInfo {
  name: string;
  interests?: string[];
  newsletterFrequency?: NewsletterFrequency;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToMarketing?: boolean;
}

// 비밀번호 변경
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 프로필 업데이트
export interface UpdateProfileData {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: string;
  gender?: UserProfile['gender'];
  interests?: string[];
  newsletterFrequency?: NewsletterFrequency;
  timezone?: string;
  language?: string;
}

// 계정 설정 업데이트
export interface UpdateAccountData {
  email?: string;
  currentPassword?: string;
  preferences?: Partial<UserPreferences>;
  notifications?: Partial<NotificationSettings>;
}

// 세션 정보
export interface Session {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: number;
  isExpired: boolean;
  lastActivity: number;
}

// 인증 상태
export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  lastLoginAt: string | null;
}

// 인증 컨텍스트 타입
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<User>;
  updateAccount: (data: UpdateAccountData) => Promise<User>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  requestPasswordReset: (data: ResetPasswordRequest) => Promise<void>;
  confirmPasswordReset: (data: ResetPasswordConfirm) => Promise<void>;
  oauthLogin: (provider: AuthProvider, data: OAuthCallbackData) => Promise<AuthResponse>;
  submitAdditionalInfo: (data: AdditionalInfo) => Promise<AuthResponse>;
  deleteAccount: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

// 인증 컴포넌트 Props
export interface LoginFormProps extends BaseComponentProps {
  onSuccess?: (response: AuthResponse) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  showRegisterLink?: boolean;
  showForgotPasswordLink?: boolean;
  loading?: boolean;
}

export interface RegisterFormProps extends BaseComponentProps {
  onSuccess?: (response: AuthResponse) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  showLoginLink?: boolean;
  loading?: boolean;
}

export interface ForgotPasswordFormProps extends BaseComponentProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showLoginLink?: boolean;
  loading?: boolean;
}

export interface ResetPasswordFormProps extends BaseComponentProps {
  token: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showLoginLink?: boolean;
  loading?: boolean;
}

export interface OAuthButtonProps extends BaseComponentProps {
  provider: AuthProvider;
  onSuccess?: (response: AuthResponse) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export interface AdditionalInfoFormProps extends BaseComponentProps {
  onSuccess?: (response: AuthResponse) => void;
  onError?: (error: string) => void;
  loading?: boolean;
}

export interface ProfileFormProps extends BaseComponentProps {
  user: User;
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
  loading?: boolean;
}

export interface AccountSettingsProps extends BaseComponentProps {
  user: User;
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
  loading?: boolean;
}

export interface ChangePasswordFormProps extends BaseComponentProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  loading?: boolean;
}

// 보호된 라우트 Props
export interface ProtectedRouteProps extends BaseComponentProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

// 권한 확인 Hook
export interface UsePermissionsReturn {
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  canAccess: (resource: string, action: string) => boolean;
}

// 인증 Hook
export interface UseAuthReturn extends AuthContextType {
  permissions: UsePermissionsReturn;
  isAdmin: boolean;
  isEditor: boolean;
  isUser: boolean;
}

// 소셜 로그인 설정
export interface SocialLoginConfig {
  google: {
    clientId: string;
    redirectUri: string;
    scope: string[];
  };
  kakao: {
    clientId: string;
    redirectUri: string;
    scope: string[];
  };
  apple: {
    clientId: string;
    redirectUri: string;
    scope: string[];
  };
  github: {
    clientId: string;
    redirectUri: string;
    scope: string[];
  };
}

// 보안 설정
export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // days
  };
  session: {
    timeout: number; // minutes
    maxConcurrentSessions: number;
    requireReauth: boolean;
  };
  twoFactor: {
    enabled: boolean;
    required: boolean;
    methods: ('sms' | 'email' | 'totp')[];
  };
  captcha: {
    enabled: boolean;
    siteKey: string;
    threshold: number;
  };
}
