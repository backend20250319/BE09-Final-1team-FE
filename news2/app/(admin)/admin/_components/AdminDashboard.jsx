"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, FileText, Mail, Eye, Edit, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  // Sample data
  const statsData = [
    { name: "월", users: 1200, articles: 45, newsletters: 890 },
    { name: "화", users: 1350, articles: 52, newsletters: 920 },
    { name: "수", users: 1100, articles: 38, newsletters: 850 },
    { name: "목", users: 1450, articles: 61, newsletters: 980 },
    { name: "금", users: 1600, articles: 55, newsletters: 1100 },
    { name: "토", users: 1200, articles: 42, newsletters: 890 },
    { name: "일", users: 1000, articles: 35, newsletters: 750 },
  ];

  const categoryData = [
    { name: "정치", value: 30, color: "#8884d8" },
    { name: "경제", value: 25, color: "#82ca9d" },
    { name: "IT/과학", value: 20, color: "#ffc658" },
    { name: "사회", value: 15, color: "#ff7300" },
    { name: "기타", value: 10, color: "#00ff00" },
  ];

  const recentArticles = [
    {
      id: 1,
      title: "AI 기술의 미래 전망",
      author: "홍길동",
      status: "published",
      views: 1234,
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "경제 정책 변화 분석",
      author: "김철수",
      status: "draft",
      views: 0,
      date: "2024-01-15",
    },
    {
      id: 3,
      title: "환경 보호 새로운 방안",
      author: "이영희",
      status: "published",
      views: 892,
      date: "2024-01-14",
    },
    {
      id: 4,
      title: "스포츠 산업 동향",
      author: "박민수",
      status: "review",
      views: 0,
      date: "2024-01-14",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
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
            <CardTitle className="text-sm font-medium">
              뉴스레터 구독자
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,901</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">월간 조회수</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456K</div>
            <p className="text-xs text-muted-foreground">
              +22% from last month
            </p>
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
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
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
                      {article.status === "published"
                        ? "발행됨"
                        : article.status === "draft"
                        ? "초안"
                        : "검토중"}
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
    </div>
  );
}
