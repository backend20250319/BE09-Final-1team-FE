"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Head from "next/head"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Eye, 
  Download, 
  Copy, 
  RefreshCw,
  Mail,
  FileText,
  Code,
  Share2,
  Users
} from "lucide-react"
import NewsletterTemplate from "@/components/newsletter/NewsletterTemplate"
import KakaoFriendMessage from "@/components/KakaoFriendMessage"
import SmartShareComponent from "@/components/SmartShareComponent"
import EnhancedNewsletterPreview from "@/components/newsletter/EnhancedNewsletterPreview"
import { newsletterService } from "@/lib/api/newsletter"
import { useToast } from "@/components/ui/use-toast"
import { useKakaoShare } from "@/lib/hooks/useKakaoShare"

export default function NewsletterPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [newsletterContent, setNewsletterContent] = useState(null)
  const [emailHtml, setEmailHtml] = useState("")
  const [emailText, setEmailText] = useState("")
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('enhanced') // 'enhanced' 또는 'original'
  
  // 뉴스 데이터 상태
  const [newsData, setNewsData] = useState([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsError, setNewsError] = useState(null)

  // 카카오 공유 훅
  const { share: shareNewsletter, sendToFriends, isLoading: isSharing } = useKakaoShare(123798)

  // URL 디코딩 처리
  const rawNewsletterId = params?.newsletterId
  const newsletterId = rawNewsletterId ? decodeURIComponent(rawNewsletterId) : null
  
  // 디버깅을 위한 로그
  useEffect(() => {
    if (params) {
      console.log('📋 URL 파라미터 정보:')
      console.log('  - rawNewsletterId:', rawNewsletterId)
      console.log('  - newsletterId:', newsletterId)
      console.log('  - params:', params)
    }
  }, [params, rawNewsletterId, newsletterId])

  // 뉴스 데이터 로드
  const loadNews = async () => {
    try {
      setNewsLoading(true)
      setNewsError(null)
      
      console.log('🔄 뉴스 데이터 로드 시작')
      
      const response = await fetch('/api/news?limit=10')
      const data = await response.json()
      
      if (data.success && data.data) {
        setNewsData(data.data)
        console.log('✅ 뉴스 데이터 로드 성공:', data.data.length, '개')
      } else {
        setNewsError(data.error || '뉴스를 불러오는데 실패했습니다.')
        console.error('❌ 뉴스 데이터 로드 실패:', data.error)
      }
    } catch (error) {
      console.error('❌ 뉴스 데이터 로드 중 오류:', error)
      setNewsError('뉴스를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setNewsLoading(false)
    }
  }

  // 뉴스레터 데이터 로드
  const loadNewsletter = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 전체 params:', params)
      console.log('🔍 원본 newsletterId:', rawNewsletterId)
      console.log('🔍 디코딩된 newsletterId:', newsletterId, typeof newsletterId)
      console.log('🔍 URL:', typeof window !== 'undefined' ? window.location.href : 'N/A')

      // newsletterId가 유효한지 확인
      if (!newsletterId || newsletterId.trim() === '') {
        console.error('❌ 뉴스레터 ID가 비어있음:', newsletterId)
        throw new Error('뉴스레터 ID가 제공되지 않았습니다.')
      }

      // 템플릿 문자열인지 확인 (예: {newsletterId})
      if (newsletterId.includes('{') && newsletterId.includes('}')) {
        console.error('❌ 템플릿 문자열이 전달됨:', newsletterId)
        console.log('🔄 기본 뉴스레터로 대체 시도...')
        
        // 템플릿 문자열인 경우 기본 뉴스레터 ID(1)로 대체
        const fallbackId = '1'
        console.log('📡 대체 API 호출:', `/api/newsletters/${fallbackId}`)
        
        const fallbackResponse = await fetch(`/api/newsletters/${fallbackId}`, {
          credentials: 'include'
        })
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          if (fallbackData.success && fallbackData.data) {
            setNewsletterContent(fallbackData.data)
          } else if (fallbackData.data) {
            setNewsletterContent(fallbackData.data)
          } else {
            setNewsletterContent(fallbackData)
          }
          
          toast({
            title: "ℹ️ 기본 뉴스레터 표시",
            description: "요청하신 뉴스레터를 찾을 수 없어 기본 뉴스레터를 표시합니다.",
          })
          return
        } else {
          throw new Error('잘못된 뉴스레터 ID 형식입니다. 실제 뉴스레터 ID를 사용해주세요.')
        }
      }
      
      // 숫자로 변환 가능한지 확인
      const id = parseInt(newsletterId, 10)
      if (isNaN(id) || id <= 0) {
        console.error('❌ 뉴스레터 ID가 숫자가 아님:', newsletterId, '->', id)
        throw new Error('유효하지 않은 뉴스레터 ID입니다. 숫자 ID를 사용해주세요.')
      }

      // 뉴스레터 데이터 가져오기
      console.log('📡 API 호출:', `/api/newsletters/${newsletterId}`)
      const response = await fetch(`/api/newsletters/${newsletterId}`, {
        credentials: 'include' // 쿠키 포함
      })
      
      console.log('📡 API 응답:', response.status, response.statusText)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`뉴스레터 ID ${newsletterId}를 찾을 수 없습니다.`)
        }
        if (response.status === 400) {
          throw new Error('잘못된 뉴스레터 ID 형식입니다.')
        }
        throw new Error(`뉴스레터를 불러오는데 실패했습니다. (${response.status})`)
      }

      const data = await response.json()
      
      // API 응답 구조 확인
      if (data.success && data.data) {
        setNewsletterContent(data.data)
      } else if (data.data) {
        setNewsletterContent(data.data)
      } else {
        setNewsletterContent(data)
      }

      // 이메일 HTML 생성 (선택사항)
      try {
        const emailResponse = await fetch(`/api/newsletters/email?id=${newsletterId}`, {
          credentials: 'include'
        })
        if (emailResponse.ok) {
          const emailData = await emailResponse.text()
          setEmailHtml(emailData)
          setEmailText(emailData.replace(/<[^>]*>/g, '')) // HTML 태그 제거
        }
      } catch (emailError) {
        console.warn('이메일 HTML 생성 실패:', emailError)
        // 이메일 HTML 생성 실패는 치명적이지 않으므로 계속 진행
      }

    } catch (err) {
      console.error('뉴스레터 로드 실패:', err)
      setError(err.message)
      toast({
        title: "❌ 로드 실패",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 카카오톡 공유
  const handleKakaoShare = async () => {
    if (!newsletterContent) return

    try {
      await shareNewsletter(newsletterContent)
      toast({
        title: "✅ 공유 완료",
        description: "카카오톡으로 뉴스레터가 공유되었습니다!",
      })
    } catch (error) {
      console.error('카카오톡 공유 실패:', error)
      toast({
        title: "❌ 공유 실패",
        description: "카카오톡 공유에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 친구에게 뉴스레터 보내기
  const handleSendToFriends = async () => {
    if (!newsletterContent) return

    try {
      const result = await sendToFriends(newsletterContent)
      toast({
        title: "✅ 메시지 발송 완료",
        description: result.message,
      })
    } catch (error) {
      console.error('친구에게 메시지 발송 실패:', error)
      toast({
        title: "❌ 메시지 발송 실패",
        description: "친구에게 메시지 발송에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // HTML 복사
  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(emailHtml)
      toast({
        title: "✅ HTML 복사 완료",
        description: "이메일 HTML이 클립보드에 복사되었습니다.",
      })
    } catch (error) {
      toast({
        title: "❌ 복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 텍스트 복사
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(emailText)
      toast({
        title: "✅ 텍스트 복사 완료",
        description: "이메일 텍스트가 클립보드에 복사되었습니다.",
      })
    } catch (error) {
      toast({
        title: "❌ 복사 실패",
        description: "클립보드 복사에 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  // 초기 로드
  useEffect(() => {
    console.log('🔄 useEffect 실행:', newsletterId)
    console.log('🔄 params:', params)
    
    // params가 아직 로드되지 않았으면 잠시 대기
    if (!params || !params.newsletterId) {
      console.log('⏳ params 로딩 중...')
      return
    }
    
    if (newsletterId) {
      loadNewsletter()
      loadNews() // 뉴스 데이터도 함께 로드
    } else {
      console.error('❌ newsletterId가 없음')
      setError('뉴스레터 ID가 제공되지 않았습니다.')
      setLoading(false)
    }
  }, [newsletterId, params])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">뉴스레터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">뉴스레터를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            
            {/* 템플릿 문자열 오류인 경우 */}
            {(error.includes('템플릿 문자열') || error.includes('잘못된 뉴스레터 ID') || newsletterId?.includes('{')) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-red-500 mt-1">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 mb-2">잘못된 뉴스레터 ID 형식입니다</h3>
                    <p className="text-sm text-red-700 mb-3">
                      URL에 <code className="bg-red-100 px-1 rounded">{newsletterId}</code>와 같은 템플릿 문자열이 사용되었습니다.
                    </p>
                    <div className="bg-white border border-red-200 rounded p-3 mb-3">
                      <p className="text-sm text-red-800">
                        <strong>해결 방법:</strong><br/>
                        다른 페이지에서 이 링크를 클릭할 때 실제 뉴스레터 ID를 사용해야 합니다.<br/>
                        예: <code className="bg-gray-100 px-1 rounded">/newsletter/123/preview</code>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-red-700 mb-2">
                        <strong>테스트용 뉴스레터:</strong>
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          onClick={() => router.push('/newsletter/1/preview')}
                          size="sm"
                          variant="outline"
                          className="text-xs border-red-300 text-red-700 hover:bg-red-50"
                        >
                          뉴스레터 #1 보기
                        </Button>
                        <Button 
                          onClick={() => router.push('/newsletter/2/preview')}
                          size="sm"
                          variant="outline"
                          className="text-xs border-red-300 text-red-700 hover:bg-red-50"
                        >
                          뉴스레터 #2 보기
                        </Button>
                        <Button 
                          onClick={() => router.push('/newsletter/3/preview')}
                          size="sm"
                          variant="outline"
                          className="text-xs border-red-300 text-red-700 hover:bg-red-50"
                        >
                          뉴스레터 #3 보기
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 일반적인 오류인 경우 */}
            {!(error.includes('템플릿 문자열') || error.includes('잘못된 뉴스레터 ID') || newsletterId?.includes('{')) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>도움말:</strong> 뉴스레터 목록에서 올바른 뉴스레터를 선택해주세요.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Button onClick={loadNewsletter} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                다시 시도
              </Button>
              <Button variant="outline" onClick={() => router.back()} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로 가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                뒤로 가기
              </Button>
              <div>
                <h1 className="text-xl font-semibold">뉴스레터 미리보기</h1>
                <p className="text-sm text-gray-500">ID: {newsletterId}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setViewMode(viewMode === 'enhanced' ? 'original' : 'enhanced')}
                variant="outline"
              >
                {viewMode === 'enhanced' ? '기본 보기' : '향상된 보기'}
              </Button>
              <Button onClick={handleKakaoShare} disabled={isSharing}>
                <Share2 className="h-4 w-4 mr-2" />
                {isSharing ? "공유 중..." : "카카오톡 공유"}
              </Button>
              <Button onClick={handleSendToFriends} disabled={isSharing} variant="secondary">
                <Users className="h-4 w-4 mr-2" />
                {isSharing ? "발송 중..." : "친구에게 보내기"}
              </Button>
              <Button variant="outline" onClick={copyHtml}>
                <Copy className="h-4 w-4 mr-2" />
                HTML 복사
              </Button>
              <Button variant="outline" onClick={copyText}>
                <FileText className="h-4 w-4 mr-2" />
                텍스트 복사
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto p-6">
        {newsletterContent ? (
          viewMode === 'enhanced' ? (
            <EnhancedNewsletterPreview 
              newsletterData={newsletterContent}
              userId={null} // 실제 사용자 ID로 교체 가능
              showPersonalization={true}
              newsData={newsData}
              newsLoading={newsLoading}
              newsError={newsError}
              onNewsRefresh={loadNews}
            />
          ) : (
            <div className="space-y-6">
              {/* 뉴스레터 정보 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{newsletterContent.title}</CardTitle>
                      <p className="text-gray-600 mt-2">{newsletterContent.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{newsletterContent.category}</Badge>
                      {newsletterContent.personalized && (
                        <Badge variant="destructive">맞춤</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* 스마트 공유 컴포넌트 */}
              <SmartShareComponent 
                newsletterData={newsletterContent}
                showStats={true}
                onShareSuccess={(result) => {
                  console.log('공유 성공:', result);
                }}
                onShareError={(error) => {
                  console.error('공유 실패:', error);
                }}
              />

              {/* 친구에게 보내기 */}
              <KakaoFriendMessage 
                newsletterData={newsletterContent}
                className="mb-6"
              />

              {/* 뉴스레터 템플릿 */}
              <NewsletterTemplate 
                newsletter={newsletterContent} 
                isPreview={true} 
              />

              {/* 뉴스 섹션 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-blue-500" />
                    최신 뉴스
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {newsLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-gray-500">뉴스를 불러오는 중...</p>
                    </div>
                  ) : newsError ? (
                    <div className="text-center py-8">
                      <div className="text-red-500 mb-2">
                        <FileText className="h-8 w-8 mx-auto" />
                      </div>
                      <p className="text-sm text-red-600">{newsError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadNews}
                        className="mt-2"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        다시 시도
                      </Button>
                    </div>
                  ) : newsData.length > 0 ? (
                    <div className="space-y-4">
                      {newsData.map((news, index) => (
                        <div key={news.id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                {news.title}
                              </h3>
                              {news.summary && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {news.summary}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {news.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {news.category}
                                  </Badge>
                                )}
                                {news.publishedAt && (
                                  <span>
                                    {new Date(news.publishedAt).toLocaleDateString()}
                                  </span>
                                )}
                                {news.source && (
                                  <span>출처: {news.source}</span>
                                )}
                              </div>
                            </div>
                            {news.url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(news.url, '_blank', 'noopener,noreferrer')}
                                className="ml-4"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <FileText className="h-8 w-8 mx-auto" />
                      </div>
                      <p className="text-sm text-gray-500">표시할 뉴스가 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">뉴스레터 데이터를 불러올 수 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
