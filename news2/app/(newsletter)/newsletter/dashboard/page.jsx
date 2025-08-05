"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Clock, 
  Users, 
  Mail, 
  Calendar,
  BookOpen,
  Star,
  Target,
  Activity
} from "lucide-react"
import Header from "@/components/header"

export default function NewsletterDashboard() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // 대시보드 데이터
  const dashboardData = {
    totalSubscriptions: 8,
    totalReads: 156,
    averageReadTime: 3.2,
    favoriteCategory: "경제",
    weeklyGrowth: 12.5,
    monthlyEmails: 24,
    readRate: 78.5,
    engagementScore: 85
  }

  const readingStats = [
    { category: "경제", reads: 45, percentage: 28.8 },
    { category: "IT/과학", reads: 38, percentage: 24.4 },
    { category: "정치", reads: 32, percentage: 20.5 },
    { category: "사회", reads: 25, percentage: 16.0 },
    { category: "스포츠", reads: 16, percentage: 10.3 }
  ]

  const recentActivity = [
    {
      id: 1,
      action: "구독",
      newsletter: "매일 경제 뉴스",
      time: "2시간 전",
      icon: <Mail className="h-4 w-4 text-blue-500" />
    },
    {
      id: 2,
      action: "읽음",
      newsletter: "AI & Tech Weekly",
      time: "4시간 전",
      icon: <Eye className="h-4 w-4 text-green-500" />
    },
    {
      id: 3,
      action: "북마크",
      newsletter: "환경 & 지속가능",
      time: "1일 전",
      icon: <BookOpen className="h-4 w-4 text-purple-500" />
    },
    {
      id: 4,
      action: "평가",
      newsletter: "정치 인사이드",
      time: "2일 전",
      icon: <Star className="h-4 w-4 text-yellow-500" />
    }
  ]

  const popularContent = [
    {
      title: "한국은행 기준금리 동결 결정",
      newsletter: "매일 경제 뉴스",
      reads: 1240,
      category: "경제"
    },
    {
      title: "ChatGPT-5 출시 예고",
      newsletter: "AI & Tech Weekly",
      reads: 892,
      category: "IT/과학"
    },
    {
      title: "환경 정책 개편안 발표",
      newsletter: "환경 & 지속가능",
      reads: 756,
      category: "사회"
    },
    {
      title: "정치 현안 분석 리포트",
      newsletter: "정치 인사이드",
      reads: 634,
      category: "정치"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
            뉴스레터 대시보드
          </h1>
          <p className="text-gray-600">구독 활동과 읽기 패턴을 한눈에 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">총 구독</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.totalSubscriptions}</p>
                    </div>
                    <Mail className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">총 읽음</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.totalReads}</p>
                    </div>
                    <Eye className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.3s' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">평균 읽기 시간</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.averageReadTime}분</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.4s' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">참여도</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.engagementScore}%</p>
                    </div>
                    <Activity className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reading Statistics */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  카테고리별 읽기 통계
                </CardTitle>
                <CardDescription>
                  가장 많이 읽는 뉴스레터 카테고리
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {readingStats.map((stat, index) => (
                    <div key={stat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stat.category}</span>
                        <span className="text-sm text-gray-500">{stat.reads}회 읽음</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={stat.percentage} className="flex-1" />
                        <span className="text-xs text-gray-500 w-12">{stat.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Content */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  인기 콘텐츠
                </CardTitle>
                <CardDescription>
                  가장 많이 읽은 뉴스레터 기사들
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularContent.map((content, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{content.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{content.newsletter}</span>
                          <Badge variant="outline" className="text-xs">{content.category}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{content.reads.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.7s' }}>
              <CardHeader>
                <CardTitle className="text-lg">최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-all duration-300">
                      {activity.icon}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.newsletter}</p>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Growth Chart */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.8s' }}>
              <CardHeader>
                <CardTitle className="text-lg">성장 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">주간 성장률</span>
                    <span className="text-sm font-medium text-green-600">+{dashboardData.weeklyGrowth}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">월간 이메일</span>
                    <span className="text-sm font-medium">{dashboardData.monthlyEmails}개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">읽기율</span>
                    <span className="text-sm font-medium">{dashboardData.readRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.9s' }}>
              <CardHeader>
                <CardTitle className="text-lg">빠른 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    새 뉴스레터 구독
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    북마크 관리
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
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