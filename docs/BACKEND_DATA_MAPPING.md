# 백엔드 데이터 매핑 가이드

## 개요

이 문서는 프론트엔드에서 백엔드 데이터를 매핑하여 사용하는 방법을 설명합니다.

## 문제 해결

### 화면 데이터가 바뀌는 이유

1. **React Query의 자동 리페치 설정**
   - `staleTime: 0` 설정으로 인한 지속적인 데이터 갱신
   - `refetchOnMount`, `refetchOnWindowFocus` 등이 활성화되어 있음

2. **카테고리별 헤드라인 조회의 로딩 상태**
   - 여러 카테고리의 데이터를 동시에 조회하면서 로딩 상태가 계속 변경됨

3. **컴포넌트에서 캐시 설정 오버라이드**
   - 컴포넌트에서 `staleTime: 0`으로 설정하여 캐시를 무효화

## 해결 방법

### 1. React Query 캐시 설정 개선

```javascript
// hooks/useNewsletter.js
export function useNewsletters(options = {}) {
  return useQuery({
    queryKey: ['newsletters'],
    queryFn: newsletterService.getNewsletters,
    staleTime: 10 * 60 * 1000, // 10분간 fresh 상태 유지
    cacheTime: 30 * 60 * 1000, // 30분간 캐시 유지
    refetchInterval: false, // 자동 새로고침 비활성화
    refetchOnMount: false, // 마운트 시 자동 refetch 비활성화
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
    refetchOnReconnect: false, // 네트워크 재연결 시 자동 refetch 비활성화
    retry: 1, // 재시도 횟수 제한
    retryDelay: 2000, // 재시도 간격 증가
    ...options,
  })
}
```

### 2. 백엔드 데이터 매핑 구현

#### 카테고리 매핑

```javascript
// lib/utils.ts
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
```

#### 데이터 변환 함수

```javascript
// lib/utils.ts
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
    _backendData: backendData // 원본 데이터 보존
  };
}
```

### 3. API 라우트에서 백엔드 호출

```javascript
// app/(api)/api/newsletters/route.js
export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    const response = await fetch(`${backendUrl}/api/newsletters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000) // 5초 타임아웃
    });

    if (response.ok) {
      const backendData = await response.json();
      const mappedNewsletters = processBackendResponse(backendData, mapBackendNewsletter);
      
      return Response.json({
        success: true,
        data: mappedNewsletters,
        message: '뉴스레터 목록을 성공적으로 가져왔습니다.'
      });
    } else {
      // 백엔드 호출 실패 시 기본 데이터 반환
      return Response.json({
        success: true,
        newsletters: getDefaultNewsletters(),
        message: '기본 뉴스레터 데이터를 반환합니다.'
      });
    }
  } catch (error) {
    // 에러 발생 시 기본 데이터 반환
    return Response.json({
      success: true,
      newsletters: getDefaultNewsletters(),
      message: '기본 뉴스레터 데이터를 반환합니다.'
    });
  }
}
```

## 환경 설정

### 환경변수 설정

`.env.local` 파일에 백엔드 API URL을 설정합니다:

```bash
# 백엔드 API 설정
BACKEND_URL=http://localhost:8000

# 기타 환경변수들
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 사용 방법

### 1. 백엔드 데이터 사용

```javascript
// 컴포넌트에서 사용
const { data: newsletters = [], isLoading } = useNewsletters({
  staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
  refetchOnMount: false,
  refetchOnWindowFocus: false,
});
```

### 2. 백엔드 원본 데이터 접근

```javascript
// 매핑된 데이터에서 백엔드 원본 데이터 접근
newsletters.forEach(newsletter => {
  console.log('프론트엔드 데이터:', newsletter);
  console.log('백엔드 원본 데이터:', newsletter._backendData);
});
```

### 3. 카테고리 변환

```javascript
import { toBackendCategory, toFrontendCategory } from '@/lib/utils';

// 프론트엔드 → 백엔드
const backendCategory = toBackendCategory('정치'); // 'POLITICS'

// 백엔드 → 프론트엔드
const frontendCategory = toFrontendCategory('POLITICS'); // '정치'
```

## 타입 정의

### 백엔드 데이터 타입

```javascript
// lib/types/newsletter.js
export class BackendNewsletter {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || data.name || "";
    this.description = data.description || data.summary || "";
    this.category = data.category || "";
    this.frequency = data.frequency || data.schedule || "";
    this.subscriberCount = data.subscriberCount || data.subscribers || 0;
    this.lastSentAt = data.lastSentAt || data.updatedAt || null;
    this.tags = data.tags || data.keywords || [];
    this.isSubscribed = data.isSubscribed || false;
  }

  toFrontend() {
    // 프론트엔드 형식으로 변환
  }
}
```

## 장점

1. **데이터 안정성**: 캐시 설정으로 불필요한 API 호출 방지
2. **타입 안전성**: TypeScript 타입 정의로 데이터 구조 보장
3. **유연성**: 백엔드 데이터 구조 변경 시 매핑 함수만 수정
4. **Fallback 지원**: 백엔드 오류 시 기본 데이터 제공
5. **원본 데이터 보존**: `_backendData` 필드로 원본 데이터 접근 가능

## 주의사항

1. **환경변수 설정**: `BACKEND_API_URL` 환경변수가 올바르게 설정되어야 함
2. **타임아웃 설정**: 백엔드 API 호출 시 적절한 타임아웃 설정 필요
3. **에러 처리**: 백엔드 오류 시 fallback 데이터 제공
4. **캐시 관리**: React Query 캐시 설정으로 성능 최적화
