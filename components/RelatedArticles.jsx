"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  Eye, 
  Building2, 
  Tag,
  ExternalLink,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

export default function RelatedArticles({ 
  currentNewsId, 
  category, 
  press,
  title,
  className = "" 
}) {
  const [relatedArticles, setRelatedArticles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (currentNewsId) {
      fetchRelatedArticles()
    }
  }, [currentNewsId, category, press])

  const fetchRelatedArticles = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // 제목에서 키워드 추출 (간단한 방식)
      const keywords = extractKeywords(title)
      
      // 여러 키워드로 검색하여 연관 기사 찾기
      const searchPromises = keywords.slice(0, 3).map(keyword =>
        fetch(`/api/news/search?query=${encodeURIComponent(keyword)}&page=0&size=5`)
          .then(res => res.json())
          .then(data => data.content || [])
          .catch(() => [])
      )

      const results = await Promise.all(searchPromises)
      
      // 결과 합치기 및 중복 제거
      const allArticles = results.flat()
      const uniqueArticles = allArticles.filter(article => 
        article.newsId !== currentNewsId
      ).slice(0, 6)

      setRelatedArticles(uniqueArticles)
    } catch (error) {
      console.error("연관 기사 로드 실패:", error)
      setError("연관 기사를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const extractKeywords = (title) => {
    if (!title) return []
    
    // 제목에서 주요 키워드 추출 (간단한 방식)
    const words = title
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && word.length < 10)
      .filter(word => !['이', '가', '을', '를', '의', '에', '로', '와', '과', '도', '는', '은', '다', '다가', '면서', '고', '며'].includes(word))
    
    return words.slice(0, 5)
  }

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            연관 기사
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            연관 기사
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchRelatedArticles}
              className="mt-2"
            >
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (relatedArticles.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            연관 기사
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            <p className="text-sm">관련된 기사를 찾을 수 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          연관 기사 ({relatedArticles.length}건)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedArticles.map((article) => (
            <div 
              key={article.newsId}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Link href={`/news/${article.newsId}`}>
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                  {article.title}
                </h4>
              </Link>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {article.press}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {article.categoryDescription || article.categoryName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(article.publishedAt).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.viewCount?.toLocaleString() || 0}
                  </span>
                  {article.dedupState && (
                    <Badge variant="outline" className="text-xs">
                      {article.dedupStateDescription}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 더 많은 연관 기사 보기 버튼 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link href={`/search?q=${encodeURIComponent(extractKeywords(title)[0] || '')}`}>
            <Button variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              더 많은 관련 기사 보기
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
