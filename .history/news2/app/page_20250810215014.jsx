"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input" 
import { Badge } from "@/components/ui/badge"
import { Bell, Search, User, Menu, Bookmark, Share2, Clock, Eye, TrendingUp, Zap, Shield, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"
import { TextWithTooltips } from "@/components/tooltip"
import WeatherWidget from "@/components/WeatherWidget"
import { newsService } from "@/lib/newsService"
import SubscribeForm from "@/components/SubscribeForm"
import SubscriberCount from "@/components/SubscriberCount"
import { getUserRole } from "@/lib/auth"
import RealTimeKeywordWidget from "@/components/RealTimeKeywordWidget"

export default function MainPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [isLoaded, setIsLoaded] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    const fetchNews = async () => {
      console.log('🔄 뉴스 데이터 로딩 시작...')
      try {
        const data = await newsService.getAllNews({ page: currentPage, size: 21 })
        console.log('✅ 뉴스 데이터 로딩 성공:', data.content?.length || 0, '개')
        console.log('📰 첫 번째 뉴스:', data.content?.[0])
        setNewsItems(data.content || [])
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || 0)
      } catch (error) {
        console.error('❌ 뉴스 데이터 로딩 실패:', error)
      } finally {
        setLoading(false)
        setIsLoaded(true)
      }
    }

    fetchNews()
    setUserRole(getUserRole())
  }, [currentPage])

  // 카테고리 변경 시 백엔드 API 호출
  useEffect(() => {
    const fetchNewsByCategory = async () => {
      console.log('🔄 카테고리별 뉴스 로딩 시작:', selectedCategory)
      setLoading(true)
      setCurrentPage(1) // 카테고리 변경 시 첫 페이지로 리셋
      try {
        const data = await newsService.getNewsByCategory(selectedCategory, { page: 1, size: 21 })
        console.log('✅ 카테고리별 뉴스 로딩 성공:', selectedCategory, data.content?.length || 0, '개')
        setNewsItems(data.content || [])
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || 0)
      } catch (error) {
        console.error('❌ 카테고리별 뉴스 로딩 실패:', selectedCategory, error)
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded) {
      fetchNewsByCategory()
    }
  }, [selectedCategory, isLoaded])

  const categories = ["전체", "POLITICS", "ECONOMY", "SOCIETY", "CULTURE", "IT_SCIENCE", "INTERNATIONAL"]
  
  // 카테고리 표시명 매핑
  const categoryDisplayNames = {
    "전체": "전체",
    "POLITICS": "정치",
    "ECONOMY": "경제", 
    "SOCIETY": "사회",
    "CULTURE": "문화",
    "IT_SCIENCE": "IT/과학",
    "INTERNATIONAL": "세계"
  }
  const [newsItems, setNewsItems] = useState([])
  const [loading, setLoading] = useState(true)

  // 백엔드 API에서 이미 필터링된 데이터를 사용하므로 그대로 반환
  const filteredNewsItems = newsItems

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
                                                {/* Category Tabs, Newsletter Subscription, and Real-time Keywords */}
            <div className="mb-2">
              {/* 카테고리 버튼과 뉴스레터 구독 */}
              <div className="flex flex-col lg:flex-row items-start gap-2 mb-2">
                {/* 왼쪽: 카테고리 버튼과 실시간 키워드 */}
                <div className="flex flex-col gap-2">
                  {/* 카테고리 버튼 */}
                  <div className="lg:w-auto overflow-x-auto flex space-x-1 pb-0">
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
                        {categoryDisplayNames[category]}
                      </Button>
                    ))}
                  </div>

                  {/* 실시간 인기 키워드 */}
                  <div className="lg:w-auto">
                    <RealTimeKeywordWidget width="100%" />
                  </div>
                </div>

                {/* 오른쪽: 뉴스레터 구독 */}
                <div className="lg:w-80">
                  <Card className="glass hover-lift animate-slide-in shadow-lg border-0" style={{ animationDelay: '0.3s' }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold flex items-center text-gray-800">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                          <Zap className="h-4 w-4 text-white" />
                        </div>
                        뉴스레터 구독
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm">
                        매일 아침 엄선된 뉴스를 받아보세요 · <SubscriberCount />
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <SubscribeForm compact={true} />
                    </CardContent>
                  </Card>
                </div>
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

            {/* Right: Sidebar */}
            <div className="w-full lg:w-1/3 space-y-4">
              {/* Side News List */}
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
                        {categoryDisplayNames[news.category] || news.category}
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
            
            {/* 페이지네이션 */}
            {console.log('🔍 페이지네이션 디버그:', { totalPages, totalElements, currentPage })}
            {totalPages > 1 && (
              <div className="flex flex-col items-center space-y-6 mt-16 mb-12">
                {/* 페이지 정보 카드 */}
                <Card className="glass hover-lift shadow-lg border-0 px-6 py-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {currentPage} / {totalPages} 페이지
                    </p>
                    <p className="text-base text-gray-600 mt-2">
                      총 {totalElements.toLocaleString()}개의 뉴스
                    </p>
                  </div>
                </Card>
                
                {/* 페이지네이션 버튼 */}
                <Card className="glass hover-lift shadow-lg border-0 p-4">
                  <div className="flex items-center space-x-3">
                    {/* 첫 페이지로 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20 hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                      <span className="hidden sm:inline text-base font-medium">첫 페이지</span>
                    </Button>
                    
                    {/* 이전 페이지 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20 hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline text-base font-medium">이전</span>
                    </Button>
                    
                    {/* 페이지 번호들 */}
                    <div className="flex items-center space-x-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-14 h-14 px-0 rounded-lg font-bold text-lg transition-all duration-300 ${
                              currentPage === pageNum 
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover-lift' 
                                : 'hover:bg-white/20 hover-lift hover:scale-105'
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    {/* 다음 페이지 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20 hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline text-base font-medium">다음</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    {/* 마지막 페이지로 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20 hover-lift transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline text-base font-medium">마지막</span>
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
                
                {/* 페이지 점프 */}
                <Card className="glass hover-lift shadow-lg border-0 px-6 py-4">
                  <div className="flex items-center space-x-3 text-base">
                    <span className="text-gray-700 font-semibold">페이지로 이동:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (page >= 1 && page <= totalPages) {
                          setCurrentPage(page);
                        }
                      }}
                      className="w-20 px-3 py-2 bg-white/50 border border-white/30 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="페이지"
                    />
                    <span className="text-gray-600 font-medium">/ {totalPages}</span>
                  </div>
                </Card>
              </div>
            )}
          </div>

       

        </div>
      </div>
    </div>
  )
}
