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

import { getUserRole } from "@/lib/auth"
import RealTimeKeywordWidget from "@/components/RealTimeKeywordWidget"

// 더미 데이터 생성 함수
const generateDummyNews = () => {
  const categories = ["POLITICS", "ECONOMY", "SOCIETY", "LIFE", "INTERNATIONAL", "IT_SCIENCE", "VEHICLE", "TRAVEL_FOOD", "ART"]
  const sources = ["조선일보", "중앙일보", "동아일보", "한겨레", "경향신문", "한국일보", "서울신문", "매일경제", "한국경제", "이데일리"]
  const titles = [
    "정부, 새로운 경제 정책 발표... 시장 반응 주목",
    "IT 업계 혁신 기술 도입으로 산업 구조 변화 예상",
    "국제 무역 협정 체결로 경제 성장 기대감 고조",
    "사회 복지 정책 개선안 발표, 시민들 반응 엇갈려",
    "기후 변화 대응을 위한 글로벌 협력 강화",
    "자동차 산업 전기차 시장 점유율 급상승",
    "여행업계 회복세, 해외 관광객 증가세 지속",
    "문화 예술계 디지털 전환 가속화",
    "교육 시스템 개혁안 발표, 학부모들 관심 집중",
    "의료 기술 발전으로 치료 효과 향상",
    "부동산 시장 안정화 정책 효과 나타나",
    "금융권 디지털 혁신 가속화",
    "스포츠계 새로운 스타 탄생",
    "환경 보호 운동 확산",
    "과학 기술 연구 성과 발표",
    "문화 유산 보존 활동 강화",
    "국제 관계 개선 노력 지속",
    "사회 문제 해결을 위한 민관 협력",
    "생활 문화 변화 추세",
    "미래 산업 육성 정책 발표"
  ]
  
  const dummyNews = []
  
  for (let i = 1; i <= 200; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const source = sources[Math.floor(Math.random() * sources.length)]
    const title = titles[Math.floor(Math.random() * titles.length)]
    const views = Math.floor(Math.random() * 10000) + 100
    const publishedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 최근 30일 내
    
    dummyNews.push({
      id: i,
      title: `${title} - ${i}번째 뉴스`,
      content: `이것은 ${category} 카테고리의 ${i}번째 뉴스 기사입니다. 다양한 정보와 분석을 제공합니다.`,
      category: category,
      source: source,
      image: `/placeholder.svg?height=300&width=500&text=${encodeURIComponent(category)}`,
      publishedAt: publishedAt.toISOString(),
      views: views,
      url: `https://example.com/news/${i}`
    })
  }
  
  return dummyNews
}

export default function MainPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [isLoaded, setIsLoaded] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [newsItems, setNewsItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [dummyNewsData] = useState(generateDummyNews())

  // 페이지당 아이템 수
  const itemsPerPage = 21

  // 카테고리별 필터링 및 페이지네이션
  useEffect(() => {
    const fetchNews = async () => {
      console.log('🔄 뉴스 데이터 로딩 시작...', { selectedCategory, currentPage })
      setLoading(true)
      
      try {
        // 더미 데이터에서 카테고리별 필터링
        let filteredData = dummyNewsData
        if (selectedCategory !== "전체") {
          filteredData = dummyNewsData.filter(news => news.category === selectedCategory)
        }
        
        // 총 아이템 수와 페이지 수 계산
        const totalItems = filteredData.length
        const totalPagesCount = Math.ceil(totalItems / itemsPerPage)
        
        // 현재 페이지에 해당하는 데이터 추출
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const currentPageData = filteredData.slice(startIndex, endIndex)
        
        console.log('✅ 뉴스 데이터 로딩 성공:', selectedCategory, currentPageData.length, '개')
        setNewsItems(currentPageData)
        setTotalPages(totalPagesCount)
        setTotalElements(totalItems)
      } catch (error) {
        console.error('❌ 뉴스 데이터 로딩 실패:', error)
        setNewsItems([])
        setTotalPages(1)
        setTotalElements(0)
      } finally {
        setLoading(false)
        setIsLoaded(true)
      }
    }

    fetchNews()
    setUserRole(getUserRole())
  }, [currentPage, selectedCategory, dummyNewsData])

  // 카테고리 변경 시 첫 페이지로 리셋
  useEffect(() => {
    if (isLoaded) {
      setCurrentPage(1)
    }
  }, [selectedCategory, isLoaded])

  const categories = ["전체", "POLITICS", "ECONOMY", "SOCIETY", "LIFE", "INTERNATIONAL", "IT_SCIENCE", "VEHICLE", "TRAVEL_FOOD", "ART"]
  
  // 카테고리 표시명 매핑
  const categoryDisplayNames = {
    "전체": "전체",
    "POLITICS": "정치",
    "ECONOMY": "경제", 
    "SOCIETY": "사회",
    "LIFE": "생활",
    "INTERNATIONAL": "세계",
    "IT_SCIENCE": "IT/과학",
    "VEHICLE": "자동차/교통",
    "TRAVEL_FOOD": "여행/음식",
    "ART": "예술",
  }

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
              <div className="grid grid-cols-12 gap-4 items-stretch mb-2">
                {/* 왼쪽: 카테고리 버튼과 실시간 키워드 */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-2 h-full">
                  <div className="lg:w-full overflow-x-auto flex space-x-3 pb-0">
                    {categories.map((category, index) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="default"
                        onClick={() => setSelectedCategory(category)}
                        className={`whitespace-nowrap hover-lift text-base px-4 py-2 ${
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
                className={`min-h-[500px] max-h-[500px] flex flex-col justify-between glass hover-lift animate-slide-in cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ animationDelay: `${(index + 1) * 0.2}s` }}
              >
                   {/* 이미지 영역 */}
                  <div className="h-72 w-full relative">
                    <img
                      src={news.image || "/placeholder.svg"}
                      alt={news.title}
                      className="w-full h-72 object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* 텍스트 영역 */}
                  <div className="flex flex-col justify-between flex-1 px-4 py-3 min-h-0">
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

                    {/* 제목 */}
                    <div className="flex-1 mb-3 min-h-0">
                      <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed">
                        <TextWithTooltips text={news.title} />
                      </h3>
                    </div>

                    {/* 하단 출처 + 버튼 */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-500 font-medium truncate mr-2">{news.source}</span>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {news.views.toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover-glow p-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover-glow p-1"
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
