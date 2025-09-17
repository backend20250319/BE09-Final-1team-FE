/**
 * 뉴스 관련 API 서비스
 */

import { apiClient } from './client';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  publishedAt: string;
  source: string;
  imageUrl?: string;
  url?: string;
  tags?: string[];
  author?: string;
}

export interface NewsResponse {
  articles: NewsArticle[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface NewsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'publishedAt' | 'title' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface RelatedArticlesResponse {
  articles: NewsArticle[];
  relatedKeywords: string[];
}

class NewsService {
  /**
   * 뉴스 목록 조회
   */
  async getNews(params?: NewsParams): Promise<NewsResponse> {
    return apiClient.get<NewsResponse>('/api/news', params);
  }

  /**
   * 특정 뉴스 상세 조회
   */
  async getNewsById(id: string): Promise<NewsArticle> {
    return apiClient.get<NewsArticle>(`/api/news/${id}`);
  }

  /**
   * 뉴스 검색
   */
  async searchNews(query: string, params?: Omit<NewsParams, 'search'>): Promise<NewsResponse> {
    return apiClient.get<NewsResponse>('/api/news/search', {
      ...params,
      search: query,
    });
  }

  /**
   * 카테고리별 뉴스 조회
   */
  async getNewsByCategory(category: string, params?: Omit<NewsParams, 'category'>): Promise<NewsResponse> {
    return apiClient.get<NewsResponse>('/api/news/category', {
      ...params,
      category,
    });
  }

  /**
   * 관련 뉴스 조회
   */
  async getRelatedArticles(id: string): Promise<RelatedArticlesResponse> {
    return apiClient.get<RelatedArticlesResponse>(`/api/news/${id}/related`);
  }

  /**
   * 인기 뉴스 조회
   */
  async getPopularNews(limit?: number): Promise<NewsArticle[]> {
    return apiClient.get<NewsArticle[]>('/api/news/popular', { limit });
  }

  /**
   * 최신 뉴스 조회
   */
  async getLatestNews(limit?: number): Promise<NewsArticle[]> {
    return apiClient.get<NewsArticle[]>('/api/news/latest', { limit });
  }

  /**
   * 뉴스 스크랩
   */
  async scrapNews(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(`/api/users/news/${id}/scrap`);
  }

  /**
   * 뉴스 스크랩 해제
   */
  async unscrapNews(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/users/news/${id}/scrap`);
  }

  /**
   * 사용자 스크랩 뉴스 목록 조회
   */
  async getScrappedNews(params?: NewsParams): Promise<NewsResponse> {
    return apiClient.get<NewsResponse>('/api/users/mypage/scraps', params);
  }
}

export const newsService = new NewsService();
