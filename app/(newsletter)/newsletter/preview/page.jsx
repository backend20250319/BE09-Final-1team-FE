"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  RefreshCw
} from "lucide-react"
import NewsletterTemplate from "@/components/NewsletterTemplate"
import { newsletterService } from "@/lib/newsletterService"
import { useToast } from "@/hooks/use-toast"

export default function NewsletterPreviewPage() {
  const [loading, setLoading] = useState(false)
  const [newsletterContent, setNewsletterContent] = useState(null)
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
            뉴스레터 
          </h1>
          <p className="text-gray-600">
            새로운 뉴스레터 시스템을 테스트하고 미리보기할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 메인 콘텐츠 - 미리보기만 */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>뉴스레터</CardTitle>
                  {newsletterContent && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{settings.category}</Badge>
                      {settings.personalized && (
                        <Badge variant="destructive">맞춤</Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {newsletterContent.sections?.length || 0}개 섹션
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {newsletterContent ? (
                  <NewsletterTemplate 
                    newsletter={newsletterContent} 
                    isPreview={true} 
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">뉴스레터를 생성해주세요.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}