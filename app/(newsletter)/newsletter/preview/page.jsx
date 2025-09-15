"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  RefreshCw,
  Send,
  Eye,
  Clock,
  Users,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import NewsletterTemplate from "@/components/newsletter/NewsletterTemplate"
import SmartShareComponent from "@/components/SmartShareComponent"
import { shareNewsletterAsKakaoFeed } from "@/lib/utils/kakaoFeedTemplate"
import { useToast } from "@/components/ui/use-toast"

export default function NewsletterPreviewPage() {
  const [loading, setLoading] = useState(false)
  const [newsletterContent, setNewsletterContent] = useState(null)
  const [feedType, setFeedType] = useState("trending")
  const [sentNewsletters, setSentNewsletters] = useState([])
  const [activeTab, setActiveTab] = useState("preview") // "preview" 또는 "sent"
  const { toast } = useToast()

  // 피드 B형 뉴스레터 타입 옵션
  const feedTypes = [
    { value: "trending", label: "트렌딩 뉴스", description: "인기 있는 뉴스 기반" },
    { value: "latest", label: "최신 뉴스", description: "최신 뉴스 기반" },
    { value: "personalized", label: "개인화", description: "사용자 맞춤 뉴스" }
  ]

  // 모의 데이터 (백엔드 서버가 없을 때 사용)
  const getMockNewsletterData = (type) => {
    const baseData = {
      id: `feed-b-${type}-${Date.now()}`,
      title: `피드 B형 뉴스레터 - ${feedTypes.find(t => t.value === type)?.label}`,
      description: `${feedTypes.find(t => t.value === type)?.description} 뉴스레터입니다.`,
      category: "피드 B형",
      personalized: type === "personalized",
      sections: [
        {
          title: "🔥 트렌딩 뉴스",
          items: [
            {
              title: "AI 기술 발전으로 인한 업계 변화",
              summary: "인공지능 기술이 급속도로 발전하면서 다양한 업계에서 변화가 일어나고 있습니다.",
              url: "#",
              publishedAt: new Date().toISOString()
            },
            {
              title: "코로나19 이후 경제 회복 전망",
              summary: "전문가들은 코로나19 이후 경제 회복이 예상보다 빠를 것으로 전망하고 있습니다.",
              url: "#",
              publishedAt: new Date().toISOString()
            }
          ]
        },
        {
          title: "📰 최신 뉴스",
          items: [
            {
              title: "새로운 정책 발표",
              summary: "정부가 새로운 정책을 발표하여 업계의 관심이 집중되고 있습니다.",
              url: "#",
              publishedAt: new Date().toISOString()
            }
          ]
        }
      ],
      readTime: 5,
      createdAt: new Date().toISOString()
    }
    
    return baseData
  }


  // 피드 B형 뉴스레터 미리보기 생성
  const generateFeedBNewsletter = async () => {
    setLoading(true)
    try {
      // Next.js API 라우트를 통해 프록시 요청
      const response = await fetch(`/api/newsletter/preview/feed-b?type=${feedType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 응답 오류:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('피드 B형 뉴스레터 데이터:', data)
      
      setNewsletterContent(data)
      
      const selectedType = feedTypes.find(type => type.value === feedType)
      toast({
        title: "✅ 피드 B형 뉴스레터 생성 완료",
        description: `${selectedType?.label} 기반 피드 B형 뉴스레터가 생성되었습니다.`,
      })
    } catch (error) {
      console.error('피드 B형 뉴스레터 생성 실패:', error)
      
      // 백엔드 서버가 없을 때 모의 데이터 사용
      if (error.message.includes('Failed to fetch') || error.message.includes('서버 오류')) {
        console.log('백엔드 서버 연결 실패, 모의 데이터 사용')
        
        const mockData = getMockNewsletterData(feedType)
        setNewsletterContent(mockData)
        
        const selectedType = feedTypes.find(type => type.value === feedType)
        toast({
          title: "⚠️ 모의 데이터로 표시",
          description: `백엔드 서버가 연결되지 않아 ${selectedType?.label} 모의 데이터를 표시합니다.`,
          variant: "default"
        })
        return
      }
      
      // 다른 오류의 경우
      let errorMessage = error.message
      if (error.message.includes('Failed to fetch')) {
        errorMessage = '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
      }
      
      toast({
        title: "❌ 피드 B형 뉴스레터 생성 실패",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 피드 B형 뉴스레터 전송
  const sendFeedBNewsletter = async () => {
    setLoading(true)
    try {
      // Next.js API 라우트를 통해 프록시 요청
      const response = await fetch('/api/newsletter/send/feed-b/personalized/1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 응답 오류:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('피드 B형 뉴스레터 전송 결과:', data)
      
      // 전송된 뉴스레터를 히스토리에 추가
      const sentNewsletter = {
        id: `sent-${Date.now()}`,
        newsletterId: newsletterContent?.id || `feed-b-${feedType}-${Date.now()}`,
        title: newsletterContent?.title || `피드 B형 뉴스레터 - ${feedTypes.find(t => t.value === feedType)?.label}`,
        type: feedType,
        sentAt: new Date().toISOString(),
        status: 'sent',
        recipientCount: 1,
        deliveryMethod: 'kakao',
        content: newsletterContent
      }
      
      setSentNewsletters(prev => [sentNewsletter, ...prev])
      
      toast({
        title: "✅ 피드 B형 뉴스레터 전송 완료",
        description: "카카오톡을 통해 피드 B형 뉴스레터가 전송되었습니다.",
      })
    } catch (error) {
      console.error('피드 B형 뉴스레터 전송 실패:', error)
      
      // 백엔드 서버가 없을 때 모의 응답
      if (error.message.includes('Failed to fetch') || error.message.includes('서버 오류')) {
        console.log('백엔드 서버 연결 실패, 모의 전송 응답')
        
        // 모의 전송도 히스토리에 추가
        const mockSentNewsletter = {
          id: `mock-sent-${Date.now()}`,
          newsletterId: newsletterContent?.id || `feed-b-${feedType}-${Date.now()}`,
          title: newsletterContent?.title || `피드 B형 뉴스레터 - ${feedTypes.find(t => t.value === feedType)?.label}`,
          type: feedType,
          sentAt: new Date().toISOString(),
          status: 'mock-sent',
          recipientCount: 1,
          deliveryMethod: 'kakao',
          content: newsletterContent,
          isMock: true
        }
        
        setSentNewsletters(prev => [mockSentNewsletter, ...prev])
        
        toast({
          title: "⚠️ 모의 전송 완료",
          description: "백엔드 서버가 연결되지 않아 모의 전송 응답을 표시합니다.",
          variant: "default"
        })
        return
      }
      
      // 다른 오류의 경우
      let errorMessage = error.message
      if (error.message.includes('Failed to fetch')) {
        errorMessage = '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
      }
      
      toast({
        title: "❌ 피드 B형 뉴스레터 전송 실패",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 카카오톡 피드 B형 템플릿 테스트
  const testKakaoFeedTemplate = async () => {
    if (!newsletterContent) {
      toast({
        title: "❌ 테스트 실패",
        description: "먼저 뉴스레터를 생성해주세요.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const result = await shareNewsletterAsKakaoFeed(newsletterContent, {
        showSocial: true,
        baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      })
      
      toast({
        title: "✅ 카카오톡 피드 B형 테스트 완료",
        description: "피드 B형 템플릿이 카카오톡으로 공유되었습니다!",
      })
    } catch (error) {
      console.error('카카오톡 피드 B형 테스트 실패:', error)
      toast({
        title: "❌ 카카오톡 피드 B형 테스트 실패",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }


  // localStorage에서 전송된 뉴스레터 히스토리 로드
  useEffect(() => {
    const savedSentNewsletters = localStorage.getItem('sentNewsletters')
    if (savedSentNewsletters) {
      try {
        setSentNewsletters(JSON.parse(savedSentNewsletters))
      } catch (error) {
        console.error('전송된 뉴스레터 히스토리 로드 실패:', error)
      }
    }
  }, [])

  // 전송된 뉴스레터 히스토리를 localStorage에 저장
  useEffect(() => {
    if (sentNewsletters.length > 0) {
      localStorage.setItem('sentNewsletters', JSON.stringify(sentNewsletters))
    }
  }, [sentNewsletters])

  // 초기 로드 및 피드 타입 변경 시 뉴스레터 생성
  useEffect(() => {
    generateFeedBNewsletter()
  }, [feedType])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            피드 B형 뉴스레터 관리
          </h1>
          <p className="text-gray-600">
            트렌딩 뉴스 기반 피드 B형 뉴스레터를 미리보고 카카오톡으로 전송할 수 있습니다.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("preview")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "preview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                미리보기
              </button>
              <button
                onClick={() => setActiveTab("sent")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "sent"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Send className="h-4 w-4 inline mr-2" />
                전송된 뉴스레터 ({sentNewsletters.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "preview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 사이드바 - 컨트롤 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>피드 B형 뉴스레터</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>뉴스레터 타입</Label>
                    <Select value={feedType} onValueChange={setFeedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="피드 타입을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {feedTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{type.label}</span>
                              <span className="text-xs text-gray-500">{type.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={generateFeedBNewsletter}
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      미리보기 새로고침
                    </Button>
                    
                  
                    
                    <Button 
                      onClick={testKakaoFeedTemplate}
                      disabled={loading || !newsletterContent}
                      className="w-full"
                      variant="secondary"
                    >
                      🧪 피드 B형 템플릿 테스트
                    </Button>
                  </div>
                  
                  {newsletterContent && (
                    <div className="pt-4 border-t">
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>✅ 뉴스레터 생성 완료</p>
                        <p>📊 {feedTypes.find(type => type.value === feedType)?.label} 기반</p>
                        <p>🎯 피드 B형 뉴스레터</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 메인 콘텐츠 - 미리보기 */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>피드 B형 뉴스레터</CardTitle>
                  {newsletterContent && (
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{feedTypes.find(type => type.value === feedType)?.label}</Badge>
                        <Badge variant="destructive">피드 B형</Badge>
                      <span className="text-sm text-gray-500">
                        {newsletterContent.sections?.length || 0}개 섹션
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {newsletterContent ? (
                    <div className="space-y-6">
                      {/* 카카오톡 공유 컴포넌트 */}
                      <SmartShareComponent 
                        newsletterData={newsletterContent}
                        showStats={true}
                        onShareSuccess={(result) => {
                          console.log('피드 B형 뉴스레터 공유 성공:', result);
                          toast({
                            title: "✅ 카카오톡 공유 완료",
                            description: "피드 B형 뉴스레터가 카카오톡으로 공유되었습니다!",
                          });
                        }}
                        onShareError={(error) => {
                          console.error('피드 B형 뉴스레터 공유 실패:', error);
                          toast({
                            title: "❌ 카카오톡 공유 실패",
                            description: "카카오톡 공유에 실패했습니다.",
                            variant: "destructive"
                          });
                        }}
                      />
                      
                      {/* 뉴스레터 미리보기 */}
                  <NewsletterTemplate 
                    newsletter={newsletterContent} 
                    isPreview={true} 
                  />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">피드 B형 뉴스레터를 생성해주세요.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* 전송된 뉴스레터 목록 */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>전송된 뉴스레터 히스토리</CardTitle>
                <p className="text-sm text-gray-600">
                  지금까지 전송된 피드 B형 뉴스레터 목록입니다.
                </p>
              </CardHeader>
              <CardContent>
                {sentNewsletters.length > 0 ? (
                  <div className="space-y-4">
                    {sentNewsletters.map((newsletter) => (
                      <div key={newsletter.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{newsletter.title}</h3>
                              <Badge variant={newsletter.isMock ? "outline" : "default"}>
                                {newsletter.isMock ? "모의 전송" : "실제 전송"}
                              </Badge>
                              <Badge variant="secondary">
                                {feedTypes.find(t => t.value === newsletter.type)?.label}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(newsletter.sentAt).toLocaleString('ko-KR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {newsletter.recipientCount}명
                              </div>
                              <div className="flex items-center gap-1">
                                <Send className="h-4 w-4" />
                                {newsletter.deliveryMethod}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {newsletter.status === 'sent' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="text-sm text-gray-600">
                                {newsletter.status === 'sent' ? '전송 완료' : '모의 전송'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewsletterContent(newsletter.content)
                                setActiveTab("preview")
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              미리보기
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">전송된 뉴스레터가 없습니다</h3>
                    <p className="text-gray-600 mb-4">
                      아직 전송된 뉴스레터가 없습니다. 뉴스레터를 전송해보세요.
                    </p>
                    <Button
                      onClick={() => setActiveTab("preview")}
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      뉴스레터 탭으로 이동
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}