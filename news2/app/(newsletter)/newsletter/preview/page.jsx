"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  Download, 
  Copy, 
  RefreshCw,
  Mail,
  FileText,
  Code
} from "lucide-react"
import NewsletterTemplate from "@/components/NewsletterTemplate"
import { newsletterService } from "@/lib/newsletterService"
import { useToast } from "@/hooks/use-toast"

export default function NewsletterPreviewPage() {
  const [loading, setLoading] = useState(false)
  const [newsletterContent, setNewsletterContent] = useState(null)
  const [emailHtml, setEmailHtml] = useState("")
  const [emailText, setEmailText] = useState("")
  const [activeTab, setActiveTab] = useState("preview")
  const { toast } = useToast()

  // 설정 상태
  const [settings, setSettings] = useState({
    category: "정치",
    personalized: false,
    userId: "test-user-123",
    limit: 5,
    includeTrending: true,
    includeLatest: true,
    includeTracking: true,
    includeUnsubscribe: true,
    theme: "default"
  })

  // 카테고리 옵션
  const categories = [
    "정치", "경제", "사회", "IT/과학", "생활", "세계", "자동차/교통", "여행/음식", "예술"
  ]

  // 뉴스레터 콘텐츠 생성
  const generateNewsletter = async () => {
    setLoading(true)
    try {
      const content = await newsletterService.generateNewsletterContent({
        newsletterId: Date.now(),
        category: settings.category,
        personalized: settings.personalized,
        userId: settings.personalized ? settings.userId : null,
        limit: settings.limit
      })
      
      setNewsletterContent(content)
      
      toast({
        title: "✅ 뉴스레터 생성 완료",
        description: "새로운 뉴스레터 콘텐츠가 생성되었습니다.",
      })
    } catch (error) {
      console.error('뉴스레터 생성 실패:', error)
      toast({
        title: "❌ 뉴스레터 생성 실패",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 이메일 HTML 생성
  const generateEmailHtml = async () => {
    if (!newsletterContent) {
      toast({
        title: "⚠️ 뉴스레터 콘텐츠가 없습니다",
        description: "먼저 뉴스레터 콘텐츠를 생성해주세요.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const html = await newsletterService.generateNewsletterEmail({
        newsletterId: newsletterContent.id,
        category: settings.category,
        personalized: settings.personalized,
        userId: settings.personalized ? settings.userId : null,
        limit: settings.limit,
        includeTracking: settings.includeTracking,
        includeUnsubscribe: settings.includeUnsubscribe,
        theme: settings.theme,
        format: 'html'
      })
      
      setEmailHtml(html)
      
      toast({
        title: "✅ 이메일 HTML 생성 완료",
        description: "이메일용 HTML이 생성되었습니다.",
      })
    } catch (error) {
      console.error('이메일 HTML 생성 실패:', error)
      toast({
        title: "❌ 이메일 HTML 생성 실패",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 이메일 텍스트 생성
  const generateEmailText = async () => {
    if (!newsletterContent) {
      toast({
        title: "⚠️ 뉴스레터 콘텐츠가 없습니다",
        description: "먼저 뉴스레터 콘텐츠를 생성해주세요.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const text = await newsletterService.generateNewsletterEmail({
        newsletterId: newsletterContent.id,
        category: settings.category,
        personalized: settings.personalized,
        userId: settings.personalized ? settings.userId : null,
        limit: settings.limit,
        includeTracking: settings.includeTracking,
        includeUnsubscribe: settings.includeUnsubscribe,
        theme: settings.theme,
        format: 'text'
      })
      
      setEmailText(text)
      
      toast({
        title: "✅ 이메일 텍스트 생성 완료",
        description: "이메일용 텍스트가 생성되었습니다.",
      })
    } catch (error) {
      console.error('이메일 텍스트 생성 실패:', error)
      toast({
        title: "❌ 이메일 텍스트 생성 실패",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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

  // 설정 변경 핸들러
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // 초기 로드
  useEffect(() => {
    generateNewsletter()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            뉴스레터 미리보기 & 테스트
          </h1>
          <p className="text-gray-600">
            새로운 뉴스레터 시스템을 테스트하고 이메일 HTML을 생성할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 설정 패널 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 카테고리 선택 */}
                <div>
                  <Label htmlFor="category">카테고리</Label>
                  <Select 
                    value={settings.category} 
                    onValueChange={(value) => handleSettingChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 개인화 설정 */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="personalized"
                    checked={settings.personalized}
                    onCheckedChange={(checked) => handleSettingChange('personalized', checked)}
                  />
                  <Label htmlFor="personalized">개인화</Label>
                </div>

                {/* 사용자 ID */}
                {settings.personalized && (
                  <div>
                    <Label htmlFor="userId">사용자 ID</Label>
                    <input
                      id="userId"
                      type="text"
                      value={settings.userId}
                      onChange={(e) => handleSettingChange('userId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="사용자 ID 입력"
                    />
                  </div>
                )}

                {/* 기사 수 */}
                <div>
                  <Label htmlFor="limit">기사 수</Label>
                  <input
                    id="limit"
                    type="number"
                    min="1"
                    max="20"
                    value={settings.limit}
                    onChange={(e) => handleSettingChange('limit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {/* 트래킹 설정 */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tracking"
                    checked={settings.includeTracking}
                    onCheckedChange={(checked) => handleSettingChange('includeTracking', checked)}
                  />
                  <Label htmlFor="tracking">트래킹 픽셀 포함</Label>
                </div>

                {/* 구독 해지 링크 */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="unsubscribe"
                    checked={settings.includeUnsubscribe}
                    onCheckedChange={(checked) => handleSettingChange('includeUnsubscribe', checked)}
                  />
                  <Label htmlFor="unsubscribe">구독 해지 링크 포함</Label>
                </div>

                {/* 액션 버튼들 */}
                <div className="space-y-2 pt-4">
                  <Button 
                    onClick={generateNewsletter} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "생성 중..." : "뉴스레터 생성"}
                  </Button>
                  
                  <Button 
                    onClick={generateEmailHtml} 
                    disabled={loading || !newsletterContent}
                    variant="outline"
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    이메일 HTML 생성
                  </Button>
                  
                  <Button 
                    onClick={generateEmailText} 
                    disabled={loading || !newsletterContent}
                    variant="outline"
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    이메일 텍스트 생성
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="preview">미리보기</TabsTrigger>
                <TabsTrigger value="html">이메일 HTML</TabsTrigger>
                <TabsTrigger value="text">이메일 텍스트</TabsTrigger>
                <TabsTrigger value="json">JSON 데이터</TabsTrigger>
              </TabsList>

              {/* 미리보기 탭 */}
              <TabsContent value="preview" className="space-y-4">
                {newsletterContent ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{settings.category}</Badge>
                        {settings.personalized && (
                          <Badge variant="destructive">맞춤</Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {newsletterContent.sections?.length || 0}개 섹션
                        </span>
                      </div>
                    </div>
                    <NewsletterTemplate 
                      newsletter={newsletterContent} 
                      isPreview={true} 
                    />
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">뉴스레터를 생성해주세요.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* 이메일 HTML 탭 */}
              <TabsContent value="html" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        이메일 HTML
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button onClick={copyHtml} variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-1" />
                          복사
                        </Button>
                        <Button onClick={() => window.open('/api/newsletters/email', '_blank')} variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          새 창에서 보기
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {emailHtml ? (
                      <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto max-h-96">
                        <pre className="text-sm">{emailHtml}</pre>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        이메일 HTML을 생성해주세요.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 이메일 텍스트 탭 */}
              <TabsContent value="text" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        이메일 텍스트
                      </CardTitle>
                      <Button onClick={copyText} variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-1" />
                        복사
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {emailText ? (
                      <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
                        <pre className="text-sm whitespace-pre-wrap">{emailText}</pre>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        이메일 텍스트를 생성해주세요.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* JSON 데이터 탭 */}
              <TabsContent value="json" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      JSON 데이터
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {newsletterContent ? (
                      <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto max-h-96">
                        <pre className="text-sm">{JSON.stringify(newsletterContent.toJSON(), null, 2)}</pre>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        뉴스레터를 생성해주세요.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
