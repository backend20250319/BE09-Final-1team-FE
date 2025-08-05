"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { 
  Mail, 
  Users, 
  TrendingUp, 
  Eye, 
  Click, 
  Plus, 
  Edit, 
  Trash2, 
  Send,
  Calendar,
  Clock
} from "lucide-react"
import Header from "@/components/header"

export default function NewsletterDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  // 샘플 데이터
  const statsData = [
    { name: "월", subscribers: 8900, sent: 8900, opened: 6230, clicked: 890 },
    { name: "화", subscribers: 9200, sent: 9200, opened: 6440, clicked: 920 },
    { name: "수", subscribers: 8500, sent: 8500, opened: 5950, clicked: 850 },
    { name: "목", subscribers: 9800, sent: 9800, opened: 6860, clicked: 980 },
    { name: "금", subscribers: 11000, sent: 11000, opened: 7700, clicked: 1100 },
    { name: "토", subscribers: 8900, sent: 8900, opened: 6230, clicked: 890 },
    { name: "일", subscribers: 7500, sent: 7500, opened: 5250, clicked: 750 },
  ]

  const newsletters = [
    { 
      id: 1, 
      name: "주간 IT 뉴스", 
      subscribers: 8900, 
      openRate: 68.5, 
      clickRate: 12.8,
      lastSent: "2024-01-15",
      status: "active"
    },
    { 
      id: 2, 
      name: "일간 경제 브리핑", 
      subscribers: 6500, 
      openRate: 72.1, 
      clickRate: 15.3,
      lastSent: "2024-01-15",
      status: "active"
    },
    { 
      id: 3, 
      name: "월간 환경 리포트", 
      subscribers: 3200, 
      openRate: 65.2, 
      clickRate: 8.9,
      lastSent: "2024-01-01",
      status: "inactive"
    },
  ]

  const recentCampaigns = [
    { 
      id: 1, 
      name: "AI 기술 동향", 
      sent: 8900, 
      opened: 6230, 
      clicked: 890,
      date: "2024-01-15"
    },
    { 
      id: 2, 
      name: "경제 정책 분석", 
      sent: 9200, 
      opened: 6440, 
      clicked: 920,
      date: "2024-01-14"
    },
    { 
      id: 3, 
      name: "환경 보호 이슈", 
      sent: 8500, 
      opened: 5950, 
      clicked: 850,
      date: "2024-01-13"
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="campaigns">캠페인</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 구독자</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24,600</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">평균 오픈율</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68.5%</div>
                  <p className="text-xs text-muted-foreground">+2.3% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">평균 클릭율</CardTitle>
                  <Click className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.8%</div>
                  <p className="text-xs text-muted-foreground">+1.2% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">활성 뉴스레터</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">2개 예약됨</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>주간 성과 추이</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="subscribers" stroke="#8884d8" name="구독자" />
                      <Line type="monotone" dataKey="opened" stroke="#82ca9d" name="오픈" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>뉴스레터별 성과</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={newsletters}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="subscribers" fill="#8884d8" name="구독자" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>최근 캠페인</CardTitle>
                <CardDescription>최근 발송된 뉴스레터 캠페인들</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>캠페인명</TableHead>
                      <TableHead>발송 수</TableHead>
                      <TableHead>오픈 수</TableHead>
                      <TableHead>클릭 수</TableHead>
                      <TableHead>발송일</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{campaign.sent.toLocaleString()}</TableCell>
                        <TableCell>{campaign.opened.toLocaleString()}</TableCell>
                        <TableCell>{campaign.clicked.toLocaleString()}</TableCell>
                        <TableCell>{campaign.date}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
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

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">뉴스레터 관리</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                새 뉴스레터 생성
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>뉴스레터 목록</CardTitle>
                <CardDescription>모든 뉴스레터를 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>뉴스레터명</TableHead>
                      <TableHead>구독자</TableHead>
                      <TableHead>오픈율</TableHead>
                      <TableHead>클릭율</TableHead>
                      <TableHead>마지막 발송</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsletters.map((newsletter) => (
                      <TableRow key={newsletter.id}>
                        <TableCell className="font-medium">{newsletter.name}</TableCell>
                        <TableCell>{newsletter.subscribers.toLocaleString()}</TableCell>
                        <TableCell>{newsletter.openRate}%</TableCell>
                        <TableCell>{newsletter.clickRate}%</TableCell>
                        <TableCell>{newsletter.lastSent}</TableCell>
                        <TableCell>
                          <Badge variant={newsletter.status === "active" ? "default" : "secondary"}>
                            {newsletter.status === "active" ? "활성" : "비활성"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">상세 분석</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>구독자 성장</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="subscribers" stroke="#8884d8" name="구독자" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>클릭율 추이</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="clicked" fill="#82ca9d" name="클릭" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 