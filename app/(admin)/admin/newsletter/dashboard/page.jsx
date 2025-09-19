"use client"

import { useState, useEffect } from "react"
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
  MousePointer, 
  Plus, 
  Edit, 
  Trash2, 
  Send,
  Calendar,
  Clock,
  RefreshCw
} from "lucide-react"
import { getApiUrl } from "@/lib/utils/config"

export default function NewsletterDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [subscribers, setSubscribers] = useState([])
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false)

  // 구독자 목록 가져오기
  const fetchSubscribers = async () => {
    setIsLoadingSubscribers(true)
    try {
      const response = await fetch(getApiUrl('subscribe'))
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers || [])
      } else {
        console.error('구독자 목록 가져오기 실패')
      }
    } catch (error) {
      console.error('구독자 목록 가져오기 오류:', error)
    } finally {
      setIsLoadingSubscribers(false)
    }
  }

  // 컴포넌트 마운트 시 구독자 목록 가져오기
  useEffect(() => {
    fetchSubscribers()
  }, [])

  const [statsData, setStatsData] = useState([])
  const [newsletters, setNewsletters] = useState([])
  const [recentCampaigns, setRecentCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      
      try {
        // 실제 API 호출로 변경
        const [statsResponse, newslettersResponse, campaignsResponse] = await Promise.all([
          fetch('/api/admin/dashboard/stats'),
          fetch('/api/admin/newsletters'),
          fetch('/api/admin/campaigns')
        ])
        
        const statsData = await statsResponse.json()
        const newslettersData = await newslettersResponse.json()
        const campaignsData = await campaignsResponse.json()
        
        setStatsData(statsData || [])
        setNewsletters(newslettersData || [])
        setRecentCampaigns(campaignsData || [])
      } catch (error) {
        console.error('❌ 대시보드 데이터 로딩 실패:', error)
        setStatsData([])
        setNewsletters([])
        setRecentCampaigns([])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="campaigns">캠페인</TabsTrigger>
          <TabsTrigger value="subscribers">구독자</TabsTrigger>
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
                  <div className="text-2xl font-bold">
                    {isLoadingSubscribers ? '...' : subscribers.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isLoadingSubscribers ? '로딩 중...' : '실시간 구독자 수'}
                  </p>
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
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
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

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">구독자 관리</h2>
              <Button onClick={fetchSubscribers} disabled={isLoadingSubscribers}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingSubscribers ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>구독자 목록</CardTitle>
                <CardDescription>
                  총 {subscribers.length}명의 구독자가 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSubscribers ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="ml-2">구독자 목록을 불러오는 중...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이메일</TableHead>
                        <TableHead>구독일</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>액션</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            아직 구독자가 없습니다.
                          </TableCell>
                        </TableRow>
                      ) : (
                        subscribers.map((subscriber, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{subscriber.email}</TableCell>
                            <TableCell>
                              {new Date(subscriber.subscribedAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                활성
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
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