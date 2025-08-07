"use client"

import { useState, useEffect } from "react"
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
  Bookmark
} from "lucide-react"
import Header from "@/components/header"
import { TextWithTooltips } from "@/components/tooltip"
import Link from "next/link"
import { getUserRole } from "@/lib/auth"

export default function NewsletterDashboard() {
  const [userRole, setUserRole] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [subscribedNewsletters, setSubscribedNewsletters] = useState([])
  const [dashboardStats, setDashboardStats] = useState({
    totalSubscriptions: 0,
    totalReads: 0,
    averageReadTime: 0,
    engagement: 0
  })

  useEffect(() => {
    setIsLoaded(true)
    const role = getUserRole()
    setUserRole(role)
    
    if (role) {
      // 로컬 스토리지에서 구독 정보 복원
      const savedSubscriptions = localStorage.getItem('newsletterSubscriptions')
      if (savedSubscriptions) {
        const subscriptions = JSON.parse(savedSubscriptions)
        setSubscribedNewsletters(subscriptions)
        setDashboardStats({
          totalSubscriptions: subscriptions.length,
          totalReads: subscriptions.reduce((sum, nl) => sum + (nl.reads || 0), 0),
          averageReadTime: 3.2, // 평균 읽기 시간 (분)
          engagement: 85 // 참여도 (%)
        })
      }
    }
  }, [])

  // 카테고리별 읽기 통계
  const categoryStats = [
    { name: "경제", reads: 45, percentage: 28.8 },
    { name: "IT/과학", reads: 38, percentage: 24.4 },
    { name: "정치", reads: 32, percentage: 20.5 },
    { name: "사회", reads: 25, percentage: 16.0 },
    { name: "스포츠", reads: 16, percentage: 10.3 }
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
        <Header />
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
      <Header />
      
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
            <Badge className="bg-green-100 text-green-800">
              활성 구독자
            </Badge>
          </div>
          <p className="text-gray-600">구독 활동과 읽기 패턴을 한눈에 확인하세요</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
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
                        <p className="text-sm font-medium text-gray-900">{content.views.toLocaleString()}</p>
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