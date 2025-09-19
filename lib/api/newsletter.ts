/**
 * 뉴스레터 관련 API 서비스
 */

import { apiClient } from './client';

export interface Newsletter {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  publishedAt: string;
  author: string;
  imageUrl?: string;
  tags?: string[];
  isSubscribed?: boolean;
  subscriberCount?: number;
}

export interface NewsletterResponse {
  newsletters: Newsletter[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface NewsletterParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'publishedAt' | 'title' | 'category' | 'subscriberCount';
  sortOrder?: 'asc' | 'desc';
}

export interface Subscription {
  id: string;
  newsletterId: string;
  userId: string;
  subscribedAt: string;
  isActive: boolean;
  preferences?: {
    frequency?: 'daily' | 'weekly' | 'monthly';
    categories?: string[];
    keywords?: string[];
  };
}

export interface SubscriptionResponse {
  subscriptions: Subscription[];
  totalCount: number;
}

export interface NewsletterStats {
  totalNewsletters: number;
  totalSubscribers: number;
  categoryStats: {
    category: string;
    count: number;
    subscriberCount: number;
  }[];
}

class NewsletterService {
  /**
   * 뉴스레터 목록 조회
   */
  async getNewsletters(params?: NewsletterParams): Promise<NewsletterResponse> {
    return apiClient.get<NewsletterResponse>('/api/newsletters', params);
  }

  /**
   * 특정 뉴스레터 상세 조회
   */
  async getNewsletterById(id: string): Promise<Newsletter> {
    return apiClient.get<Newsletter>(`/api/newsletters/${id}`);
  }

  /**
   * 뉴스레터 검색
   */
  async searchNewsletters(query: string, params?: Omit<NewsletterParams, 'search'>): Promise<NewsletterResponse> {
    return apiClient.get<NewsletterResponse>('/api/newsletters/search', {
      ...params,
      search: query,
    });
  }

  /**
   * 카테고리별 뉴스레터 조회
   */
  async getNewslettersByCategory(category: string, params?: Omit<NewsletterParams, 'category'>): Promise<NewsletterResponse> {
    return apiClient.get<NewsletterResponse>('/api/newsletters/category', {
      ...params,
      category,
    });
  }

  /**
   * 인기 뉴스레터 조회
   */
  async getPopularNewsletters(limit?: number): Promise<Newsletter[]> {
    return apiClient.get<Newsletter[]>('/api/newsletters/popular', { limit });
  }

  /**
   * 최신 뉴스레터 조회
   */
  async getLatestNewsletters(limit?: number): Promise<Newsletter[]> {
    return apiClient.get<Newsletter[]>('/api/newsletters/latest', { limit });
  }

  /**
   * 뉴스레터 구독
   */
  async subscribeToNewsletter(newsletterId: string, preferences?: Subscription['preferences']): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(`/api/newsletters/${newsletterId}/subscribe`, {
      preferences,
    });
  }

  /**
   * 뉴스레터 구독 해제
   */
  async unsubscribeFromNewsletter(newsletterId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/newsletters/${newsletterId}/subscribe`);
  }

  /**
   * 사용자 구독 뉴스레터 목록 조회
   */
  async getUserSubscriptions(params?: { page?: number; limit?: number }): Promise<SubscriptionResponse> {
    return apiClient.get<SubscriptionResponse>('/api/newsletters/user-subscriptions', params);
  }

  /**
   * 구독 상태 토글 (카테고리별)
   */
  async toggleSubscription(category: string, isActive: boolean): Promise<{ success: boolean; isSubscribed: boolean; message: string }> {
    return apiClient.post<{ success: boolean; isSubscribed: boolean; message: string }>('/api/newsletters/subscription/toggle', {
      category,
      isActive
    });
  }

  /**
   * 구독 설정 업데이트
   */
  async updateSubscriptionPreferences(newsletterId: string, preferences: Subscription['preferences']): Promise<{ success: boolean; message: string }> {
    return apiClient.patch<{ success: boolean; message: string }>(`/api/newsletters/${newsletterId}/preferences`, {
      preferences,
    });
  }

  /**
   * 뉴스레터 통계 조회
   */
  async getNewsletterStats(): Promise<NewsletterStats> {
    return apiClient.get<NewsletterStats>('/api/newsletters/stats');
  }

  /**
   * 키워드 구독
   */
  async subscribeToKeyword(keyword: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/api/newsletters/keyword-subscription', {
      keyword,
    });
  }

  /**
   * 키워드 구독 해제
   */
  async unsubscribeFromKeyword(keyword: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>('/api/newsletters/keyword-subscription', {
      keyword,
    });
  }

  /**
   * 사용자 키워드 구독 목록 조회
   */
  async getUserKeywordSubscriptions(): Promise<{ keywords: string[] }> {
    return apiClient.get<{ keywords: string[] }>('/api/newsletters/user-keyword-subscriptions');
  }
}

export const newsletterService = new NewsletterService();
