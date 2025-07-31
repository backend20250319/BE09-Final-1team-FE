"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, FileText, Mail, Eye, LogOut, Bell, Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import Header from "@/components/header"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Sample data
  const statsData = [
    { name: "월", users: 1200, articles: 45, newsletters: 890 },
    { name: "화", users: 1350, articles: 52, newsletters: 920 },
    { name: "수", users: 1100, articles: 38, newsletters: 850 },
    { name: "목", users: 1450, articles: 61, newsletters: 980 },
    { name: "금", users: 1600, articles: 55, newsletters: 1100 },
    { name: "토", users: 1200, articles: 42, newsletters: 890 },
    { name: "일", users: 1000, articles: 35, newsletters: 750 },
  ]

  const categoryData = [
    { name: "정치", value: 30, color: "#8884d8" },
    { name: "경제", value: 25, color: "#82ca9d" },
    { name: "IT/과학", value: 20, color: "#ffc658" },
    { name: "사회", value: 15, color: "#ff7300" },
    { name: "기타", value: 10, color: "#00ff00" },
  ]

  const recentArticles = [
    { id: 1, title: "AI 기술의 미래 전망", author: "홍길동", status: "published", views: 1234, date: "2024-01-15" },
    { id: 2, title: "경제 정책 변화 분석", author: "김철수", status: "draft", views: 0, date: "2024-01-15" },
    { id: 3, title: "환경 보호 새로운 방안", author: "이영희", status: "published", views: 892, date: "2024-01-14" },
    { id: 4, title: "스포츠 산업 동향", author: "박민수", status: "review", views: 0, date: "2024-01-14" },
  ]

  const users = [
    { id: 1, name: "김사용자", email: "user1@example.com", joinDate: "2024-01-10", status: "active", newsletter: true },
    { id: 2, name: "이회원", email: "user2@example.com", joinDate: "2024-01-12", status: "active", newsletter: false },
    {
      id: 3,
      name: "박구독자",
      email: "user3@example.com",
      joinDate: "2024-01-13",
      status: "inactive",
      newsletter: true,
    },
    { id: 4, name: "최독자", email: "user4@example.com", joinDate: "2024-01-14", status: "active", newsletter: true },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            {/* <TabsTrigger value="articles">뉴스 관리</TabsTrigger> */}
            <TabsTrigger value="users">회원 관리</TabsTrigger>
            <TabsTrigger value="newsletter">뉴스레터</TabsTrigger>
            {/* <TabsTrigger value="settings">설정</TabsTrigger> */}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,345</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 기사</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">뉴스레터 구독자</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8,901</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">월간 조회수</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">456K</div>
                  <p className="text-xs text-muted-foreground">+22% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>주간 활동 통계</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#8884d8" name="사용자" />
                      <Bar dataKey="articles" fill="#82ca9d" name="기사" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>카테고리별 기사 분포</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <CardTitle>최근 기사</CardTitle>
                <CardDescription>최근에 작성된 기사들을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>작성자</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>조회수</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentArticles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>{article.author}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              article.status === "published"
                                ? "default"
                                : article.status === "draft"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {article.status === "published" ? "발행됨" : article.status === "draft" ? "초안" : "검토중"}
                          </Badge>
                        </TableCell>
                        <TableCell>{article.views.toLocaleString()}</TableCell>
                        <TableCell>{article.date}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
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

          {/* 뉴스 관리 탭 */}
          {/* <TabsContent value="articles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">뉴스 관리</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />새 기사 작성
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>기사 목록</CardTitle>
                  <div className="flex space-x-2">
                    <Input placeholder="기사 검색..." className="w-64" />
                    <Button variant="outline">필터</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>작성자</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>조회수</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentArticles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium max-w-xs truncate">{article.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">IT/과학</Badge>
                        </TableCell>
                        <TableCell>{article.author}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              article.status === "published"
                                ? "default"
                                : article.status === "draft"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {article.status === "published" ? "발행됨" : article.status === "draft" ? "초안" : "검토중"}
                          </Badge>
                        </TableCell>
                        <TableCell>{article.views.toLocaleString()}</TableCell>
                        <TableCell>{article.date}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
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
          </TabsContent> */}

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">회원 관리</h2>
              <div className="flex space-x-2">
                <Input placeholder="회원 검색..." className="w-64" />
                <Button variant="outline">내보내기</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>회원 목록</CardTitle>
                <CardDescription>전체 회원 정보를 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>뉴스레터</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>
                            {user.status === "active" ? "활성" : "비활성"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.newsletter ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Mail className="h-4 w-4" />
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

          {/* Newsletter Tab */}
          <TabsContent value="newsletter" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">뉴스레터 관리</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />새 뉴스레터 작성
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">총 구독자</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">8,901</div>
                  <p className="text-sm text-muted-foreground">+15% 이번 달</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">평균 오픈율</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">68.5%</div>
                  <p className="text-sm text-muted-foreground">+2.3% 이번 달</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">평균 클릭율</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">12.8%</div>
                  <p className="text-sm text-muted-foreground">+1.2% 이번 달</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>발송 예약</CardTitle>
                <CardDescription>예약된 뉴스레터 발송 목록</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">주간 뉴스 요약</h4>
                      <p className="text-sm text-muted-foreground">매주 월요일 오전 8시 발송</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge>활성</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">일간 뉴스 브리핑</h4>
                      <p className="text-sm text-muted-foreground">매일 오전 7시 발송</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge>활성</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 설정 탭 */}
          {/* <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">시스템 설정</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>일반 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="site-name">사이트 이름</Label>
                    <Input id="site-name" defaultValue="NewsHub" />
                  </div>
                  <div>
                    <Label htmlFor="admin-email">관리자 이메일</Label>
                    <Input id="admin-email" defaultValue="admin@newshub.com" />
                  </div>
                  <Button>저장</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>뉴스레터 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sender-name">발신자 이름</Label>
                    <Input id="sender-name" defaultValue="NewsHub" />
                  </div>
                  <div>
                    <Label htmlFor="sender-email">발신자 이메일</Label>
                    <Input id="sender-email" defaultValue="newsletter@newshub.com" />
                  </div>
                  <Button>저장</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  )
}
