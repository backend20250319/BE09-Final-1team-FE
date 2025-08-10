"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { 
  Search, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  Building2, 
  Tag,
  TrendingUp,
  Filter,
  SortAsc,
  SortDesc,
  ArrowLeft,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [activeTab, setActiveTab] = useState("latest")
  const [sortBy, setSortBy] = useState("publishedAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filters, setFilters] = useState({
    press: "",
    category: ""
  })

  // 검색 실행
  useEffect(() => {
    if (query) {
      fetchSearchResults()
    }
  }, [query, currentPage, sortBy, sortOrder, filters])

  const fetchSearchResults = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        query: query,
        page: (currentPage - 1).toString(), // Spring Boot는 0-based pagination
        size: "20"
      })

      if (filters.press) params.append("press", filters.press)
      if (filters.category) params.append("category", filters.category)

      const response = await fetch(`/api/news/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.content || [])
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || 0)
      }
    } catch (error) {
      console.error("검색 결과 로드 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 언론사별 그룹핑
  const pressGroups = searchResults.reduce((acc, item) => {
    if (!acc[item.press]) {
      acc[item.press] = []
    }
    acc[item.press].push(item)
    return acc
  }, {})

  // 카테고리별 그룹핑
  const categoryGroups = searchResults.reduce((acc, item) => {
    if (!acc[item.categoryName]) {
      acc[item.categoryName] = []
    }
    acc[item.categoryName].push(item)
    return acc
  }, {})

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 정렬 변경
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(newSortBy)
      setSortOrder("desc")
    }
  }

  // 필터 변경
  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? "" : value
    }))
    setCurrentPage(1)
  }

  // 뉴스 카드 컴포넌트
  const NewsCard = ({ news }) => (
    <Card className="glass hover-lift transition-all duration-300 cursor-pointer border border-gray-200/50">
      <CardContent className="p-6">
        <div className="flex gap-6">
          {news.imageUrl && (
            <div className="flex-shrink-0">
              <img 
                src={news.imageUrl} 
                alt={news.title}
                className="w-32 h-24 object-cover rounded-lg shadow-md"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link href={`/news/${news.newsId}`}>
              <h3 className="font-bold text-xl mb-3 line-clamp-2 hover:text-blue-600 transition-colors text-gray-800">
                {news.title}
              </h3>
            </Link>
            {news.summary && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                {news.summary}
              </p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-700 font-medium">{news.press}</span>
                </span>
                <span className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                  <Tag className="w-3 h-3 text-green-600" />
                  <span className="text-green-700 font-medium">{news.categoryDescription || news.categoryName}</span>
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3 h-3" />
                  {new Date(news.publishedAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </span>
                {news.reporterName && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <span className="text-xs">기자: {news.reporterName}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                  <Eye className="w-3 h-3 text-gray-600" />
                  <span className="text-gray-700 font-medium">{news.viewCount?.toLocaleString() || 0}</span>
                </span>
                {news.dedupState && (
                  <Badge 
                    variant={news.dedupState === 'KEPT' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {news.dedupStateDescription}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!query) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">검색어를 입력해주세요</h1>
            <p className="text-gray-600">뉴스를 검색하려면 검색어를 입력하세요.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 검색 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            "{query}" 검색 결과
          </h1>
          <Badge variant="secondary" className="ml-2">
            {totalElements}건
          </Badge>
        </div>

        {/* 정렬 및 필터 */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">정렬:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortChange("publishedAt")}
              className={`flex items-center gap-1 ${
                sortBy === "publishedAt" ? "bg-blue-50 border-blue-200" : ""
              }`}
            >
              {sortOrder === "desc" ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />}
              최신순
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortChange("viewCount")}
              className={`flex items-center gap-1 ${
                sortBy === "viewCount" ? "bg-blue-50 border-blue-200" : ""
              }`}
            >
              {sortOrder === "desc" ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />}
              조회순
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">필터:</span>
            {Object.keys(pressGroups).map(press => (
              <Badge
                key={press}
                variant={filters.press === press ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleFilterChange("press", press)}
              >
                {press} ({pressGroups[press].length})
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="latest" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            최신순
          </TabsTrigger>
          <TabsTrigger value="press" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            언론사별
          </TabsTrigger>
          <TabsTrigger value="category" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            카테고리별
          </TabsTrigger>
        </TabsList>

        {/* 최신순 탭 */}
        <TabsContent value="latest" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">검색 중...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="grid gap-4">
                {searchResults.map((news) => (
                  <NewsCard key={news.newsId} news={news} />
                ))}
              </div>
              
              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600">다른 키워드로 검색해보세요.</p>
            </div>
          )}
        </TabsContent>

        {/* 언론사별 탭 */}
        <TabsContent value="press" className="space-y-6">
          {Object.entries(pressGroups).map(([press, articles]) => (
            <Card key={press}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {press}
                  <Badge variant="secondary">{articles.length}건</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {articles.map((news) => (
                  <NewsCard key={news.newsId} news={news} />
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* 카테고리별 탭 */}
        <TabsContent value="category" className="space-y-6">
          {Object.entries(categoryGroups).map(([category, articles]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  {category}
                  <Badge variant="secondary">{articles.length}건</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {articles.map((news) => (
                  <NewsCard key={news.newsId} news={news} />
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
