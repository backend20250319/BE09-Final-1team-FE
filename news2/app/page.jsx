"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input" 
import { Badge } from "@/components/ui/badge"
import { Bell, Search, User, Menu, Bookmark, Share2, Clock, Eye, TrendingUp, Zap, Shield } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"
import { TextWithTooltips } from "@/components/tooltip"
import WeatherWidget from "@/components/WeatherWidget"
import { newsService } from "@/lib/newsService"
import SubscribeForm from "@/components/SubscribeForm"
import SubscriberCount from "@/components/SubscriberCount"
import { getUserRole } from "@/lib/auth"

export default function MainPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [isLoaded, setIsLoaded] = useState(false)
  const [userRole, setUserRole] = useState(null)

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
    setUserRole(getUserRole())
  }, [])

  const categories = ["전체", "정치", "경제", "사회", "생활/문화","IT/과학",  "국제"]
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
      
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Left: Featured News */}
            <div className="w-full lg:w-2/3">
              <Card className="relative overflow-hidden glass hover-lift animate-slide-in h-[560px] rounded-xl">
                {/* 이미지 영역 */}
                <img
                  src="/placeholder.svg?height=300&width=500"
                  alt="Featured news"
                  className="w-full h-full object-cover"
                />

                {/* 텍스트 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 md:p-6 flex flex-col justify-end text-white">
                  <Badge className="bg-red-600 text-white px-4 py-1 rounded-full shadow-lg font-bold tracking-wider mb-3 w-fit">
                    속보
                  </Badge>
                  <h2 className="text-lg lg:text-xl font-bold mb-2 line-clamp-2">
                    주요 경제 정책 발표, 시장에 미치는 파급효과 분석
                  </h2>
                  <p className="text-sm mb-4 line-clamp-2">
                    <TextWithTooltips text="정부가 발표한 새로운 경제 정책이 금융시장과 실물경제에 미칠 영향에 대해 전문가들이 다양한 분석을 내놓고 있습니다..." />
                  </p>

                  {/* 하단 메타정보 */}
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>경제신문 • 1시간 전</span>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        2,345
                      </span>
                      <Button variant="ghost" size="sm" className="hover-glow text-white">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover-glow text-white">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Side News List */}
            <div className="w-full lg:w-1/3 space-y-4">
              {filteredNewsItems.slice(0, 4).map((item, index) => (
                <Card 
                  key={item.id} 
                  className="flex items-center gap-4 p-4 glass hover-lift rounded-xl h-[130px] transition animate-slide-in"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold line-clamp-2 text-gray-800 mb-2">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(item.publishedAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric"
                      })}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {item.views?.toLocaleString() || "0"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>


   {/* News List */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            
              {filteredNewsItems.map((news, index) => (
                <Link 
                  key={news.id} 
                  href={`/news/${news.id}`} 
                  prefetch={false}
                  className="block"
                >
                <Card
                className={`min-h-[420px] max-h-[420px] flex flex-col justify-between glass hover-lift animate-slide-in cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ animationDelay: `${(index + 1) * 0.2}s` }}
              >
                   {/* 이미지 영역 */}
                  <div className="h-40 w-full relative">
                    <img
                      src={news.image || "/placeholder.svg"}
                      alt={news.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                        {news.category}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* 텍스트 영역 */}
                  <div className="flex flex-col justify-between flex-1 px-4 py-3">
                    {/* 카테고리 뱃지 */}
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                        {news.category}
                      </Badge>
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

                    {/* 제목과 요약 */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                        <TextWithTooltips text={news.title} />
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 flex-1">
                        <TextWithTooltips text={news.summary} />
                      </p>
                    </div>

                    {/* 하단 출처 + 버튼 */}
                    <div className="flex items-center justify-between mt-4">
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
              </Card>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
