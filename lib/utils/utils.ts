import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 백엔드 데이터 매핑 유틸리티
 */

// 카테고리 매핑
export const CATEGORY_MAPPING = {
  'POLITICS': '정치',
  'ECONOMY': '경제', 
  'SOCIETY': '사회',
  'LIFE': '생활',
  'INTERNATIONAL': '세계',
  'IT_SCIENCE': 'IT/과학',
  'VEHICLE': '자동차/교통',
  'TRAVEL_FOOD': '여행/음식',
  'ART': '예술'
} as const;

// 역방향 카테고리 매핑
export const REVERSE_CATEGORY_MAPPING = Object.fromEntries(
  Object.entries(CATEGORY_MAPPING).map(([key, value]) => [value, key])
);

/**
 * 백엔드 카테고리를 프론트엔드 카테고리로 변환
 */
export function toFrontendCategory(backendCategory: string): string {
  return CATEGORY_MAPPING[backendCategory as keyof typeof CATEGORY_MAPPING] || backendCategory;
}

/**
 * 프론트엔드 카테고리를 백엔드 카테고리로 변환
 */
export function toBackendCategory(frontendCategory: string): string {
  return REVERSE_CATEGORY_MAPPING[frontendCategory] || frontendCategory;
}

/**
 * 시간 포맷팅 함수
 */
export function formatTimeAgo(dateString: string | null | undefined): string {
  if (!dateString) return '최근';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}시간 전`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  }
}

/**
 * 백엔드 뉴스레터 데이터를 프론트엔드 형식으로 변환
 */
export function mapBackendNewsletter(backendData: any) {
  return {
    id: backendData.id,
    title: backendData.title || backendData.name,
    description: backendData.description || backendData.summary,
    category: toFrontendCategory(backendData.category),
    frequency: backendData.frequency || backendData.schedule,
    subscribers: backendData.subscriberCount || backendData.subscribers || 0,
    lastSent: formatTimeAgo(backendData.lastSentAt || backendData.updatedAt),
    tags: backendData.tags || backendData.keywords || [],
    isSubscribed: backendData.isSubscribed || false,
    // 백엔드 원본 데이터 보존
    _backendData: backendData
  };
}

/**
 * 백엔드 구독 데이터를 프론트엔드 형식으로 변환
 */
export function mapBackendSubscription(backendData: any) {
  return {
    id: backendData.id,
    category: toFrontendCategory(backendData.category),
    status: backendData.status,
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
    preferredCategories: (backendData.preferredCategories || []).map((cat: string) => 
      toFrontendCategory(cat)
    ),
    // 백엔드 원본 데이터 보존
    _backendData: backendData
  };
}

/**
 * 백엔드 API 응답을 처리하는 함수
 */
export function processBackendResponse(response: any, mapper: (data: any) => any) {
  // 백엔드 데이터가 배열인 경우
  if (Array.isArray(response)) {
    return response.map(mapper);
  }
  
  // 백엔드 데이터가 객체인 경우 (data 필드 안에 있을 수 있음)
  if (response.data && Array.isArray(response.data)) {
    return response.data.map(mapper);
  }
  
  // 매핑할 수 없는 경우 빈 배열 반환
  return [];
}
