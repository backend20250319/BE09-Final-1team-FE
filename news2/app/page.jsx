"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input" 
import { Badge } from "@/components/ui/badge"
import { Bell, Search, User, Menu, Bookmark, Share2, Clock, Eye } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"

export default function MainPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체")

  const categories = ["전체", "정치", "경제", "사회", "IT/과학", "스포츠", "문화"]

  const newsItems = [
    {
      id: 1,
      title: "AI 기술의 급속한 발전, 일자리 시장에 미치는 영향은?",
      summary:
        "인공지능 기술이 빠르게 발전하면서 다양한 산업 분야에서 변화가 일어나고 있습니다. 전문가들은 새로운 일자리 창출과 기존 업무의 자동화가 동시에 진행될 것으로 전망한다고 밝혔습니다.",
      category: "IT/과학",
      source: "테크뉴스",
      publishedAt: "2시간 전",
      views: 1234,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "2024년 경제 전망, 전문가들이 예측하는 주요 변화",
      summary:
        "올해 경제 성장률과 물가 상승률에 대한 전문가들의 분석이 발표되었습니다. 글로벌 경제 불확실성 속에서도 국내 경제는 안정적인 성장세를 유지할 것으로 예상됩니다.",
      category: "경제",
      source: "경제일보",
      publishedAt: "4시간 전",
      views: 892,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "환경보호를 위한 새로운 정책, 시민들의 반응은?",
      summary:
        "정부가 발표한 새로운 환경보호 정책에 대해 시민들과 환경단체들의 다양한 의견이 제시되고 있습니다. 실효성과 실현 가능성에 대한 논의가 활발히 진행되고 있습니다.",
      category: "사회",
      source: "환경뉴스",
      publishedAt: "6시간 전",
      views: 567,
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
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

            {/* Featured News */}
            <div className="mb-8">
              <Card className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img
                      src="/placeholder.svg?height=300&width=500"
                      alt="Featured news"
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-6">
                    <Badge className="mb-2">속보</Badge>
                    <h2 className="text-2xl font-bold mb-3">주요 경제 정책 발표, 시장에 미치는 파급효과 분석</h2>
                    <p className="text-gray-600 mb-4">
                      정부가 발표한 새로운 경제 정책이 금융시장과 실물경제에 미칠 영향에 대해 전문가들이 다양한 분석을
                      내놓고 있습니다. 이번 정책은 기업 투자 활성화와 소비 진작을 목표로 하고 있어...
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>경제신문 • 1시간 전</span>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          2,345
                        </span>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* News List */}
            <div className="space-y-6">
              {newsItems.map((news) => (
                <Card key={news.id} className="hover:shadow-md transition-shadow">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img
                        src={news.image || "/placeholder.svg"}
                        alt={news.title}
                        className="w-full h-48 md:h-full object-cover rounded-l-lg"
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Label theme="category">{news.category}</Label>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {news.publishedAt}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-3 hover:text-blue-600 cursor-pointer">{news.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{news.summary}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{news.source}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {news.views.toLocaleString()}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Newsletter Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">뉴스레터 구독</CardTitle>
                  <CardDescription>매일 아침 엄선된 뉴스를 받아보세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input placeholder="이메일 주소" type="email" />
                    <Button className="w-full">구독하기</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">실시간 인기 키워드</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["인공지능", "경제정책", "환경보호", "디지털전환", "스타트업"].map((keyword, index) => (
                      <div key={keyword} className="flex items-center justify-between">
                        <span className="flex items-center">
                          <span className="text-sm font-medium text-blue-600 mr-2">{index + 1}</span>
                          {keyword}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          HOT
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weather Widget */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">오늘의 날씨</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold">22°C</div>
                    <div className="text-gray-600">맑음</div>
                    <div className="text-sm text-gray-500 mt-2">서울특별시</div>
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
