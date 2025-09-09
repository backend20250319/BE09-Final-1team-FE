import useSWR, { mutate } from 'swr'
import { newsletterService } from '@/lib/newsletterService'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { useState, useCallback } from 'react'

// SWR fetcher 함수
const fetcher = (url) => fetch(url).then(res => res.json())

// 뉴스레터 목록 조회 훅 (SWR)
export function useNewsletters(options = {}) {
  const { data, error, isLoading, mutate: refetch } = useSWR(
    '/api/newsletters',
    fetcher,
    {
      revalidateOnFocus: false, // 포커스 시 재요청 방지
      revalidateOnMount: !options.initialData, // 초기 데이터가 있으면 마운트 시 재요청 방지
      dedupingInterval: 300000, // 5분간 중복 요청 방지
      refreshInterval: 600000, // 10분마다 백그라운드 갱신
      errorRetryCount: 1, // 재시도 횟수 제한
      errorRetryInterval: 2000, // 재시도 간격
      fallbackData: options.initialData || [], // 초기 데이터 사용
      onError: (error) => {
        console.warn('뉴스레터 목록 조회 실패:', error)
      }
    }
  )

  return {
    data: data || [],
    isLoading,
    error,
    refetch
  }
}

// 사용자 구독 목록 조회 훅 (SWR)
export function useUserSubscriptions(options = {}) {
  const { data, error, isLoading, mutate: refetch } = useSWR(
    options.enabled ? '/api/newsletters/user-subscriptions' : null,
    fetcher,
    {
      revalidateOnFocus: false, // 포커스 시 재요청 방지
      revalidateOnMount: true, // 마운트 시 재요청
      dedupingInterval: 120000, // 2분간 중복 요청 방지
      refreshInterval: 0, // 자동 새로고침 비활성화
      errorRetryCount: (error) => {
        // 세션 만료 에러인 경우 재시도하지 않음
        if (error?.message?.includes('세션이 만료되었습니다')) {
          console.log('🔄 세션 만료로 인해 재시도하지 않음');
          return 0;
        }
        // 백엔드 서버 연결 실패인 경우도 재시도하지 않음
        if (error?.message?.includes('백엔드 서버에 연결할 수 없습니다')) {
          console.log('🔄 백엔드 서버 연결 실패로 인해 재시도하지 않음');
          return 0;
        }
        // 503 Service Unavailable 오류인 경우 재시도하지 않음
        if (error?.message?.includes('서비스가 일시적으로 사용할 수 없습니다')) {
          console.log('🔄 서비스 일시 중단으로 인해 재시도하지 않음');
          return 0;
        }
        return 1; // 최대 1회 재시도
      },
      errorRetryInterval: 2000, // 재시도 간격
      fallbackData: [], // 기본값으로 빈 배열 설정
      onError: (error) => {
        console.warn('사용자 구독 목록 조회 실패:', error.message);
        
        // 세션 만료 에러인 경우 사용자에게 알림
        if (error?.message?.includes('세션이 만료되었습니다')) {
          console.log('🔔 세션 만료로 인한 구독 목록 조회 실패');
        }
        
        // 백엔드 서버 연결 실패인 경우
        if (error?.message?.includes('백엔드 서버에 연결할 수 없습니다')) {
          console.log('🔔 백엔드 서버 연결 실패 - 서버가 실행되지 않았을 수 있음');
        }
        
        // 503 Service Unavailable 오류인 경우
        if (error?.message?.includes('서비스가 일시적으로 사용할 수 없습니다')) {
          console.log('🔔 서비스 일시 중단 - 백엔드 서비스가 일시적으로 사용할 수 없음');
        }
      }
    }
  )

  return {
    data: data?.data || data || [],
    isLoading,
    error,
    refetch
  }
}

// 뉴스레터 구독 훅 (SWR)
export function useSubscribeNewsletter() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const subscribe = useCallback(async ({ category, email }) => {
    setIsLoading(true)
    try {
      const result = await newsletterService.subscribeNewsletter(category, email)
      
      // SWR 캐시 무효화
      mutate('/api/newsletters/user-subscriptions')
      mutate('/api/newsletter/stats/subscribers')
      
      toast({
        title: "구독 완료!",
        description: `${category} 카테고리 뉴스레터 구독이 완료되었습니다.`,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      })
      
      return result
    } catch (error) {
      toast({
        title: "구독 실패",
        description: error.message || "일시적인 오류가 발생했습니다.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  return {
    mutate: subscribe,
    isPending: isLoading
  }
}

// 뉴스레터 구독 해제 훅 (SWR)
export function useUnsubscribeNewsletter() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const unsubscribe = useCallback(async (category) => {
    setIsLoading(true)
    try {
      const result = await newsletterService.unsubscribeNewsletter(category)
      
      // SWR 캐시 무효화
      mutate('/api/newsletters/user-subscriptions')
      mutate('/api/newsletter/stats/subscribers')
      
      toast({
        title: "구독 해제 완료",
        description: "뉴스레터 구독이 해제되었습니다.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      })
      
      return result
    } catch (error) {
      toast({
        title: "구독 해제 실패",
        description: error.message || "일시적인 오류가 발생했습니다.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  return {
    mutate: unsubscribe,
    isPending: isLoading
  }
}

// 카테고리별 구독자 수 조회 훅 (SWR)
export function useCategorySubscriberCounts(categories) {
  const { data, error, isLoading } = useSWR(
    categories && categories.length > 0 ? '/api/newsletter/stats/subscribers' : null,
    fetcher,
    {
      revalidateOnFocus: false, // 포커스 시 재요청 방지
      revalidateOnMount: false, // 마운트 시 재요청 방지
      dedupingInterval: 30000, // 30초간 중복 요청 방지
      refreshInterval: 0, // 자동 새로고침 비활성화
      errorRetryCount: 1, // 재시도 횟수 제한
      errorRetryInterval: 1000, // 재시도 간격
      onError: (error) => {
        console.warn('카테고리별 구독자 수 조회 실패:', error.message)
      }
    }
  )

  return {
    counts: data?.data || {},
    loading: isLoading,
    error
  }
}

// 구독 토글 훅 (카테고리별) - SWR
export function useToggleSubscription() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const toggle = useCallback(async ({ category, isActive }) => {
    setIsLoading(true)
    try {
      const result = await newsletterService.toggleSubscription(category, isActive)
      
      // SWR 캐시 무효화
      mutate('/api/newsletters/user-subscriptions')
      mutate('/api/newsletter/stats/subscribers')
      
      const action = isActive ? '구독' : '구독 해제'
      
      // fallback 모드인 경우 다른 스타일의 토스트 표시
      if (result.fallback) {
        toast({
          title: `${action} 완료 (로컬)`,
          description: result.message || `${category} 카테고리 ${action}이 로컬에서 처리되었습니다.`,
          icon: <CheckCircle className="h-4 w-4 text-orange-500" />
        })
      } else {
        toast({
          title: `${action} 완료`,
          description: result.message || `${category} 카테고리 ${action}이 완료되었습니다.`,
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        })
      }
      
      return result
    } catch (error) {
      // 구독 제한 오류 처리
      if (error.message?.includes('CATEGORY_LIMIT_EXCEEDED')) {
        toast({
          title: "구독 제한",
          description: "최대 3개 카테고리까지 구독할 수 있습니다. 다른 카테고리 구독을 해제한 후 다시 시도해주세요.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        })
      } else {
        toast({
          title: "구독 처리 실패",
          description: error.message || "일시적인 오류가 발생했습니다.",
          variant: "destructive",
          icon: <AlertCircle className="h-4 w-4 text-red-500" />
        })
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  return {
    mutate: toggle,
    isPending: isLoading
  }
}

// 카테고리별 기사 조회 훅 (SWR)
export function useCategoryArticles(category, limit = 5) {
  const { data, error, isLoading } = useSWR(
    category ? `/api/newsletter/category/${category}/articles?limit=${limit}` : null,
    fetcher,
    {
      revalidateOnFocus: false, // 포커스 시 재요청 방지
      revalidateOnMount: false, // 마운트 시 재요청 방지
      dedupingInterval: 600000, // 10분간 중복 요청 방지
      refreshInterval: 0, // 자동 새로고침 비활성화
      errorRetryCount: 1, // 재시도 횟수 제한
      errorRetryInterval: 1000, // 재시도 간격
      onError: (error) => {
        console.warn(`카테고리 ${category} 기사 조회 실패:`, error.message)
      }
    }
  )

  return {
    data: data?.data || [],
    isLoading,
    isError: !!error,
    error
  }
}

// 카테고리별 트렌드 키워드 조회 훅 (SWR)
export function useTrendingKeywords(category, limit = 8) {
  const { data, error, isLoading } = useSWR(
    category ? `/api/newsletter/category/${category}/trending-keywords?limit=${limit}` : null,
    fetcher,
    {
      revalidateOnFocus: false, // 포커스 시 재요청 방지
      revalidateOnMount: false, // 마운트 시 재요청 방지
      dedupingInterval: 1800000, // 30분간 중복 요청 방지 (트렌드는 자주 변경되지 않음)
      refreshInterval: 0, // 자동 새로고침 비활성화
      errorRetryCount: 2, // 재시도 횟수 증가
      errorRetryInterval: 2000, // 재시도 간격 증가
      onError: (error) => {
        console.warn(`카테고리 ${category} 트렌드 키워드 조회 실패:`, error.message)
      }
    }
  )

  return {
    data: data?.data || [],
    isLoading,
    isError: !!error,
    error
  }
}

// 카테고리별 헤드라인 조회 훅 (SWR)
export function useCategoryHeadlines(category, limit = 5) {
  const { data, error, isLoading } = useSWR(
    category && category !== "전체" ? `/api/newsletter/category/${category}/headlines?limit=${limit}` : null,
    fetcher,
    {
      revalidateOnFocus: false, // 포커스 시 재요청 방지
      revalidateOnMount: false, // 마운트 시 재요청 방지
      dedupingInterval: 3600000, // 1시간간 중복 요청 방지 (더 길게 설정)
      refreshInterval: 0, // 자동 새로고침 비활성화
      errorRetryCount: 1, // 재시도 횟수 제한
      errorRetryInterval: 3000, // 재시도 간격
      onError: (error) => {
        console.warn(`카테고리 ${category} 헤드라인 조회 실패:`, error.message)
      }
    }
  )

  return {
    data: data?.data || [],
    isLoading,
    isError: !!error,
    error
  }
}

// Enhanced 뉴스레터 데이터 조회 훅 (통합 API) - SWR
export function useEnhancedNewsletterData(options = {}) {
  const {
    headlinesPerCategory = 5,
    trendingKeywordsLimit = 8,
    category = null,
    enabled = true
  } = options;

  const { data, error, isLoading, mutate: refetch } = useSWR(
    enabled ? `/api/newsletter/enhanced-data?headlinesPerCategory=${headlinesPerCategory}&trendingKeywordsLimit=${trendingKeywordsLimit}&category=${category || ''}` : null,
    fetcher,
    {
      revalidateOnFocus: false, // 포커스 시 재요청 방지
      revalidateOnMount: false, // 마운트 시 재요청 방지
      dedupingInterval: 300000, // 5분간 중복 요청 방지
      refreshInterval: 0, // 자동 새로고침 비활성화
      errorRetryCount: 2, // 재시도 횟수
      errorRetryInterval: 2000, // 재시도 간격
      onError: (error) => {
        console.warn('Enhanced 뉴스레터 데이터 조회 실패:', error.message)
      }
    }
  )

  return {
    data: data?.data || null,
    isLoading,
    isError: !!error,
    error,
    refetch
  }
}
