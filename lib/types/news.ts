/**
 * 뉴스 관련 타입 정의
 */

import { BaseComponentProps, PaginationParams, SearchFilters } from './index';

// 뉴스 아티클 타입
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  excerpt?: string;
  category: NewsCategory;
  publishedAt: string;
  updatedAt?: string;
  source: NewsSource;
  imageUrl?: string;
  thumbnailUrl?: string;
  url?: string;
  tags: string[];
  author?: string;
  authorId?: string;
  viewCount?: number;
  likeCount?: number;
  shareCount?: number;
  isScrapped?: boolean;
  isLiked?: boolean;
  readingTime?: number; // 예상 읽기 시간 (분)
  language?: string;
  sentiment?: NewsSentiment;
  priority?: NewsPriority;
}

// 뉴스 카테고리
export type NewsCategory = 
  | 'politics'
  | 'economy'
  | 'society'
  | 'international'
  | 'sports'
  | 'entertainment'
  | 'technology'
  | 'health'
  | 'education'
  | 'environment'
  | 'culture'
  | 'lifestyle'
  | 'opinion'
  | 'breaking';

// 뉴스 소스
export interface NewsSource {
  id: string;
  name: string;
  url: string;
  logoUrl?: string;
  description?: string;
  category: NewsCategory;
  reliability: number; // 1-10 신뢰도 점수
  isVerified: boolean;
}

// 뉴스 감정 분석
export interface NewsSentiment {
  score: number; // -1 (부정) ~ 1 (긍정)
  label: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1 신뢰도
}

// 뉴스 우선순위
export type NewsPriority = 'low' | 'normal' | 'high' | 'urgent';

// 뉴스 목록 조회 파라미터
export interface NewsParams extends PaginationParams {
  category?: NewsCategory;
  search?: string;
  source?: string;
  author?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'publishedAt' | 'title' | 'category' | 'viewCount' | 'likeCount';
  sortOrder?: 'asc' | 'desc';
  isScrapped?: boolean;
  isLiked?: boolean;
  priority?: NewsPriority;
  sentiment?: NewsSentiment['label'];
}

// 뉴스 응답 타입
export interface NewsResponse {
  articles: NewsArticle[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  filters?: NewsFilters;
}

// 뉴스 필터
export interface NewsFilters extends SearchFilters {
  categories: NewsCategory[];
  sources: NewsSource[];
  authors: string[];
  tags: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  priority: NewsPriority[];
  sentiment: NewsSentiment['label'][];
}

// 관련 뉴스
export interface RelatedArticle {
  article: NewsArticle;
  similarity: number; // 0-1 유사도 점수
  reason: 'category' | 'tags' | 'author' | 'source' | 'content';
}

export interface RelatedArticlesResponse {
  articles: RelatedArticle[];
  relatedKeywords: string[];
  totalCount: number;
}

// 뉴스 트렌드
export interface NewsTrend {
  keyword: string;
  count: number;
  change: number; // 이전 기간 대비 변화율
  category: NewsCategory;
  sentiment: NewsSentiment;
  articles: NewsArticle[];
}

export interface NewsTrendsResponse {
  trends: NewsTrend[];
  period: {
    start: string;
    end: string;
  };
  totalTrends: number;
}

// 뉴스 분석
export interface NewsAnalytics {
  totalArticles: number;
  categoryDistribution: {
    category: NewsCategory;
    count: number;
    percentage: number;
  }[];
  sourceDistribution: {
    source: NewsSource;
    count: number;
    percentage: number;
  }[];
  sentimentDistribution: {
    sentiment: NewsSentiment['label'];
    count: number;
    percentage: number;
  }[];
  dailyStats: {
    date: string;
    articleCount: number;
    viewCount: number;
    likeCount: number;
  }[];
  topKeywords: {
    keyword: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

// 뉴스 컴포넌트 Props
export interface NewsCardProps extends BaseComponentProps {
  article: NewsArticle;
  variant?: 'default' | 'compact' | 'featured' | 'minimal';
  showImage?: boolean;
  showSummary?: boolean;
  showTags?: boolean;
  showSource?: boolean;
  showStats?: boolean;
  onLike?: (articleId: string) => void;
  onShare?: (article: NewsArticle) => void;
  onScrap?: (articleId: string) => void;
  onReadMore?: (article: NewsArticle) => void;
}

export interface NewsGridProps extends BaseComponentProps {
  articles: NewsArticle[];
  loading?: boolean;
  error?: string;
  variant?: 'grid' | 'list' | 'masonry';
  columns?: number;
  gap?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  emptyMessage?: string;
}

export interface NewsFiltersProps extends BaseComponentProps {
  filters: NewsFilters;
  onFiltersChange: (filters: NewsFilters) => void;
  categories: NewsCategory[];
  sources: NewsSource[];
  tags: string[];
  loading?: boolean;
}

export interface NewsSearchProps extends BaseComponentProps {
  onSearch: (query: string, filters?: NewsFilters) => void;
  placeholder?: string;
  suggestions?: string[];
  recentSearches?: string[];
  loading?: boolean;
  onClear?: () => void;
}

// 뉴스 상세 페이지 Props
export interface NewsDetailProps extends BaseComponentProps {
  article: NewsArticle;
  relatedArticles: RelatedArticle[];
  loading?: boolean;
  error?: string;
  onLike?: (articleId: string) => void;
  onShare?: (article: NewsArticle) => void;
  onScrap?: (articleId: string) => void;
  onComment?: (articleId: string, comment: string) => void;
}

// 뉴스 댓글
export interface NewsComment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likeCount: number;
  isLiked?: boolean;
  isAuthor?: boolean;
  replies?: NewsComment[];
  parentId?: string;
}

export interface NewsCommentsResponse {
  comments: NewsComment[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// 뉴스 북마크/스크랩
export interface NewsBookmark {
  id: string;
  userId: string;
  articleId: string;
  article: NewsArticle;
  createdAt: string;
  tags?: string[];
  notes?: string;
}

export interface NewsBookmarksResponse {
  bookmarks: NewsBookmark[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// 뉴스 알림
export interface NewsNotification {
  id: string;
  userId: string;
  type: 'new_article' | 'trending' | 'breaking' | 'category_update';
  title: string;
  message: string;
  articleId?: string;
  category?: NewsCategory;
  isRead: boolean;
  createdAt: string;
  priority: NewsPriority;
}

// 뉴스 구독
export interface NewsSubscription {
  id: string;
  userId: string;
  type: 'category' | 'keyword' | 'source' | 'author';
  value: string;
  isActive: boolean;
  createdAt: string;
  preferences?: {
    frequency: 'immediate' | 'daily' | 'weekly';
    channels: ('email' | 'push' | 'sms')[];
    quietHours?: {
      start: string;
      end: string;
    };
  };
}
