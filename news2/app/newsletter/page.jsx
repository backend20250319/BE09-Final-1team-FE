"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Mail, Clock, Users, Star, TrendingUp, Bell } from "lucide-react"
import Header from "@/components/header"

export default function NewsletterPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체")

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">뉴스레터</h1>
              <p className="text-gray-600">관심 있는 주제의 뉴스레터를 구독하고 최신 정보를 받아보세요</p>
            </div>

            {/* Category Tabs */}
            <div className="mb-6">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Newsletter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsletters.map((newsletter) => (
                <Card key={newsletter.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {newsletter.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {newsletter.frequency}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mb-2">{newsletter.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {newsletter.description}
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
                        <Badge key={tag} variant="secondary" className="text-xs">
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* My Subscriptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">내 구독</CardTitle>
                  <CardDescription>
                    현재 구독 중인 뉴스레터 ({subscribedNewsletters.length}개)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subscribedNewsletters.map((newsletter) => (
                      <div key={newsletter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{newsletter.title}</h4>
                          <p className="text-xs text-gray-500">{newsletter.frequency}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSubscribe(newsletter.id)}
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
              <Card>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">인기 뉴스레터</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {newsletters
                      .sort((a, b) => b.subscribers - a.subscribers)
                      .slice(0, 5)
                      .map((newsletter, index) => (
                        <div key={newsletter.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            <div>
                              <p className="text-sm font-medium">{newsletter.title}</p>
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