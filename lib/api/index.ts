/**
 * API 서비스 통합 export
 */

export { apiClient, ApiError } from './client';
export { newsService } from './news';
export { newsletterService } from './newsletter';
export { authService } from './auth';

// API 타입들도 함께 export
export type { ApiResponse } from './client';
export type { 
  NewsArticle, 
  NewsResponse, 
  NewsParams, 
  RelatedArticlesResponse 
} from './news';
export type { 
  Newsletter, 
  NewsletterResponse, 
  NewsletterParams, 
  Subscription, 
  SubscriptionResponse, 
  NewsletterStats 
} from './newsletter';
export type { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials, 
  ResetPasswordRequest, 
  ResetPasswordConfirm, 
  OAuthCallbackData, 
  AdditionalInfo 
} from './auth';
