"use client"

import { useState, useEffect } from "react"
import { Suspense } from "react"

// 동적 렌더링 설정
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  RefreshCw
} from "lucide-react"

import { TextWithTooltips } from "@/components/tooltip"
import Link from "next/link"
import { getUserRole, getUserInfo } from "@/lib/auth"
import { useUserSubscriptions, useUnsubscribeNewsletter } from "@/hooks/useNewsletter"
import { useToast } from "@/hooks/use-toast"

export default function NewsletterDashboard() {
  const [userRole, setUserRole] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()

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

  const unsubscribeMutation = useUnsubscribeNewsletter()

  useEffect(() => {
    setIsLoaded(true)
    const role = getUserRole()
    setUserRole(role)
  }, [])

  // 대시보드 통계 계산
  const dashboardStats = {
    totalSubscriptions: userSubscriptions.length,
    totalReads: userSubscriptions.reduce((sum, sub) => sum + (sub.readCount || 0), 0),
    averageReadTime: 3.2, // 평균 읽기 시간 (분)
    engagement: Math.min(85, userSubscriptions.length * 20) // 구독 수에 따른 참여도
  }

  // 카테고리별 읽기 통계 (백엔드 Category enum과 일치)
  const categoryStats = [
    { name: "경제", reads: 45, percentage: 28.8 },
    { name: "IT/과학", reads: 38, percentage: 24.4 },
    { name: "정치", reads: 32, percentage: 20.5 },
    { name: "사회", reads: 25, percentage: 16.0 },
    { name: "생활", reads: 16, percentage: 10.3 }
  ]

  // 인기 콘텐츠 (백엔드 Category enum과 일치)
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

  // 최근 활동
  const recentActivity = [
    { type: "구독", content: "매일경제 뉴스", time: "2시간 전" },
    { type: "읽음", content: "AI & Tech Weekly", time: "4시간 전" },
    { type: "북마크", content: "환경 & 지속가능", time: "1일 전" },
    { type: "평가", content: "정치 인사이드", time: "2일 전" }
  ]

  // 성장 추이
  const growthStats = {
    weeklyGrowth: 12.5,
    monthlyEmails: 24,
    readRate: 78.5
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h1>
            <p className="text-gray-600 mb-6">뉴스레터 대시보드를 보려면 먼저 로그인해주세요.</p>
            <Link href="/auth">
              <Button className="hover-lift">로그인하기</Button>
            </Link>
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
              <h1 className="text-3xl font-bold text-gray-900">뉴스레터 대시보드</h1>
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

        {/* Featured News Section */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch mb-8">
          {/* Left: Featured News */}
          <div className="w-full lg:basis-2/3">
            <Card className="overflow-hidden glass hover-lift animate-slide-in h-full">
              <div className="md:flex h-full">
                <div className="md:w-1/2 relative">
                  <img
                    src="/placeholder.svg?height=300&width=500"
                    alt="Featured news"
                    className="w-full h-64 md:h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600 text-white px-4 py-1 rounded-full shadow-lg font-bold tracking-wider">
                      속보
                    </Badge>
                  </div>
                </div>
                <div className="md:w-1/2 p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">
                      주요 경제 정책 발표, 시장에 미치는 파급효과 분석
                    </h2>
                    <p className="text-gray-600 mb-4">
                      <TextWithTooltips text="정부가 발표한 새로운 경제 정책이 금융시장과 실물경제에 미칠 영향에 대해 전문가들이 다양한 분석을 내놓고 있습니다. 이번 정책은 기업 투자 활성화와 소비 진작을 목표로 하고 있어..." />
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>경제신문 • 1시간 전</span>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        2,345
                      </span>
                      <Button variant="ghost" size="sm" className="hover-glow">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover-glow">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Related Articles */}
          <div className="w-full lg:basis-1/3 flex flex-col gap-4">
            <div className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                관련 기사
              </h3>
            </div>
            
            {[1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-2 bg-white rounded-xl shadow hover:shadow-md transition animate-slide-in"
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              >
                <img
                  src={`/placeholder.svg?height=80&width=96`}
                  alt="thumb"
                  className="w-24 h-20 object-cover rounded-lg"
                />
                <div className="flex flex-col justify-between h-full">
                  <p className="text-sm text-gray-400">15 Jan, 2024 · 5 min Read</p>
                  <p className="text-base font-semibold leading-tight">
                    Example article title goes here
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

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

        {/* My Subscriptions Section */}
        <div className="mb-8">
          <Card className="glass hover-lift animate-slide-in">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-500" />
                내 구독 정보
              </CardTitle>
              <CardDescription>
                현재 구독 중인 뉴스레터 ({userSubscriptions.length}/3개)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">구독 정보 로딩 중...</p>
                </div>
              ) : userSubscriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="p-4 bg-white/50 rounded-lg border hover:bg-white/70 transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">
                            {subscription.preferredCategories?.join(', ') || '일반 뉴스레터'}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {subscription.frequency === 'DAILY' ? '매일' : 
                             subscription.frequency === 'WEEKLY' ? '주간' : 
                             subscription.frequency === 'MONTHLY' ? '월간' : '즉시'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unsubscribeMutation.mutate(subscription.id)}
                          disabled={unsubscribeMutation.isPending}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          {unsubscribeMutation.isPending ? "처리 중..." : "구독해제"}
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        <div>구독일: {new Date(subscription.subscribedAt).toLocaleDateString()}</div>
                        {subscription.lastSentAt && (
                          <div>마지막 발송: {new Date(subscription.lastSentAt).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">구독 중인 뉴스레터가 없습니다</h3>
                  <p className="text-gray-500 mb-4">
                    관심 있는 카테고리의 뉴스레터를 구독해보세요.
                  </p>
                  <Link href="/newsletter">
                    <Button className="hover-lift">
                      뉴스레터 구독하기
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* 카테고리별 읽기 통계와 실시간 인기 키워드를 나란히 배치 */}
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

              {/* 실시간 인기 키워드 */}
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.55s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                    실시간 인기 키워드
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {["인공지능", "경제정책", "환경보호", "디지털전환", "스타트업", "블록체인", "메타버스", "ESG"].map((keyword, index) => (
                      <div
                        key={keyword}
                        className="flex items-center justify-between px-4 py-2 rounded-md hover:bg-blue-50 transition-colors duration-200 group cursor-pointer"
                      >
                        <span className="flex items-center space-x-2">
                          <span
                            className={`font-bold w-5 text-right ${
                              index === 0
                                ? "text-red-500"
                                : index === 1
                                ? "text-orange-500"
                                : index === 2
                                ? "text-yellow-500"
                                : "text-blue-600"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-800 group-hover:underline group-hover:text-blue-700 transition">
                            {keyword}
                          </span>
                        </span>
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full shadow">HOT</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

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

          {/* Right Column */}
          <div className="space-y-6">
            {/* 최근 활동 */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.7s' }}>
              <CardHeader>
                <CardTitle className="text-lg">최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-all duration-300">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === "구독" ? "bg-green-500" :
                          activity.type === "읽음" ? "bg-blue-500" :
                          activity.type === "북마크" ? "bg-yellow-500" :
                          "bg-purple-500"
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium">{activity.type}</p>
                          <p className="text-xs text-gray-500">{activity.content}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 성장 추이 */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.8s' }}>
              <CardHeader>
                <CardTitle className="text-lg">성장 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">주간 성장률</span>
                    <span className="text-sm font-medium text-green-600">+{growthStats.weeklyGrowth}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">월간 이메일</span>
                    <span className="text-sm font-medium text-gray-900">{growthStats.monthlyEmails}개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">읽기율</span>
                    <span className="text-sm font-medium text-blue-600">{growthStats.readRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 빠른 작업 */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.9s' }}>
              <CardHeader>
                <CardTitle className="text-lg">빠른 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/newsletter">
                    <Button variant="outline" className="w-full justify-start hover-lift">
                      <Mail className="h-4 w-4 mr-2" />
                      새 뉴스레터 구독
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start hover-lift">
                    <Bookmark className="h-4 w-4 mr-2" />
                    북마크 관리
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover-lift">
                    <Target className="h-4 w-4 mr-2" />
                    관심사 설정
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 