import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { newsletterService } from '@/lib/newsletterService'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, AlertCircle } from 'lucide-react'

// 뉴스레터 목록 조회 훅
export function useNewsletters(options = {}) {
  return useQuery({
    queryKey: ['newsletters'],
    queryFn: newsletterService.getNewsletters,
    staleTime: 10 * 60 * 1000, // 10분간 fresh 상태 유지
    cacheTime: 30 * 60 * 1000, // 30분간 캐시 유지
    refetchInterval: false, // 자동 새로고침 비활성화
    initialData: options.initialData || [], // 전달받은 초기 데이터 사용
    refetchOnMount: false, // 마운트 시 자동 refetch 비활성화
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
    refetchOnReconnect: false, // 네트워크 재연결 시 자동 refetch 비활성화
    retry: 1, // 재시도 횟수 제한
    retryDelay: 2000, // 재시도 간격 증가
    ...options,
  })
}

// 사용자 구독 목록 조회 훅
export function useUserSubscriptions(options = {}) {
  return useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: newsletterService.getUserSubscriptions,
    staleTime: 2 * 60 * 1000, // 2분간 fresh 상태 유지
    cacheTime: 10 * 60 * 1000, // 10분간 캐시 유지
    enabled: !!options.enabled, // 로그인한 사용자만 활성화
    initialData: [], // 기본값으로 빈 배열 설정
    retry: (failureCount, error) => {
      // 세션 만료 에러인 경우 재시도하지 않음
      if (error?.message?.includes('세션이 만료되었습니다')) {
        console.log('🔄 세션 만료로 인해 재시도하지 않음');
        return false;
      }
      // 백엔드 서버 연결 실패인 경우도 재시도하지 않음
      if (error?.message?.includes('백엔드 서버에 연결할 수 없습니다')) {
        console.log('🔄 백엔드 서버 연결 실패로 인해 재시도하지 않음');
        return false;
      }
      // 503 Service Unavailable 오류인 경우 재시도하지 않음
      if (error?.message?.includes('서비스가 일시적으로 사용할 수 없습니다')) {
        console.log('🔄 서비스 일시 중단으로 인해 재시도하지 않음');
        return false;
      }
      return failureCount < 1; // 최대 1회 재시도
    },
    retryDelay: 2000, // 재시도 간격
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 방지
    onError: (error) => {
      console.warn('사용자 구독 목록 조회 실패:', error.message);
      
      // 세션 만료 에러인 경우 사용자에게 알림
      if (error?.message?.includes('세션이 만료되었습니다')) {
        console.log('🔔 세션 만료로 인한 구독 목록 조회 실패');
        // 여기서는 에러를 조용히 처리하고, 상위 컴포넌트에서 처리하도록 함
      }
      
      // 백엔드 서버 연결 실패인 경우
      if (error?.message?.includes('백엔드 서버에 연결할 수 없습니다')) {
        console.log('🔔 백엔드 서버 연결 실패 - 서버가 실행되지 않았을 수 있음');
      }
      
      // 503 Service Unavailable 오류인 경우
      if (error?.message?.includes('서비스가 일시적으로 사용할 수 없습니다')) {
        console.log('🔔 서비스 일시 중단 - 백엔드 서비스가 일시적으로 사용할 수 없음');
      }
    },
    ...options,
  })
}

// 뉴스레터 구독 훅
export function useSubscribeNewsletter() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ category, email }) => 
      newsletterService.subscribeNewsletter(category, email),
    
    onSuccess: (data, variables) => {
      // 구체적인 쿼리만 무효화하여 불필요한 리로딩 방지
      queryClient.invalidateQueries(['user-subscriptions'])
      // 구독자 통계도 무효화하여 실시간 업데이트
      queryClient.invalidateQueries(['newsletter-stats-subscribers'])
      
      toast({
        title: "구독 완료!",
        description: `${variables.category} 카테고리 뉴스레터 구독이 완료되었습니다.`,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      })
    },
    
    onError: (error) => {
      toast({
        title: "구독 실패",
        description: error.message || "일시적인 오류가 발생했습니다.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      })
    }
  })
}

// 뉴스레터 구독 해제 훅
export function useUnsubscribeNewsletter() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (category) => 
      newsletterService.unsubscribeNewsletter(category),
    
    onSuccess: (data, variables) => {
      // 구체적인 쿼리만 무효화하여 불필요한 리로딩 방지
      queryClient.invalidateQueries(['user-subscriptions'])
      // 구독자 통계도 무효화하여 실시간 업데이트
      queryClient.invalidateQueries(['newsletter-stats-subscribers'])
      
      toast({
        title: "구독 해제 완료",
        description: "뉴스레터 구독이 해제되었습니다.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      })
    },
    
    onError: (error) => {
      toast({
        title: "구독 해제 실패",
        description: error.message || "일시적인 오류가 발생했습니다.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      })
    }
  })
}

// 구독 정보 조회 훅
export function useSubscription(id) {
  return useQuery({
    queryKey: ['subscription', id],
    queryFn: () => newsletterService.getSubscription(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2분간 fresh 상태 유지
    cacheTime: 10 * 60 * 1000, // 10분간 캐시 유지
  })
}

// 내 구독 목록 조회 훅
export function useMySubscriptions(options = {}) {
  return useQuery({
    queryKey: ['my-subscriptions'],
    queryFn: newsletterService.getMySubscriptions,
    staleTime: 2 * 60 * 1000, // 2분간 fresh 상태 유지
    cacheTime: 10 * 60 * 1000, // 10분간 캐시 유지
    enabled: !!options.enabled, // 로그인한 사용자만 활성화
    ...options,
  })
}

// 활성 구독 목록 조회 훅
export function useActiveSubscriptions(options = {}) {
  return useQuery({
    queryKey: ['active-subscriptions'],
    queryFn: newsletterService.getActiveSubscriptions,
    staleTime: 2 * 60 * 1000, // 2분간 fresh 상태 유지
    cacheTime: 10 * 60 * 1000, // 10분간 캐시 유지
    enabled: !!options.enabled, // 로그인한 사용자만 활성화
    ...options,
  })
}

// 구독 상태 변경 훅
export function useUpdateSubscriptionStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ subscriptionId, status }) => 
      newsletterService.updateSubscriptionStatus(subscriptionId, status),
    
    onSuccess: (data, variables) => {
      // 구체적인 쿼리만 무효화하여 불필요한 리로딩 방지
      queryClient.invalidateQueries(['subscription', variables.subscriptionId])
      queryClient.invalidateQueries(['user-subscriptions'])
      
      toast({
        title: "상태 변경 완료",
        description: "구독 상태가 변경되었습니다.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      })
    },
    
    onError: (error) => {
      toast({
        title: "상태 변경 실패",
        description: error.message || "일시적인 오류가 발생했습니다.",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      })
    }
  })
}

// 구독 토글 훅 (카테고리별)
export function useToggleSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ category, isActive }) => 
      newsletterService.toggleSubscription(category, isActive),
    
    onSuccess: (data, variables) => {
      // fallback 모드가 아닌 경우에만 쿼리 무효화
      if (!data.fallback) {
        queryClient.invalidateQueries(['user-subscriptions'])
        queryClient.invalidateQueries(['newsletter-stats-subscribers'])
      }
      
      const action = variables.isActive ? '구독' : '구독 해제'
      
      // fallback 모드인 경우 다른 스타일의 토스트 표시
      if (data.fallback) {
        toast({
          title: `${action} 완료 (로컬)`,
          description: data.message || `${variables.category} 카테고리 ${action}이 로컬에서 처리되었습니다.`,
          icon: <CheckCircle className="h-4 w-4 text-orange-500" />
        })
      } else {
        toast({
          title: `${action} 완료`,
          description: data.message || `${variables.category} 카테고리 ${action}이 완료되었습니다.`,
          icon: <CheckCircle className="h-4 w-4 text-green-500" />
        })
      }
    },
    
    onError: (error) => {
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
    }
  })
}

// 카테고리별 기사 조회 훅
export function useCategoryArticles(category, limit = 5) {
  return useQuery({
    queryKey: ['category-articles', category, limit],
    queryFn: () => newsletterService.getCategoryArticles(category, limit),
    enabled: !!category,
    staleTime: 10 * 60 * 1000, // 10분간 fresh 상태 유지 (5분에서 증가)
    cacheTime: 30 * 60 * 1000, // 30분간 캐시 유지 (15분에서 증가)
    retry: 1, // 재시도 횟수 제한
    retryDelay: 1000, // 재시도 간격
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 재요청 방지
    onError: (error) => {
      console.warn(`카테고리 ${category} 기사 조회 실패:`, error.message)
    }
  })
}

// 카테고리별 트렌드 키워드 조회 훅
export function useTrendingKeywords(category, limit = 8) {
  return useQuery({
    queryKey: ['trending-keywords', category, limit],
    queryFn: () => newsletterService.getTrendingKeywords(category, limit),
    enabled: !!category,
    staleTime: 30 * 60 * 1000, // 30분간 fresh 상태 유지 (트렌드는 자주 변경되지 않음)
    cacheTime: 60 * 60 * 1000, // 1시간간 캐시 유지
    retry: 2, // 재시도 횟수 증가
    retryDelay: 2000, // 재시도 간격 증가
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 재요청 방지
    onError: (error) => {
      console.warn(`카테고리 ${category} 트렌드 키워드 조회 실패:`, error.message)
    }
  })
}

// 카테고리별 헤드라인 조회 훅
export function useCategoryHeadlines(category, limit = 5) {
  return useQuery({
    queryKey: ['category-headlines', category, limit],
    queryFn: () => newsletterService.getCategoryHeadlines(category, limit),
    enabled: !!category && category !== "전체", // "전체" 카테고리일 때는 비활성화
    staleTime: 60 * 60 * 1000, // 1시간간 fresh 상태 유지 (더 길게 설정)
    cacheTime: 2 * 60 * 60 * 1000, // 2시간간 캐시 유지 (더 길게 설정)
    retry: 1, // 재시도 횟수 제한
    retryDelay: 3000, // 재시도 간격
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 재요청 방지
    refetchOnReconnect: false, // 네트워크 재연결 시 재요청 방지
    onError: (error) => {
      console.warn(`카테고리 ${category} 헤드라인 조회 실패:`, error.message)
    }
  })
}
