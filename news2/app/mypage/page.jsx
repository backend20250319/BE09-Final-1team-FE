"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Bell,
  Bookmark,
  Settings,
  Shield,
  Heart,
  Calendar,
  ArrowLeft,
  Edit2,
  Clock,
  Share2,
} from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"

export default function MyPage() {
  const [selectedInterests, setSelectedInterests] = useState(["정치", "경제", "IT/과학"])
  const [newsletterEnabled, setNewsletterEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const interests = [
    { id: "politics", label: "정치", icon: "🏛️" },
    { id: "economy", label: "경제", icon: "💰" },
    { id: "society", label: "사회", icon: "👥" },
    { id: "it", label: "IT/과학", icon: "💻" },
    { id: "sports", label: "스포츠", icon: "⚽" },
    { id: "culture", label: "문화", icon: "🎭" },
    { id: "international", label: "국제", icon: "🌍" },
    { id: "entertainment", label: "연예", icon: "🎬" },
  ]

  const scrapedNews = [
    {
      id: 1,
      title: "AI 기술의 급속한 발전과 미래 전망",
      category: "IT/과학",
      source: "테크뉴스",
      scrapedAt: "2024-01-15",
      folder: "AI 관련",
    },
    {
      id: 2,
      title: "2024년 경제 정책 변화 분석",
      category: "경제",
      source: "경제일보",
      scrapedAt: "2024-01-14",
      folder: "경제 동향",
    },
    {
      id: 3,
      title: "환경보호 정책의 새로운 방향",
      category: "사회",
      source: "환경뉴스",
      scrapedAt: "2024-01-13",
      folder: "환경",
    },
  ]

  const readingHistory = [
    {
      id: 1,
      title: "스타트업 투자 동향 분석",
      category: "경제",
      readAt: "2024-01-15 14:30",
      readTime: "3분",
    },
    {
      id: 2,
      title: "새로운 교육 정책 발표",
      category: "사회",
      readAt: "2024-01-15 10:15",
      readTime: "5분",
    },
    {
      id: 3,
      title: "기후변화 대응 기술 개발",
      category: "IT/과학",
      readAt: "2024-01-14 16:45",
      readTime: "4분",
    },
  ]

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest],
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" />
                    <AvatarFallback className="text-lg">김사용자</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">김사용자</h2>
                  <p className="text-gray-600">user@example.com</p>
                  <Badge className="mt-2">일반 회원</Badge>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">가입일</span>
                    <span className="text-sm font-medium">2024.01.10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">읽은 기사</span>
                    <span className="text-sm font-medium">127개</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">스크랩</span>
                    <span className="text-sm font-medium">23개</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">프로필</TabsTrigger>
                <TabsTrigger value="interests">관심사</TabsTrigger>
                <TabsTrigger value="scraps">스크랩</TabsTrigger>
                <TabsTrigger value="history">읽기 기록</TabsTrigger>
                <TabsTrigger value="settings">설정</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      기본 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">이름</Label>
                        <Input id="name" defaultValue="김사용자" />
                      </div>
                      <div>
                        <Label htmlFor="email">이메일</Label>
                        <Input id="email" defaultValue="user@example.com" type="email" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">자기소개</Label>
                      <Input id="bio" placeholder="간단한 자기소개를 입력하세요" />
                    </div>
                    <Button>
                      <Edit2 className="h-4 w-4 mr-2" />
                      정보 수정
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      보안 설정
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">현재 비밀번호</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="new-password">새 비밀번호</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">비밀번호 확인</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button>비밀번호 변경</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Interests Tab */}
              <TabsContent value="interests" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-500" />
                      관심 분야 설정
                    </CardTitle>
                    <CardDescription>관심 있는 분야를 선택하면 맞춤 뉴스를 제공받을 수 있습니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {interests.map((interest) => (
                        <div
                          key={interest.id}
                          onClick={() => toggleInterest(interest.label)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedInterests.includes(interest.label)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{interest.icon}</div>
                            <div className="text-sm font-medium">{interest.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <Button>관심사 저장</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>선택된 관심사</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedInterests.map((interest) => (
                        <Badge key={interest} variant="default" className="px-3 py-1">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Scraps Tab */}
              <TabsContent value="scraps" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bookmark className="h-5 w-5 mr-2" />
                      스크랩한 뉴스
                    </CardTitle>
                    <CardDescription>관심 있는 뉴스를 저장하고 나중에 다시 읽어보세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scrapedNews.map((news) => (
                        <div key={news.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">{news.title}</h3>
                            <Button variant="ghost" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <Badge variant="outline">{news.category}</Badge>
                            <span>{news.source}</span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {news.scrapedAt}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{news.folder}</Badge>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                읽기
                              </Button>
                              <Button variant="ghost" size="sm">
                                삭제
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      읽기 기록
                    </CardTitle>
                    <CardDescription>최근에 읽은 뉴스 기록을 확인하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {readingHistory.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold hover:text-blue-600 cursor-pointer">{item.title}</h3>
                            <span className="text-sm text-gray-500">{item.readTime}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <Badge variant="outline">{item.category}</Badge>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {item.readAt}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      뉴스레터 설정
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newsletter">뉴스레터 구독</Label>
                        <p className="text-sm text-gray-600">매일 아침 맞춤 뉴스를 이메일로 받아보세요</p>
                      </div>
                      <Switch id="newsletter" checked={newsletterEnabled} onCheckedChange={setNewsletterEnabled} />
                    </div>

                    {newsletterEnabled && (
                      <div className="ml-4 space-y-3 border-l-2 border-blue-200 pl-4">
                        <div>
                          <Label htmlFor="newsletter-time">발송 시간</Label>
                          <Input id="newsletter-time" type="time" defaultValue="07:00" className="w-32" />
                        </div>
                        <div>
                          <Label>발송 빈도</Label>
                          <div className="flex space-x-4 mt-2">
                            <label className="flex items-center">
                              <input type="radio" name="frequency" value="daily" defaultChecked className="mr-2" />
                              매일
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name="frequency" value="weekly" className="mr-2" />
                              주간
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      알림 설정
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications">브라우저 알림</Label>
                        <p className="text-sm text-gray-600">중요한 뉴스가 있을 때 알림을 받습니다</p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="breaking-news">속보 알림</Label>
                        <p className="text-sm text-gray-600">속보 뉴스를 즉시 알림으로 받습니다</p>
                      </div>
                      <Switch id="breaking-news" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      계정 관리
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        데이터 내보내기
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        개인정보 처리방침
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        이용약관
                      </Button>
                      <Separator />
                      <Button variant="destructive" className="w-full">
                        회원 탈퇴
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
