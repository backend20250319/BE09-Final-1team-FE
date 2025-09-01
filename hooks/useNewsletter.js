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
