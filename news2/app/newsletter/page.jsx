"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Mail, Clock, Users, Star, TrendingUp, Bell, Zap, Filter } from "lucide-react"
import Header from "@/components/header"
import { TextWithTooltips } from "@/components/tooltip"

export default function NewsletterPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const categories = ["전체", "정치", "경제", "사회", "IT/과학", "스포츠", "문화"]

  const newsletters = [
    {
      id: 1,
      title: "매일 경제 뉴스",
      description: "주요 경제 뉴스와 시장 동향을 매일 아침에 받아보세요",
      category: "경제",
      subscribers: 15420,
      frequency: "매일",
      lastSent: "2시간 전",
      isSubscribed: true,
      tags: ["경제", "투자", "시장동향"]
    },
    {
      id: 2,
      title: "AI & Tech Weekly",
      description: "AI와 기술 분야의 최신 동향을 주간으로 정리해드립니다",
      category: "IT/과학",
      subscribers: 8920,
      frequency: "주간",
      lastSent: "1일 전",
      isSubscribed: false,
      tags: ["AI", "기술", "혁신"]
    },
    {
      id: 3,
      title: "환경 & 지속가능",
      description: "환경 보호와 지속가능한 발전에 관한 뉴스를 전달합니다",
      category: "사회",
      subscribers: 5670,
      frequency: "주간",
      lastSent: "3일 전",
      isSubscribed: true,
      tags: ["환경", "지속가능", "정책"]
    },
    {
      id: 4,
      title: "정치 인사이드",
      description: "정치 현안과 정책 동향을 깊이 있게 분석해드립니다",
      category: "정치",
      subscribers: 12340,
      frequency: "매일",
      lastSent: "6시간 전",
      isSubscribed: false,
      tags: ["정치", "정책", "분석"]
    },
    {
      id: 5,
      title: "스포츠 하이라이트",
      description: "주요 스포츠 이벤트와 선수들의 활약을 요약해드립니다",
      category: "스포츠",
      subscribers: 9870,
      frequency: "매일",
      lastSent: "4시간 전",
      isSubscribed: false,
      tags: ["스포츠", "경기", "선수"]
    },
    {
      id: 6,
      title: "문화 & 라이프스타일",
      description: "문화, 예술, 라이프스타일 관련 트렌드를 소개합니다",
      category: "문화",
      subscribers: 7430,
      frequency: "주간",
      lastSent: "5일 전",
      isSubscribed: true,
      tags: ["문화", "예술", "라이프스타일"]
    }
  ]

  const [subscribedNewsletters, setSubscribedNewsletters] = useState(
    newsletters.filter(nl => nl.isSubscribed)
  )

  const handleSubscribe = (newsletterId) => {
    setSubscribedNewsletters(prev => {
      const newsletter = newsletters.find(nl => nl.id === newsletterId)
      if (prev.find(nl => nl.id === newsletterId)) {
        return prev.filter(nl => nl.id !== newsletterId)
      } else {
        return [...prev, newsletter]
      }
    })
  }

  // 카테고리별 필터링된 뉴스레터 목록
  const filteredNewsletters = selectedCategory === "전체" 
    ? newsletters 
    : newsletters.filter(newsletter => newsletter.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6 animate-slide-in">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Mail className="h-8 w-8 mr-3 text-purple-500 animate-pulse-slow" />
                뉴스레터
              </h1>
              <p className="text-gray-600">관심 있는 주제의 뉴스레터를 구독하고 최신 정보를 받아보세요</p>
            </div>

            {/* Category Tabs */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">카테고리별 필터:</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category, index) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap hover-lift ${
                      isLoaded ? 'animate-slide-in' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              {/* 필터링 결과 표시 */}
              <div className="mt-2 text-sm text-gray-500">
                {selectedCategory === "전체" 
                  ? `전체 ${newsletters.length}개의 뉴스레터`
                  : `${selectedCategory} 카테고리 ${filteredNewsletters.length}개의 뉴스레터`
                }
              </div>
            </div>

            {/* Newsletter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNewsletters.map((newsletter, index) => (
                <Card 
                  key={newsletter.id} 
                  className={`glass hover-lift animate-slide-in ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                            {newsletter.category}
                          </Badge>
                          <Badge className="bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow">
                            {newsletter.frequency}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mb-2">
                          <TextWithTooltips text={newsletter.title} />
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          <TextWithTooltips text={newsletter.description} />
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={subscribedNewsletters.some(nl => nl.id === newsletter.id)}
                          onCheckedChange={() => handleSubscribe(newsletter.id)}
                        />
                        <Label className="text-xs">구독</Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {newsletter.tags.map((tag) => (
                        <Badge key={tag} className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{newsletter.subscribers.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{newsletter.lastSent}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>4.8</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* 필터링 결과가 없을 때 */}
              {filteredNewsletters.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedCategory} 카테고리의 뉴스레터가 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    다른 카테고리를 선택하거나 나중에 다시 확인해보세요.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCategory("전체")}
                    className="hover-lift"
                  >
                    전체 뉴스레터 보기
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* My Subscriptions */}
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-blue-500" />
                    내 구독
                  </CardTitle>
                  <CardDescription>
                    현재 구독 중인 뉴스레터 ({subscribedNewsletters.length}개)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subscribedNewsletters.map((newsletter) => (
                      <div key={newsletter.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            <TextWithTooltips text={newsletter.title} />
                          </h4>
                          <p className="text-xs text-gray-500">{newsletter.frequency}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSubscribe(newsletter.id)}
                          className="hover-glow"
                        >
                          구독해제
                        </Button>
                      </div>
                    ))}
                    {subscribedNewsletters.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        구독 중인 뉴스레터가 없습니다
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Preferences */}
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="text-lg">알림 설정</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications" className="text-sm">
                        이메일 알림
                      </Label>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications" className="text-sm">
                        푸시 알림
                      </Label>
                      <Switch id="push-notifications" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weekly-digest" className="text-sm">
                        주간 요약
                      </Label>
                      <Switch id="weekly-digest" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Newsletters */}
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    인기 뉴스레터
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {newsletters
                      .sort((a, b) => b.subscribers - a.subscribers)
                      .slice(0, 5)
                      .map((newsletter, index) => (
                        <div key={newsletter.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-all duration-300">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            <div>
                              <p className="text-sm font-medium">
                                <TextWithTooltips text={newsletter.title} />
                              </p>
                              <p className="text-xs text-gray-500">{newsletter.subscribers.toLocaleString()} 구독자</p>
                            </div>
                          </div>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 