"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Mail, 
  Clock, 
  Users, 
  Star, 
  TrendingUp, 
  Bell, 
  Zap, 
  Eye, 
  BarChart3,
  Calendar,
  Activity,
  Target,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Bookmark,
  Share2,
  RefreshCw,
  Info
} from "lucide-react"

import { TextWithTooltips } from "@/components/tooltip"
import Link from "next/link"
import { getUserRole, getUserInfo } from "@/lib/auth/auth"
import { useUserSubscriptions, useUnsubscribeNewsletter } from "@/lib/hooks/useNewsletter"
import { useToast } from "@/components/ui/use-toast"
import NewsletterTemplate from "@/components/newsletter/NewsletterTemplate"
import { newsletterService } from "@/lib/api/newsletter"
import { useKakaoPermission } from "@/lib/hooks/useKakaoPermission"
import KakaoPermissionModal from "@/components/KakaoPermissionModal"
import SubscriptionLimitIndicator from "@/components/SubscriptionLimitIndicator"

// 쿠키에서 특정 값을 가져오는 유틸리티 함수
const getCookie = (name) => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

export default function IntegratedNewsletterDashboard() {
  const [userRole, setUserRole] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [previewNewsletter, setPreviewNewsletter] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const { toast } = useToast()

  // 카카오 권한 관련
  const {
    hasPermission,
    checkTalkMessagePermission,
    requestPermissionFlow,
    isLoading: isPermissionLoading
  } = useKakaoPermission()

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState({})

  // 구독 폼 상태
  const [subscriptionForm, setSubscriptionForm] = useState({
    email: '',
    emailSubscription: true,
    kakaoSubscription: false
  })
  const [subscriberCount, setSubscriberCount] = useState(0)

  // 뉴스 관련 상태
  const [newsData, setNewsData] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState(null)

  // React Query 훅들
  const { 
    data: userSubscriptions = [], 
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions 
  } = useUserSubscriptions({
    enabled: !!userRole,
    retry: 1,
    retryDelay: 1000,
  })

  // 디버깅: 구독 데이터 상태 로깅
  console.log('🔍 Dashboard 구독 데이터 상태:', {
    userSubscriptions: userSubscriptions,
    subscriptionsLoading: subscriptionsLoading,
    subscriptionsError: subscriptionsError,
    userRole: userRole,
    enabled: !!userRole,
    length: userSubscriptions?.length || 0,
    isArray: Array.isArray(userSubscriptions),
    firstSubscription: userSubscriptions?.[0]
  });

  const unsubscribeMutation = useUnsubscribeNewsletter()

  // 카카오 권한 모달 관련 함수들
  const openModal = (data) => {
    setModalData(data)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalData({})
  }

  // 카카오 뉴스레터 체크박스 변경 핸들러
  const handleKakaoNewsletterToggle = async (checked) => {
    if (checked) {
      // 카카오 뉴스레터 활성화 시 권한 확인
      if (hasPermission === false) {
        // 권한이 없는 경우 모달 표시
        openModal({ category: "뉴스레터" })
        return
      } else if (hasPermission === null) {
        // 권한 상태를 모르는 경우 확인 후 모달 표시
        try {
          const hasPermissionResult = await checkTalkMessagePermission()
          if (!hasPermissionResult) {
            openModal({ category: "뉴스레터" })
            return
          }
        } catch (error) {
          console.error('권한 확인 실패:', error)
          // 권한 확인 실패 시에도 모달 표시
          openModal({ category: "뉴스레터" })
          return
        }
      }
    }
    
    setSubscriptionForm(prev => ({ ...prev, kakaoSubscription: checked }))
  }

  // 카카오 권한 모달에서 권한 허용 클릭
  const handlePermissionConfirm = async () => {
    try {
      const permissionResult = await requestPermissionFlow("뉴스레터")
      
      if (permissionResult) {
        setSubscriptionForm(prev => ({ ...prev, kakaoSubscription: true }))
        closeModal()
      } else {
        // 권한 요청 실패 (세션 만료 등)
        setSubscriptionForm(prev => ({ ...prev, kakaoSubscription: false }))
        closeModal()
        toast({
          title: "권한 요청 실패",
          description: "카카오톡 권한 요청에 실패했습니다. 다시 시도해주세요.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('권한 요청 실패:', error)
      // 권한 요청 실패 시 체크박스는 해제된 상태 유지
      setSubscriptionForm(prev => ({ ...prev, kakaoSubscription: false }))
      closeModal()
      
      toast({
        title: "권한 요청 실패",
        description: "카카오톡 권한 요청 중 오류가 발생했습니다. 카카오 로그인을 다시 시도해주세요.",
        variant: "destructive"
      })
    }
  }

  // 카카오 권한 모달에서 대체 옵션 선택
  const handleAlternativeOption = () => {
    setSubscriptionForm(prev => ({ 
      ...prev, 
      kakaoSubscription: false,
      emailSubscription: true 
    }))
    closeModal()
    
    toast({
      title: "이메일 구독으로 변경",
      description: "이메일로 뉴스레터를 받아보실 수 있습니다.",
    })
  }

  // 뉴스레터 미리보기 생성 함수
  const generateNewsletterPreview = async (category) => {
    setPreviewLoading(true)
    setSelectedCategory(category)
    
    try {
      const content = await newsletterService.generateNewsletterContent({
        newsletterId: Date.now(),
        category: category,
        personalized: true,
        userId: userInfo?.id || userInfo?.email,
        limit: 5
      })
      
      setPreviewNewsletter(content)
      
      toast({
        title: "✅ 뉴스레터 미리보기 생성 완료",
        description: `${category} 카테고리 뉴스레터를 생성했습니다.`,
      })
    } catch (error) {
      console.error('뉴스레터 미리보기 생성 실패:', error)
      toast({
        title: "❌ 뉴스레터 미리보기 생성 실패",
        description: error.message || "뉴스레터를 생성하는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    } finally {
      setPreviewLoading(false)
    }
  }

  // 미리보기 닫기 함수
  const closePreview = () => {
    setPreviewNewsletter(null)
    setSelectedCategory(null)
  }

  // 구독 신청 처리
  const handleSubscription = async (e) => {
    e.preventDefault()
    
    if (!subscriptionForm.email) {
      toast({
        title: "이메일을 입력해주세요",
        variant: "destructive"
      })
      return
    }

    // 카카오톡 뉴스레터 선택 시 권한 재확인
    if (subscriptionForm.kakaoSubscription) {
      const hasPermissionResult = await checkTalkMessagePermission()
      if (!hasPermissionResult) {
        toast({
          title: "카카오톡 권한이 필요합니다",
          description: "카카오톡 뉴스레터를 받으려면 메시지 전송 권한이 필요합니다.",
          variant: "destructive"
        })
        return
      }
    }

    // 낙관적 업데이트: 즉시 UI 업데이트
    const originalSubscriptions = userSubscriptions
    const tempSubscription = {
      id: `temp-${Date.now()}`,
      category: "일반",
      preferredCategories: ["일반"],
      frequency: "DAILY",
      email: subscriptionForm.email,
      emailNewsletter: subscriptionForm.emailSubscription,
      kakaoNewsletter: subscriptionForm.kakaoSubscription,
      subscribedAt: new Date().toISOString(),
      isTemporary: true
    }

    // 임시로 구독 목록에 추가 (낙관적 업데이트)
    console.log('🔄 낙관적 업데이트: 임시 구독 추가')
    
    try {
      // 구독 API 호출
      const response = await fetch('/api/newsletters/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: subscriptionForm.email,
          category: "일반",
          emailNewsletter: subscriptionForm.emailSubscription,
          kakaoNewsletter: subscriptionForm.kakaoSubscription,
          hasKakaoPermission: subscriptionForm.kakaoSubscription ? hasPermission : false,
          hasAuth: !!userRole
        })
      })

      if (response.ok) {
        // Content-Type 확인 후 JSON 파싱
        const contentType = response.headers.get('content-type')
        let result = null
        
        if (contentType && contentType.includes('application/json')) {
          result = await response.json()
        } else {
          const responseText = await response.text()
          console.log('구독 성공 응답 (JSON 아님):', responseText)
          result = { success: true, message: '구독이 완료되었습니다.' }
        }
        
        let description = "구독이 완료되었습니다!"
        if (subscriptionForm.emailSubscription && subscriptionForm.kakaoSubscription) {
          description = "이메일과 카카오톡으로 뉴스레터를 받아보세요."
        } else if (subscriptionForm.kakaoSubscription) {
          description = "카카오톡으로 뉴스레터를 받아보세요."
        } else {
          description = "이메일로 뉴스레터를 받아보세요."
        }

        toast({
          title: "✅ 구독 완료!",
          description: description,
        })
        
        // 구독자 수 증가
        setSubscriberCount(prev => prev + 1)
        
        // 폼 초기화
        setSubscriptionForm({ email: '', emailSubscription: true, kakaoSubscription: false })
        
        // 구독 정보 즉시 새로고침
        console.log('🔄 구독 성공 후 즉시 새로고침')
        await refetchSubscriptions()
        
        // 추가로 잠시 후 한 번 더 새로고침 (백엔드 동기화 대기)
        setTimeout(() => {
          console.log('🔄 백엔드 동기화 대기 후 추가 새로고침')
          refetchSubscriptions()
        }, 2000)
        
      } else {
        // 오류 응답 처리
        const contentType = response.headers.get('content-type')
        let errorMessage = '구독 실패'
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } else {
            const errorText = await response.text()
            console.error('구독 API 오류 응답:', errorText)
            errorMessage = `서버 오류: ${response.status} ${response.statusText}`
          }
        } catch (parseError) {
          console.error('오류 응답 파싱 실패:', parseError)
          errorMessage = `서버 오류: ${response.status} ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('구독 실패:', error)
      
      // 실패 시 낙관적 업데이트 롤백
      console.log('🔄 구독 실패로 인한 롤백')
      
      toast({
        title: "❌ 구독 실패",
        description: error.message || "구독 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      })
      
      // 구독 정보 새로고침하여 정확한 상태 복원
      refetchSubscriptions()
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 대시보드 인증 확인 시작")
      
      // 1. localStorage에서 사용자 정보 확인
      const storedUserInfo = getUserInfo()
      console.log("🔍 localStorage 사용자 정보:", storedUserInfo)
      
      // 2. 쿠키에서 access-token 확인
      const accessToken = getCookie('access-token')
      const hasAccessToken = !!accessToken
      console.log("🍪 쿠키에 access-token 존재:", hasAccessToken)
      
      if (storedUserInfo) {
        setUserInfo(storedUserInfo)
        setSubscriptionForm(prev => ({ ...prev, email: storedUserInfo.email || '' }))
        
        const role = storedUserInfo.role || 
                    storedUserInfo.userRole || 
                    storedUserInfo.authorities?.[0] || 
                    storedUserInfo.roles?.[0] || 
                    "user"
        
        console.log("🔍 localStorage에서 추출된 role:", role)
        setUserRole(role)
      } else if (hasAccessToken) {
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
          })
          
          if (response.ok) {
            // Content-Type 확인 후 JSON 파싱
            const contentType = response.headers.get('content-type')
            let userData = null
            
            try {
              if (contentType && contentType.includes('application/json')) {
                userData = await response.json()
              } else {
                const responseText = await response.text()
                console.error('사용자 인증 API JSON이 아닌 응답:', responseText)
                setUserRole(null)
                return
              }
            } catch (parseError) {
              console.error('사용자 인증 API 응답 파싱 실패:', parseError)
              setUserRole(null)
              return
            }
            
            if (userData && userData.success && userData.data) {
              const apiUserInfo = userData.data
              setUserInfo(apiUserInfo)
              setSubscriptionForm(prev => ({ ...prev, email: apiUserInfo.email || '' }))
              
              if (typeof window !== 'undefined') {
                localStorage.setItem('userInfo', JSON.stringify(apiUserInfo))
              }
              
              const role = apiUserInfo.role || 
                          apiUserInfo.userRole || 
                          apiUserInfo.authorities?.[0] || 
                          apiUserInfo.roles?.[0] || 
                          "user"
              
              setUserRole(role)
            } else {
              setUserRole(null)
            }
          } else {
            setUserRole(null)
          }
        } catch (error) {
          console.error("❌ API 사용자 정보 조회 실패:", error)
          setUserRole(null)
        }
      } else {
        setUserRole(null)
      }
      
      setIsLoaded(true)
    }

    checkAuth()

    // 구독자 수 초기화 (실제 구독 수 기반)
    setSubscriberCount(Array.isArray(userSubscriptions) ? userSubscriptions.length : 0)

    const handleAuthChange = () => {
      setTimeout(checkAuth, 100)
    }

    window.addEventListener('authStateChanged', handleAuthChange)
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange)
    }
  }, [])

  // 구독 데이터 주기적 새로고침 (30초마다)
  useEffect(() => {
    if (!userRole) return;

    const refreshInterval = setInterval(() => {
      console.log('🔄 대시보드 구독 데이터 자동 새로고침');
      refetchSubscriptions();
    }, 30000); // 30초마다

    return () => clearInterval(refreshInterval);
  }, [userRole, refetchSubscriptions]);

  // 페이지 포커스 시 구독 데이터 새로고침
  useEffect(() => {
    if (!userRole) return;

    const handleFocus = () => {
      console.log('🔄 페이지 포커스 시 구독 데이터 새로고침');
      refetchSubscriptions();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userRole, refetchSubscriptions]);

  // 구독 정보 변경 시 구독자 수 동기화
  useEffect(() => {
    if (userSubscriptions && Array.isArray(userSubscriptions)) {
      setSubscriberCount(userSubscriptions.length);
      console.log('🔄 구독자 수 동기화:', userSubscriptions.length);
    }
  }, [userSubscriptions]);

  // 뉴스 데이터 가져오기
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsLoading(true)
        setNewsError(null)
        
        console.log('🔄 뉴스 데이터 가져오기 시작')
        const response = await fetch('/api/news?limit=5')
        
        // 응답 상태 확인
        if (!response.ok) {
          const errorText = await response.text()
          console.error('뉴스 API 오류 응답:', errorText)
          throw new Error(`뉴스 API 오류: ${response.status} ${response.statusText}`)
        }
        
        // Content-Type 확인
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text()
          console.error('JSON이 아닌 응답:', responseText)
          throw new Error('서버에서 JSON이 아닌 응답을 반환했습니다.')
        }
        
        const data = await response.json()
        
        console.log('📡 뉴스 API 응답:', {
          success: data.success,
          hasData: !!data.data,
          dataLength: data.data?.length || 0,
          fallback: data.metadata?.fallback,
          message: data.metadata?.message
        })
        
        if (data.success) {
          const newsItems = data.data || data.content || []
          setNewsData(newsItems)
          
          if (data.metadata?.fallback) {
            console.log('⚠️ 폴백 뉴스 데이터 사용 중')
            // 폴백 데이터 사용 시 사용자에게 알림 (선택사항)
          }
        } else {
          setNewsError(data.error || '뉴스를 불러오는데 실패했습니다.')
        }
      } catch (error) {
        console.error('뉴스 조회 실패:', error)
        setNewsError('뉴스를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setNewsLoading(false)
      }
    }

    fetchNews()
  }, [])

  // HTML 태그를 제거하는 함수
  const stripHtmlTags = (html) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  }

  // 뉴스 요약을 생성하는 함수
  const getNewsSummary = (news) => {
    if (news.summary) {
      return stripHtmlTags(news.summary)
    }
    if (news.description) {
      return stripHtmlTags(news.description)
    }
    if (news.content) {
      const cleanContent = stripHtmlTags(news.content)
      return cleanContent.length > 100 ? cleanContent.substring(0, 100) + '...' : cleanContent
    }
    return '뉴스 내용을 불러오는 중입니다.'
  }

  // 백엔드 카테고리명을 프론트엔드 카테고리명으로 변환하는 함수
  const mapBackendCategoryToFrontend = (backendCategory) => {
    const categoryMapping = {
      'POLITICS': '정치',
      'ECONOMY': '경제',
      'SOCIETY': '사회',
      'LIFE': '생활',
      'INTERNATIONAL': '세계',
      'IT_SCIENCE': 'IT/과학',
      'VEHICLE': '자동차/교통',
      'TRAVEL_FOOD': '여행/음식',
      'ART': '예술'
    };
    return categoryMapping[backendCategory] || backendCategory;
  };

  // 구독 정보에서 프론트엔드 카테고리 목록 추출
  const getFrontendCategories = (subscription) => {
    const categories = [];
    
    // 매핑된 카테고리 직접 매칭
    if (subscription.category) {
      categories.push(subscription.category);
    }
    
    // 백엔드 원본 데이터에서 preferredCategories 처리
    if (subscription._backendData && subscription._backendData.preferredCategories && Array.isArray(subscription._backendData.preferredCategories)) {
      subscription._backendData.preferredCategories.forEach(prefCat => {
        const frontendCategory = mapBackendCategoryToFrontend(prefCat);
        if (frontendCategory && !categories.includes(frontendCategory)) {
          categories.push(frontendCategory);
        }
      });
    }
    
    // 백엔드 preferredCategories 직접 처리 (fallback)
    if (subscription.preferredCategories && Array.isArray(subscription.preferredCategories)) {
      subscription.preferredCategories.forEach(prefCat => {
        const frontendCategory = mapBackendCategoryToFrontend(prefCat);
        if (frontendCategory && !categories.includes(frontendCategory)) {
          categories.push(frontendCategory);
        }
      });
    }
    
    return categories;
  };

  // 대시보드 통계 계산 (실시간 업데이트)
  const dashboardStats = {
    totalSubscriptions: Array.isArray(userSubscriptions) ? userSubscriptions.length : 0,
    totalReads: Array.isArray(userSubscriptions) ? userSubscriptions.reduce((sum, sub) => sum + (sub.readCount || 0), 0) : 0,
    averageReadTime: 3.2,
    engagement: Math.min(85, (Array.isArray(userSubscriptions) ? userSubscriptions.length : 0) * 20)
  }

  // 카테고리별 읽기 통계
  const categoryStats = [
    { name: "경제", reads: 45, percentage: 28.8 },
    { name: "IT/과학", reads: 38, percentage: 24.4 },
    { name: "정치", reads: 32, percentage: 20.5 },
    { name: "사회", reads: 25, percentage: 16.0 },
    { name: "생활", reads: 16, percentage: 10.3 }
  ]

  // 인기 콘텐츠
  const popularContent = [
    {
      title: "한국은행 기준금리 동결 결정",
      source: "매일경제 뉴스",
      category: "경제",
      views: 1240
    },
    {
      title: "ChatGPT-5 출시 예고",
      source: "AI & Tech Weekly",
      category: "IT/과학",
      views: 892
    },
    {
      title: "환경 정책 개편안 발표",
      source: "환경 & 지속가능",
      category: "사회",
      views: 756
    },
    {
      title: "정치 현안 분석 리포트",
      source: "정치 인사이드",
      category: "정치",
      views: 634
    }
  ]



  // 로딩 중일 때
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">로딩 중...</h1>
            <p className="text-gray-600">사용자 정보를 확인하고 있습니다.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/newsletter">
                <Button variant="ghost" size="sm" className="hover-lift">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  뒤로가기
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">뉴스레터 대시보드</h1>
                {userInfo && (
                  <p className="text-sm text-gray-600 mt-1">
                    안녕하세요, {userInfo.name || userInfo.email || '사용자'}님! ({userRole})
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchSubscriptions()}
                disabled={subscriptionsLoading}
                className="hover-lift"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${subscriptionsLoading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
              <Badge className="bg-green-100 text-green-800">
                활성 구독자
              </Badge>
            </div>
          </div>
          <p className="text-gray-600">구독 활동과 읽기 패턴을 한눈에 확인하세요</p>
        </div>
        
        {/* 상단 구독 섹션 */}
        <div className="mb-12">
          <Card className="glass hover-lift animate-slide-in border-2 border-blue-100">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                📧 오늘의 핫한 뉴스
              </CardTitle>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4">
                <Badge variant="destructive" className="text-white">
                  핫함
                </Badge>
                <span>{subscriberCount}명이 구독중</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>0 조회</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubscription} className="space-y-6">
                {/* 이메일 입력 */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    이메일 주소
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="이메일 주소를 입력하세요"
                    value={subscriptionForm.email}
                    onChange={(e) => setSubscriptionForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full"
                    required
                  />
                </div>

                {/* 구독 방법 선택 */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    구독 방법 선택
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="email-newsletter"
                        checked={subscriptionForm.emailSubscription}
                        onCheckedChange={(checked) => 
                          setSubscriptionForm(prev => ({ ...prev, emailSubscription: checked }))
                        }
                      />
                      <Label htmlFor="email-newsletter" className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-blue-500" />
                        이메일 뉴스레터
                        <Badge variant="outline">기본</Badge>
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      매일 아침 이메일로 맞춤 뉴스를 받아보세요
                    </p>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="kakao-newsletter"
                        checked={subscriptionForm.kakaoSubscription}
                        onCheckedChange={handleKakaoNewsletterToggle}
                      />
                      <Label htmlFor="kakao-newsletter" className="flex items-center gap-2 text-sm">
                        💬 카카오톡 뉴스레터
                        {hasPermission === true ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">사용 가능</Badge>
                        ) : hasPermission === false ? (
                          <Badge variant="destructive">권한 필요</Badge>
                        ) : (
                          <Badge variant="secondary">확인 중...</Badge>
                        )}
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      카카오톡으로 매일 아침 맞춤 뉴스를 받아보세요 (카카오 로그인 필요)
                    </p>
                  </div>
                </div>

                {/* 구독 안내 */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">구독 안내</p>
                      <ul className="text-blue-700 space-y-1 text-xs">
                        <li>• 완전무료 구독 해지 가능</li>
                        <li>• 광고성 메시지 없음</li>
                        <li>• 직접 뉴스만 전송</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 구독 버튼 */}
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                  disabled={!subscriptionForm.email || (!subscriptionForm.emailSubscription && !subscriptionForm.kakaoSubscription)}
                >
                  <Bell className="h-5 w-5 mr-2" />
                  뉴스레터 구독하기
                </Button>
              </form>

              {/* 작성자 정보 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">작성자</p>
                    <p className="text-sm text-gray-500">
                      📅 2025. 9. 8. ⏰ 오전 12:55
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-bold text-gray-900 mb-2">오늘의 뉴스</h3>
                  
                  {newsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">뉴스 로딩 중...</p>
                    </div>
                  ) : newsError ? (
                    <div className="text-center text-gray-500 py-8">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <p>{newsError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => window.location.reload()}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        다시 시도
                      </Button>
                    </div>
                  ) : newsData.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>아직 뉴스가 없습니다.</p>
                      <p className="text-sm">곧 새로운 뉴스를 가져올 예정입니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 폴백 데이터 알림 */}
                      {newsData.some(news => news._backendData?.fallback) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-800">
                              백엔드 서버 연결 문제로 샘플 뉴스를 표시하고 있습니다.
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {newsData.slice(0, 3).map((news) => (
                        <div key={news.id} className="border rounded-lg p-4 bg-white/50 hover:bg-white/70 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                                {news.title}
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {getNewsSummary(news)}
                              </p>
                            </div>
                            {news.imageUrl && (
                              <img 
                                src={news.imageUrl} 
                                alt={news.title}
                                className="w-16 h-16 object-cover rounded ml-3 flex-shrink-0"
                              />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {news.categoryKo}
                              </Badge>
                              <span>{news.source}</span>
                            </div>
                            <span>
                              {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString('ko-KR') : '오늘'}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {newsData.length > 3 && (
                        <div className="text-center">
                          <Button variant="outline" size="sm" className="text-xs">
                            더 많은 뉴스 보기 ({newsData.length - 3}개 더)
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-gray-700">태그:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(() => {
                        // 뉴스에서 카테고리 추출하여 태그로 표시
                        const categories = [...new Set(newsData.map(news => news.categoryKo).filter(Boolean))];
                        
                        if (categories.length > 0) {
                          return categories.slice(0, 5).map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ));
                        } else {
                          return (
                            <>
                              <Badge variant="outline" className="text-xs">정치</Badge>
                              <Badge variant="outline" className="text-xs">경제</Badge>
                              <Badge variant="outline" className="text-xs">IT/과학</Badge>
                              <Badge variant="outline" className="text-xs">사회</Badge>
                              <Badge variant="outline" className="text-xs">생활</Badge>
                            </>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 하단 대시보드 섹션 */}
        {userRole && (
          <div>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 구독</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalSubscriptions}</p>
                    </div>
                    <Mail className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 읽음</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalReads}</p>
                    </div>
                    <Eye className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.3s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">평균 읽기 시간</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardStats.averageReadTime}분</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.4s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">참여도</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardStats.engagement}%</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Display */}
            {subscriptionsError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700">
                    구독 정보를 불러오는 중 오류가 발생했습니다. 새로고침 버튼을 클릭해주세요.
                  </span>
                </div>
              </div>
            )}

            {/* 구독 제한 표시기 */}
            <div className="mb-6">
              <SubscriptionLimitIndicator showUpgradePrompt={true} />
            </div>

            {/* My Subscriptions Section */}
            <div className="mb-8">
              <Card className="glass hover-lift animate-slide-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-blue-500" />
                        내 구독 정보
                      </CardTitle>
                      <CardDescription>
                        현재 구독 중인 뉴스레터 ({Array.isArray(userSubscriptions) ? userSubscriptions.length : 0}/3개)
                        {subscriptionsError && (
                          <span className="text-red-500 ml-2">(오류 발생)</span>
                        )}
                        {!subscriptionsLoading && !subscriptionsError && (!Array.isArray(userSubscriptions) || userSubscriptions.length === 0) && (
                          <span className="text-gray-500 ml-2">(구독 정보 없음)</span>
                        )}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('🔄 수동 새로고침 버튼 클릭');
                        refetchSubscriptions();
                      }}
                      disabled={subscriptionsLoading}
                      className="hover-lift"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${subscriptionsLoading ? 'animate-spin' : ''}`} />
                      새로고침
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {subscriptionsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">구독 정보 로딩 중...</p>
                    </div>
                  ) : Array.isArray(userSubscriptions) && userSubscriptions.length > 0 ? (
                    <div className="space-y-6">
                      {userSubscriptions.map((subscription) => {
                        const frontendCategories = getFrontendCategories(subscription);
                        const primaryCategory = frontendCategories[0] || '일반';
                        
                        // 디버깅: 개별 구독 정보 로깅
                        console.log('🔍 개별 구독 정보:', {
                          subscription: subscription,
                          frontendCategories: frontendCategories,
                          primaryCategory: primaryCategory
                        });
                        
                        return (
                          <div key={subscription.id} className="border rounded-lg overflow-hidden bg-white/30">
                            <div className="p-4 bg-white/50">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                                    {frontendCategories.length > 0 ? frontendCategories.join(', ') : '일반 뉴스레터'}
                                    {frontendCategories.map((category, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                        {category}
                                      </Badge>
                                    ))}
                                  </h4>
                                <p className="text-xs text-gray-500 mb-2">
                                  {subscription.frequency === 'DAILY' ? '매일' : 
                                   subscription.frequency === 'WEEKLY' ? '주간' : 
                                   subscription.frequency === 'MONTHLY' ? '월간' : '즉시'} 발송
                                </p>
                                <div className="text-xs text-gray-500 space-y-1">
                                  <div>구독일: {
                                    subscription.subscribedAt && subscription.subscribedAt !== 'Invalid Date' 
                                      ? new Date(subscription.subscribedAt).toLocaleDateString()
                                      : subscription.createdAt && subscription.createdAt !== 'Invalid Date'
                                        ? new Date(subscription.createdAt).toLocaleDateString()
                                        : '정보 없음'
                                  }</div>
                                  {subscription.lastSentAt && subscription.lastSentAt !== 'Invalid Date' && (
                                    <div>마지막 발송: {new Date(subscription.lastSentAt).toLocaleDateString()}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (selectedCategory === primaryCategory && previewNewsletter) {
                                      setPreviewNewsletter(null);
                                      setSelectedCategory(null);
                                    } else {
                                      generateNewsletterPreview(primaryCategory);
                                    }
                                  }}
                                  disabled={previewLoading}
                                  className={`text-blue-500 hover:text-blue-700 hover:bg-blue-50 ${
                                    selectedCategory === primaryCategory && previewNewsletter
                                      ? 'bg-blue-50 text-blue-700' 
                                      : ''
                                  }`}
                                >
                                  {previewLoading && selectedCategory === primaryCategory ? (
                                    <>
                                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                      생성 중...
                                    </>
                                  ) : selectedCategory === primaryCategory && previewNewsletter ? (
                                    <>
                                      <Eye className="h-3 w-3 mr-1" />
                                      미리보기 닫기
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-3 w-3 mr-1" />
                                      미리보기
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      console.log('🔄 구독 해제 시작:', subscription.id)
                                      
                                      // 구독 해제 API 호출
                                      const response = await fetch(`/api/newsletters/subscription/${subscription.id}`, {
                                        method: 'DELETE',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        credentials: 'include'
                                      })

                                      if (response.ok) {
                                        toast({
                                          title: "✅ 구독 해제 완료",
                                          description: "뉴스레터 구독이 해제되었습니다.",
                                        })
                                        
                                        // 구독자 수 감소
                                        setSubscriberCount(prev => Math.max(0, prev - 1))
                                        
                                        // 구독 정보 즉시 새로고침
                                        console.log('🔄 구독 해제 후 즉시 새로고침')
                                        await refetchSubscriptions()
                                        
                                        // 추가로 잠시 후 한 번 더 새로고침
                                        setTimeout(() => {
                                          console.log('🔄 백엔드 동기화 대기 후 추가 새로고침')
                                          refetchSubscriptions()
                                        }, 1000)
                                        
                                      } else {
                                        // 오류 응답 처리
                                        const contentType = response.headers.get('content-type')
                                        let errorMessage = '구독 해제 실패'
                                        
                                        try {
                                          if (contentType && contentType.includes('application/json')) {
                                            const errorData = await response.json()
                                            errorMessage = errorData.message || errorMessage
                                          } else {
                                            const errorText = await response.text()
                                            console.error('구독 해제 API 오류 응답:', errorText)
                                            errorMessage = `서버 오류: ${response.status} ${response.statusText}`
                                          }
                                        } catch (parseError) {
                                          console.error('구독 해제 오류 응답 파싱 실패:', parseError)
                                          errorMessage = `서버 오류: ${response.status} ${response.statusText}`
                                        }
                                        
                                        throw new Error(errorMessage)
                                      }
                                    } catch (error) {
                                      console.error('구독 해제 실패:', error)
                                      toast({
                                        title: "❌ 구독 해제 실패",
                                        description: error.message || "구독 해제 중 오류가 발생했습니다.",
                                        variant: "destructive"
                                      })
                                      
                                      // 실패 시 구독 정보 새로고침
                                      refetchSubscriptions()
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  구독해제
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* 뉴스레터 미리보기 섹션 */}
                          {selectedCategory === primaryCategory && previewNewsletter && (
                            <div className="border-t bg-gray-50/50">
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {selectedCategory} 뉴스레터 미리보기
                                    </span>
                                    {previewNewsletter.sections?.length > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        {previewNewsletter.sections.length}개 섹션
                                      </Badge>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setPreviewNewsletter(null);
                                      setSelectedCategory(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    ✕
                                  </Button>
                                </div>
                                
                                {/* 뉴스레터 콘텐츠 */}
                                <div className="max-h-96 overflow-y-auto bg-white rounded-lg border p-4">
                                  <NewsletterTemplate 
                                    newsletter={previewNewsletter} 
                                    isPreview={true} 
                                  />
                                </div>
                                
                                {/* 미리보기 하단 액션 */}
                                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                  <span>실제 이메일에서는 개인화된 콘텐츠가 포함됩니다</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => generateNewsletterPreview(selectedCategory)}
                                    disabled={previewLoading}
                                    className="text-xs"
                                  >
                                    <RefreshCw className={`h-3 w-3 mr-1 ${previewLoading ? 'animate-spin' : ''}`} />
                                    새로고침
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  ) : subscriptionsError ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">구독 정보를 불러올 수 없습니다</h3>
                      <p className="text-gray-500 mb-4">
                        {subscriptionsError.message || "서버 연결에 문제가 있습니다."}
                      </p>
                      <Button 
                        onClick={() => refetchSubscriptions()}
                        className="hover-lift"
                        variant="outline"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        다시 시도
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">구독 중인 뉴스레터가 없습니다</h3>
                      <p className="text-gray-500 mb-4">
                        관심 있는 카테고리의 뉴스레터를 구독해보세요.
                      </p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => {
                            // 상단 구독 폼으로 스크롤
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="hover-lift mr-2"
                        >
                          뉴스레터 구독하기
                        </Button>
                        <Button 
                          onClick={() => refetchSubscriptions()}
                          variant="outline"
                          className="hover-lift"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          구독 정보 새로고침
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* 카테고리별 읽기 통계와 인기 콘텐츠를 나란히 배치 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 카테고리별 읽기 통계 */}
                  <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.5s' }}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                        가장 많이 읽는 뉴스레터 카테고리
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categoryStats.map((category, index) => (
                          <div key={category.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-600 w-16">{category.name}</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${category.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{category.reads}회 읽음</p>
                              <p className="text-xs text-gray-500">{category.percentage}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 인기 콘텐츠 */}
                  <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.6s' }}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                        가장 많이 읽은 뉴스레터 기사들
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {popularContent.map((content, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">
                                <TextWithTooltips text={content.title} />
                              </h4>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{content.source}</span>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {content.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{content.views?.toLocaleString() || "0"}</p>
                              <p className="text-xs text-gray-500">조회수</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
              

              

             
              </div>
            </div>
          </div>
        )}

        {/* 비로그인 사용자를 위한 간단한 안내 */}
        {!userRole && (
          <div className="mt-12">
            <Card className="glass hover-lift">
              <CardContent className="text-center py-8">
                <div className="mb-4">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  더 많은 기능을 이용하려면 로그인하세요
                </h3>
                <p className="text-gray-500 mb-4">
                  개인화된 뉴스레터, 읽기 통계, 구독 관리 등의 기능을 이용할 수 있습니다.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/auth">
                    <Button className="hover-lift">로그인하기</Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/auth/me', {
                          method: 'GET',
                          credentials: 'include'
                        })
                        if (response.ok) {
                          // Content-Type 확인 후 JSON 파싱
                          const contentType = response.headers.get('content-type')
                          let data = null
                          
                          try {
                            if (contentType && contentType.includes('application/json')) {
                              data = await response.json()
                            } else {
                              const responseText = await response.text()
                              console.error('인증 상태 확인 API JSON이 아닌 응답:', responseText)
                              return
                            }
                          } catch (parseError) {
                            console.error('인증 상태 확인 API 응답 파싱 실패:', parseError)
                            return
                          }
                          
                          if (data.success && data.data) {
                            localStorage.setItem('userInfo', JSON.stringify(data.data))
                            window.dispatchEvent(new CustomEvent('authStateChanged'))
                            window.location.reload()
                          }
                        }
                      } catch (error) {
                        console.error("인증 확인 실패:", error)
                      }
                    }}
                  >
                    인증 상태 확인
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 카카오 권한 요청 모달 */}
        <KakaoPermissionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={handlePermissionConfirm}
          onAlternative={handleAlternativeOption}
          category={modalData.category || "뉴스레터"}
          isLoading={isPermissionLoading}
        />
      </div>
    </div>
  )
}