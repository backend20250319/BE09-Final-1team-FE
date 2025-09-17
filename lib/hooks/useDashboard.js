// hooks/useDashboard.js
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

// API 기본 설정
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
})

// JWT 토큰 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃 처리
      localStorage.removeItem('access-token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// 🔥 대시보드 메인 통계
export const useDashboardStats = (options = {}) => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        const response = await api.get('/newsletter/personalization-info')
        return response.data.data
      } catch (error) {
        console.error('대시보드 통계 조회 실패:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: 2,
    ...options
  })
}

// 🔥 카테고리별 읽기 통계
export const useCategoryStats = (options = {}) => {
  return useQuery({
    queryKey: ['categoryStats'],
    queryFn: async () => {
      try {
        // 여러 카테고리의 데이터를 병렬로 가져오기
        const categories = ['POLITICS', 'ECONOMY', 'SOCIETY', 'LIFE', 'IT_SCIENCE']
        
        const requests = categories.map(category => 
          api.get(`/newsletter/category/${category}/headlines?limit=10`)
        )
        
        const responses = await Promise.all(requests)
        
        // 카테고리별 읽기 통계 계산
        const stats = responses.map((response, index) => {
          const categoryName = categories[index]
          const articles = response.data.data || []
          const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0)
          
          return {
            name: convertCategoryToKorean(categoryName),
            reads: Math.floor(totalViews / 100), // 읽기 수로 변환
            percentage: Math.random() * 30 + 10 // 임시: 실제로는 전체 읽기 수 대비 계산
          }
        }).sort((a, b) => b.reads - a.reads)
        
        return stats
      } catch (error) {
        console.error('카테고리 통계 조회 실패:', error)
        // 에러 시 기본값 반환
        return [
          { name: '경제', reads: 1250, percentage: 25.5 },
          { name: 'IT/과학', reads: 980, percentage: 20.1 },
          { name: '사회', reads: 750, percentage: 15.3 },
          { name: '정치', reads: 650, percentage: 13.2 },
          { name: '생활', reads: 420, percentage: 8.6 }
        ]
      }
    },
    staleTime: 10 * 60 * 1000, // 10분
    retry: 2,
    ...options
  })
}

// 🔥 인기 콘텐츠
export const usePopularContent = (options = {}) => {
  return useQuery({
    queryKey: ['popularContent'],
    queryFn: async () => {
      try {
        // 각 카테고리에서 인기 기사 가져오기
        const categories = ['ECONOMY', 'IT_SCIENCE', 'SOCIETY', 'POLITICS']
        
        const requests = categories.map(category => 
          api.get(`/newsletter/category/${category}/headlines?limit=2`)
        )
        
        const responses = await Promise.all(requests)
        
        // 모든 기사를 모아서 인기도순으로 정렬
        const allArticles = responses.flatMap((response, index) => {
          const articles = response.data.data || []
          return articles.map(article => ({
            title: article.title,
            source: `${convertCategoryToKorean(categories[index])} 뉴스`,
            category: convertCategoryToKorean(categories[index]),
            views: article.views || Math.floor(Math.random() * 2000) + 500
          }))
        })
        
        return allArticles
          .sort((a, b) => b.views - a.views)
          .slice(0, 4)
      } catch (error) {
        console.error('인기 콘텐츠 조회 실패:', error)
        // 에러 시 기본값 반환
        return [
          {
            title: "AI 기술 발전으로 인한 업무 환경 변화",
            source: "IT/과학 뉴스",
            category: "IT/과학",
            views: 2345
          },
          {
            title: "경제 정책 발표, 시장 반응 주목",
            source: "경제 뉴스",
            category: "경제",
            views: 1987
          },
          {
            title: "사회 이슈에 대한 새로운 관점",
            source: "사회 뉴스",
            category: "사회",
            views: 1654
          },
          {
            title: "정치 동향 분석",
            source: "정치 뉴스",
            category: "정치",
            views: 1423
          }
        ]
      }
    },
    staleTime: 15 * 60 * 1000, // 15분
    retry: 2,
    ...options
  })
}

// 🔥 최근 활동 (사용자 읽기 기록 기반)
export const useRecentActivity = (options = {}) => {
  return useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      try {
        // 실제 사용자 활동 데이터가 있다면 가져오기
        const response = await api.get('/newsletter/subscription/my')
        const subscriptions = response.data.data || []
        
        // 구독 기반으로 최근 활동 생성
        const activities = subscriptions.slice(0, 4).map((sub, index) => {
          const types = ['구독', '읽음', '북마크', '평가']
          const times = ['2시간 전', '4시간 전', '1일 전', '2일 전']
          
          return {
            type: types[index % types.length],
            content: sub.preferredCategories?.join(', ') || '뉴스레터',
            time: times[index]
          }
        })
        
        return activities.length > 0 ? activities : getDefaultActivities()
      } catch (error) {
        console.error('최근 활동 조회 실패:', error)
        return getDefaultActivities()
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: 2,
    ...options
  })
}

// 🔥 성장 추이 통계
export const useGrowthStats = (options = {}) => {
  return useQuery({
    queryKey: ['growthStats'],
    queryFn: async () => {
      try {
        // 구독자 통계 API 호출
        const response = await api.get('/newsletter/stats/subscribers')
        const stats = response.data.data
        
        return {
          weeklyGrowth: stats.weeklyGrowth || 12.5,
          monthlyEmails: stats.monthlyEmails || 24,
          readRate: stats.readRate || 78.5
        }
      } catch (error) {
        console.error('성장 통계 조회 실패:', error)
        // 에러 시 기본값
        return {
          weeklyGrowth: 12.5,
          monthlyEmails: 24,
          readRate: 78.5
        }
      }
    },
    staleTime: 30 * 60 * 1000, // 30분
    retry: 2,
    ...options
  })
}

// 🔥 실시간 트렌딩 키워드
export const useTrendingKeywords = (options = {}) => {
  return useQuery({
    queryKey: ['trendingKeywords'],
    queryFn: async () => {
      try {
        const response = await api.get('/newsletter/trending-keywords?limit=8')
        return response.data.data || getDefaultKeywords()
      } catch (error) {
        console.error('트렌딩 키워드 조회 실패:', error)
        return getDefaultKeywords()
      }
    },
    staleTime: 10 * 60 * 1000, // 10분
    retry: 2,
    ...options
  })
}

// 🔥 개인화 정보
export const usePersonalizationInfo = (options = {}) => {
  return useQuery({
    queryKey: ['personalizationInfo'],
    queryFn: async () => {
      try {
        const response = await api.get('/newsletter/personalization-info')
        return response.data.data
      } catch (error) {
        console.error('개인화 정보 조회 실패:', error)
        throw error
      }
    },
    staleTime: 15 * 60 * 1000, // 15분
    retry: 2,
    ...options
  })
}

// 🔥 사용자 참여도 분석
export const useUserEngagement = (options = {}) => {
  return useQuery({
    queryKey: ['userEngagement'],
    queryFn: async () => {
      try {
        // 백엔드에 사용자 참여도 API가 있다면 호출
        // const response = await api.get('/newsletter/analytics/engagement')
        // return response.data.data
        
        // 임시로 구독 정보 기반 계산
        const subResponse = await api.get('/newsletter/subscription/my')
        const subscriptions = subResponse.data.data || []
        
        const totalReads = subscriptions.reduce((sum, sub) => sum + (sub.readCount || 0), 0)
        const engagementRate = subscriptions.length > 0 ? 
          Math.min(85, (totalReads / subscriptions.length) * 10) : 0
        
        return {
          totalSubscriptions: subscriptions.length,
          totalReads,
          averageReadTime: 3.2, // 실제로는 백엔드에서 계산
          engagement: Math.round(engagementRate)
        }
      } catch (error) {
        console.error('사용자 참여도 조회 실패:', error)
        return {
          totalSubscriptions: 0,
          totalReads: 0,
          averageReadTime: 3.2,
          engagement: 0
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: 2,
    ...options
  })
}

// 🔥 카테고리별 헤드라인 (Featured News용)
export const useFeaturedNews = (options = {}) => {
  return useQuery({
    queryKey: ['featuredNews'],
    queryFn: async () => {
      try {
        // 경제 카테고리에서 주요 뉴스 가져오기
        const response = await api.get('/newsletter/category/ECONOMY/headlines?limit=5')
        const articles = response.data.data || []
        
        if (articles.length > 0) {
          return {
            featured: articles[0],
            related: articles.slice(1, 5)
          }
        }
        
        return getDefaultFeaturedNews()
      } catch (error) {
        console.error('주요 뉴스 조회 실패:', error)
        return getDefaultFeaturedNews()
      }
    },
    staleTime: 15 * 60 * 1000, // 15분
    retry: 2,
    ...options
  })
}

// 🔥 실시간 통계 새로고침 (모든 데이터 refetch)
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient()
  
  return async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }),
        queryClient.invalidateQueries({ queryKey: ['categoryStats'] }),
        queryClient.invalidateQueries({ queryKey: ['popularContent'] }),
        queryClient.invalidateQueries({ queryKey: ['recentActivity'] }),
        queryClient.invalidateQueries({ queryKey: ['growthStats'] }),
        queryClient.invalidateQueries({ queryKey: ['trendingKeywords'] }),
        queryClient.invalidateQueries({ queryKey: ['featuredNews'] }),
        queryClient.invalidateQueries({ queryKey: ['userEngagement'] })
      ])
    } catch (error) {
      console.error('대시보드 새로고침 실패:', error)
      throw error
    }
  }
}

// 🔥 특정 쿼리만 새로고침
export const useRefreshQuery = (queryKey) => {
  const queryClient = useQueryClient()
  
  return async () => {
    try {
      await queryClient.invalidateQueries({ queryKey })
    } catch (error) {
      console.error(`${queryKey} 새로고침 실패:`, error)
      throw error
    }
  }
}

// 🔥 로딩 상태 통합 관리
export const useDashboardLoading = () => {
  const dashboardStats = useDashboardStats({ enabled: false })
  const categoryStats = useCategoryStats({ enabled: false })
  const popularContent = usePopularContent({ enabled: false })
  const recentActivity = useRecentActivity({ enabled: false })
  
  return {
    isLoading: dashboardStats.isLoading || categoryStats.isLoading || 
               popularContent.isLoading || recentActivity.isLoading,
    isError: dashboardStats.isError || categoryStats.isError || 
             popularContent.isError || recentActivity.isError,
    errors: {
      dashboardStats: dashboardStats.error,
      categoryStats: categoryStats.error,
      popularContent: popularContent.error,
      recentActivity: recentActivity.error
    }
  }
}

// 🔥 헬퍼 함수들
function convertCategoryToKorean(englishCategory) {
  const categoryMap = {
    'POLITICS': '정치',
    'ECONOMY': '경제',
    'SOCIETY': '사회',
    'LIFE': '생활',
    'INTERNATIONAL': '세계',
    'IT_SCIENCE': 'IT/과학',
    'VEHICLE': '자동차/교통',
    'TRAVEL_FOOD': '여행/음식',
    'ART': '예술'
  }
  return categoryMap[englishCategory] || englishCategory
}

function getDefaultActivities() {
  return [
    { type: "구독", content: "매일경제 뉴스", time: "2시간 전" },
    { type: "읽음", content: "AI & Tech Weekly", time: "4시간 전" },
    { type: "북마크", content: "환경 & 지속가능", time: "1일 전" },
    { type: "평가", content: "정치 인사이드", time: "2일 전" }
  ]
}

function getDefaultKeywords() {
  return [
    "인공지능", "경제정책", "환경보호", "디지털전환", 
    "스타트업", "블록체인", "메타버스", "ESG"
  ]
}

function getDefaultFeaturedNews() {
  return {
    featured: {
      title: "주요 경제 정책 발표, 시장에 미치는 파급효과 분석",
      summary: "정부가 발표한 새로운 경제 정책이 금융시장과 실물경제에 미칠 영향에 대해 전문가들이 다양한 분석을 내놓고 있습니다.",
      source: "경제신문",
      views: 2345
    },
    related: []
  }
}

// 🔥 에러 핸들링 및 재시도 로직
const defaultQueryOptions = {
  retry: (failureCount, error) => {
    // 인증 에러는 재시도하지 않음
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return false
    }
    // 최대 2번 재시도
    return failureCount < 2
  },
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  onError: (error) => {
    console.error('API Error:', error)
    // 필요하다면 토스트 메시지 표시
  }
}

// 모든 훅에 기본 옵션 적용
export const withDefaultOptions = (hookFn) => {
  return (options = {}) => {
    return hookFn({
      ...defaultQueryOptions,
      ...options
    })
  }
}

// 🔥 실제 API 응답 형식에 맞춘 데이터 변환
export const transformApiResponse = (response) => {
  // API 응답이 { success: true, data: {...}, message: "..." } 형식인 경우
  if (response?.data?.success && response?.data?.data) {
    return response.data.data
  }
  
  // 직접 데이터가 온 경우
  if (response?.data) {
    return response.data
  }
  
  return response
}

// 🔥 캐시 무효화 유틸리티
export const useCacheUtils = () => {
  const queryClient = useQueryClient()
  
  return {
    // 특정 쿼리 캐시 제거
    removeQuery: (queryKey) => {
      queryClient.removeQueries({ queryKey })
    },
    
    // 모든 대시보드 관련 쿼리 캐시 제거
    clearDashboardCache: () => {
      const dashboardQueries = [
        'dashboardStats', 'categoryStats', 'popularContent', 
        'recentActivity', 'growthStats', 'trendingKeywords', 
        'featuredNews', 'userEngagement', 'personalizationInfo'
      ]
      
      dashboardQueries.forEach(queryKey => {
        queryClient.removeQueries({ queryKey })
      })
    },
    
    // 캐시된 데이터 미리 가져오기
    prefetchQuery: async (queryKey, queryFn) => {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000
      })
    }
  }
}
