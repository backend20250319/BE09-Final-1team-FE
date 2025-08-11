"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Share2, Bookmark, Eye, Clock, User } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import { newsService } from "@/lib/newsService"
import AiSummaryButton from "../../../../components/aisummarybot/AiSummaryButton"
import RelatedArticles from "@/components/RelatedArticles"

export default function NewsDetailPage() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchArticle = async () => {
      console.log('🔄 뉴스 상세 데이터 로딩 시작:', id)
      const data = await newsService.getNewsById(id)
      console.log('📦 받은 뉴스 데이터:', data)
      
      if (!data) {
        console.error('❌ 뉴스 데이터 없음')
        setError("뉴스를 찾을 수 없습니다.")
      } else {
        console.log('✅ 뉴스 데이터 설정 완료')
        setArticle(data)
        // 조회수 증가
        await newsService.incrementViews(id)
      }
      setLoading(false)
    }

    if (id) fetchArticle()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-64 bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">뉴스를 찾을 수 없습니다</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link href="/">
                <Button className="gradient-bg hover:shadow-lg transition-all duration-300">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  메인으로 돌아가기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="hover-glow">
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로 돌아가기
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2">
            <Card className="glass hover-lift">
              <CardContent className="p-0">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-blue-600 text-white px-4 py-1 rounded-full shadow-lg">
                      {article.category === 'POLITICS' ? '정치' :
                       article.category === 'ECONOMY' ? '경제' :
                       article.category === 'SOCIETY' ? '사회' :
                       article.category === 'LIFESTYLE' ? '생활/문화' :
                       article.category === 'TECHNOLOGY' ? 'IT/과학' :
                       article.category === 'INTERNATIONAL' ? '국제' :
                       article.category}
                    </Badge>
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="hover-glow">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover-glow">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">{article.title}</h1>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {article.author || "기자"}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(article.publishedAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <AiSummaryButton newsId={article.id} />
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {article.views?.toLocaleString() || 0}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span>{article.source}</span>
                    </div>
                  </div>
                </div>

                {article.image && (
                  <div className="relative">
                    <img src={article.image} alt={article.title} className="w-full h-96 object-cover" />
                  </div>
                )}

                <div className="p-6">
                  <div className="prose prose-lg max-w-none">
                    {article.content ? (
                      <div dangerouslySetInnerHTML={{ __html: article.content }} />
                    ) : (
                      <div className="space-y-4">
                        <p className="text-lg text-gray-700 leading-relaxed">{article.summary}</p>
                        <p className="text-gray-600">이 뉴스에 대한 자세한 내용은 곧 업데이트될 예정입니다.</p>
                      </div>
                    )}
                  </div>

                  {article.tags && article.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">관련 키워드</h3>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag, index) => (
                          <Link key={index} href={`/search?q=${encodeURIComponent(tag)}`}>
                            <Badge 
                              variant="outline" 
                              className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                            >
                              #{tag}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <RelatedArticles 
                currentNewsId={article.id}
                category={article.category}
                press={article.source}
                title={article.title}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
