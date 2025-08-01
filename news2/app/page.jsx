"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input" 
import { Badge } from "@/components/ui/badge"
import { Bell, Search, User, Menu, Bookmark, Share2, Clock, Eye, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"
import { TextWithTooltips } from "@/components/tooltip"
import WeatherWidget from "@/components/WeatherWidget"
import { newsService } from "@/lib/newsService"

export default function MainPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await newsService.getAllNews()
        setNewsItems(data)
      } catch (error) {
        console.error('뉴스 데이터 로딩 실패:', error)
      } finally {
        setLoading(false)
        setIsLoaded(true)
      }
    }

    fetchNews()
  }, [])

  const categories = ["전체", "정치", "경제", "사회", "IT/과학", "스포츠", "문화"]
  const [newsItems, setNewsItems] = useState([])
  const [loading, setLoading] = useState(true)

  // 카테고리별 필터링된 뉴스 아이템을 useMemo로 캐싱
  const filteredNewsItems = useMemo(() => {
    if (selectedCategory === "전체") {
      return newsItems
    }
    return newsItems.filter(item => item.category === selectedCategory)
  }, [selectedCategory, newsItems])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Tabs */}
            <div className="mb-6">
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
            </div>

            {/* Featured News */}
            <div className="mb-8">
              <Card className="overflow-hidden glass hover-lift animate-slide-in">
                <div className="md:flex">
                  <div className="md:w-1/2 relative">
                    <img
                      src="/placeholder.svg?height=300&width=500"
                      alt="Featured news"
                      className="w-full h-64 md:h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-600 text-white px-4 py-1 rounded-full shadow-lg font-bold tracking-wider">속보</Badge>
                    </div>
                  </div>
                  <div className="md:w-1/2 p-6">
                    <h2 className="text-2xl font-bold mb-3 text-gray-800">주요 경제 정책 발표, 시장에 미치는 파급효과 분석</h2>
                    
                    <p className="text-gray-600 mb-4">
                      <TextWithTooltips text="정부가 발표한 새로운 경제 정책이 금융시장과 실물경제에 미칠 영향에 대해 전문가들이 다양한 분석을 내놓고 있습니다. 이번 정책은 기업 투자 활성화와 소비 진작을 목표로 하고 있어..." />
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>경제신문 • 1시간 전</span>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          2,345
                        </span>
                        <Button variant="ghost" size="sm" className="hover-glow">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="hover-glow">
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
              {filteredNewsItems.map((news, index) => (
                <Link 
                  key={news.id} 
                  href={`/news/${news.id}`} 
                  prefetch={false}
                  className="block"
                >
                  <Card 
                    className={`glass hover-lift animate-slide-in cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${(index + 1) * 0.2}s` }}
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3 relative">
                        <img
                          src={news.image || "/placeholder.svg"}
                          alt={news.title}
                          className="w-full h-48 md:h-full object-cover rounded-l-lg"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                            {news.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Label theme="category" className="text-sm font-medium text-blue-600">{news.category}</Label>
                                                  <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(news.publishedAt).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3 hover:text-blue-600 transition-colors">
                          <TextWithTooltips text={news.title} />
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          <TextWithTooltips text={news.summary} />
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{news.source}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {news.views.toLocaleString()}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover-glow"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover-glow"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Newsletter Subscription */}
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                    뉴스레터 구독
                  </CardTitle>
                  <CardDescription>매일 아침 엄선된 뉴스를 받아보세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input placeholder="이메일 주소" type="email" className="bg-white/50 border-gray-200" />
                    <Button className="w-full gradient-bg hover:shadow-lg transition-all duration-300">
                      구독하기
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="glass hover-lift animate-slide-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                    실시간 인기 키워드
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["인공지능", "경제정책", "환경보호", "디지털전환", "스타트업"].map((keyword, index) => (
                      <div key={keyword} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-all duration-300 trending-keyword">
                        <span className="flex items-center">
                          <span className="text-sm font-medium text-blue-600 mr-2">{index + 1}</span>
                          {keyword}
                        </span>
                        <Badge className="!bg-red-500 !text-white text-xs rounded-full px-3 py-1 shadow-md">
                          HOT
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weather Widget */}
              <WeatherWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
