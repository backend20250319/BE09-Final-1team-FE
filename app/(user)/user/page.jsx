"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  User,
  Bookmark,
  Mail,
  Eye,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  Bell,
  Settings
} from "lucide-react"

import Link from "next/link"

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  // 샘플 데이터
  const userStats = {
    totalReads: 156,
    bookmarks: 23,
    newsletters: 8,
    readingTime: "12시간 30분"
  }

  const recentArticles = [
    {
      id: 1,
      title: "AI 기술의 미래 전망",
      category: "IT/과학",
      readTime: "5분",
      date: "2024-01-15",
      bookmarked: true
    },
    {
      id: 2,
      title: "경제 정책 변화 분석",
      category: "경제",
      readTime: "8분",
      date: "2024-01-14",
      bookmarked: false
    },
    {
      id: 3,
      title: "환경 보호 새로운 방안",
      category: "사회",
      readTime: "6분",
      date: "2024-01-13",
      bookmarked: true
    },
  ]

  const newsletters = [
    {
      id: 1,
      name: "주간 IT 뉴스",
      status: "active",
      lastSent: "2024-01-15",
      nextSend: "2024-01-22"
    },
    {
      id: 2,
      name: "일간 경제 브리핑",
      status: "active",
      lastSent: "2024-01-15",
      nextSend: "2024-01-16"
    },
    {
      id: 3,
      name: "월간 환경 리포트",
      status: "inactive",
      lastSent: "2024-01-01",
      nextSend: "2024-02-01"
    },
  ]

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="reading">읽기 기록</TabsTrigger>
            <TabsTrigger value="newsletters">뉴스레터</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>사용자</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">안녕하세요, 사용자님!</CardTitle>
                    <CardDescription>
                      오늘도 새로운 지식을 탐험해보세요
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 읽은 기사</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.totalReads}</div>
                  <p className="text-xs text-muted-foreground">이번 달</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">북마크</CardTitle>
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.bookmarks}</div>
                  <p className="text-xs text-muted-foreground">저장된 기사</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">구독 뉴스레터</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.newsletters}</div>
                  <p className="text-xs text-muted-foreground">활성 구독</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 읽기 시간</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userStats.readingTime}</div>
                  <p className="text-xs text-muted-foreground">이번 달</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <CardTitle>최근 읽은 기사</CardTitle>
                <CardDescription>최근에 읽은 기사들을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>읽기 시간</TableHead>
                      <TableHead>읽은 날짜</TableHead>
                      <TableHead>북마크</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentArticles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">{article.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{article.category}</Badge>
                          </TableCell>
                          <TableCell>{article.readTime}</TableCell>
                          <TableCell>{article.date}</TableCell>
                          <TableCell>
                            {article.bookmarked ? (
                                <Bookmark className="h-4 w-4 text-blue-500 fill-current" />
                            ) : (
                                <Bookmark className="h-4 w-4 text-gray-300" />
                            )}
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reading History Tab */}
          <TabsContent value="reading" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">읽기 기록</h2>
              <Button variant="outline">내보내기</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>전체 읽기 기록</CardTitle>
                <CardDescription>지금까지 읽은 모든 기사를 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>읽기 시간</TableHead>
                      <TableHead>읽은 날짜</TableHead>
                      <TableHead>북마크</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentArticles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">{article.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{article.category}</Badge>
                          </TableCell>
                          <TableCell>{article.readTime}</TableCell>
                          <TableCell>{article.date}</TableCell>
                          <TableCell>
                            {article.bookmarked ? (
                                <Bookmark className="h-4 w-4 text-blue-500 fill-current" />
                            ) : (
                                <Bookmark className="h-4 w-4 text-gray-300" />
                            )}
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Newsletters Tab */}
          <TabsContent value="newsletters" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">뉴스레터 관리</h2>
              <Button onClick={() => window.location.href = '/user/newsletter'}>
                <Mail className="h-4 w-4 mr-2" />
                뉴스레터 관리
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>구독 중인 뉴스레터</CardTitle>
                <CardDescription>현재 구독 중인 뉴스레터들을 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>뉴스레터명</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>마지막 발송</TableHead>
                      <TableHead>다음 발송</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsletters.map((newsletter) => (
                        <TableRow key={newsletter.id}>
                          <TableCell className="font-medium">{newsletter.name}</TableCell>
                          <TableCell>
                            <Badge variant={newsletter.status === "active" ? "default" : "secondary"}>
                              {newsletter.status === "active" ? "활성" : "비활성"}
                            </Badge>
                          </TableCell>
                          <TableCell>{newsletter.lastSent}</TableCell>
                          <TableCell>{newsletter.nextSend}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Bell className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">계정 설정</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>프로필 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>사용자</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">사용자</p>
                      <p className="text-sm text-muted-foreground">user@example.com</p>
                    </div>
                  </div>
                  <Link href="/mypage">
                    <Button variant="outline" className="w-full">프로필 수정</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>알림 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">뉴스레터 알림</span>
                    <Button variant="outline" size="sm">설정</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">새 기사 알림</span>
                    <Button variant="outline" size="sm">설정</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">이메일 알림</span>
                    <Button variant="outline" size="sm">설정</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  )
}