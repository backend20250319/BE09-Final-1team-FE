"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Download, Share2, Copy } from "lucide-react"
import NewsletterTemplate from "@/components/newsletter/NewsletterTemplate"

export default function NewsletterTemplatePage() {
  const [isPreview, setIsPreview] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [sampleNewsletters, setSampleNewsletters] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNewsletter, setSelectedNewsletter] = useState(0)

  useEffect(() => {
    const fetchNewsletters = async () => {
      setLoading(true)
      
      try {
        // 실제 API 호출로 변경
        const response = await fetch('/api/newsletters/templates')
        const data = await response.json()
        setSampleNewsletters(data || [])
      } catch (error) {
        console.error('❌ 뉴스레터 템플릿 데이터 로딩 실패:', error)
        
        // 폴백 데이터 설정
        const fallbackNewsletters = [
          {
            id: 1,
            title: "AI 기술 트렌드",
            description: "최신 AI 기술 동향과 미래 전망",
            tags: ["AI", "기술", "혁신", "메타버스"],
            footer: {
              unsubscribe: "구독 해지",
              preferences: "설정 변경",
              contact: "문의하기"
            }
          }
        ]
        
        setSampleNewsletters(fallbackNewsletters)
      } finally {
        setLoading(false)
      }
    }

    fetchNewsletters()
  }, [])

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText("뉴스레터 템플릿이 복사되었습니다.")
    // 실제로는 템플릿 코드를 복사하는 로직을 구현할 수 있습니다
  }

  const handleDownloadTemplate = () => {
    // 템플릿을 다운로드하는 로직을 구현할 수 있습니다
    console.log("템플릿 다운로드")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 컨트롤 패널 */}
        {showControls && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                뉴스레터 템플릿 미리보기
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowControls(!showControls)}
                >
                  {showControls ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="preview-mode"
                      checked={isPreview}
                      onCheckedChange={setIsPreview}
                    />
                    <Label htmlFor="preview-mode">미리보기 모드</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label>템플릿 선택:</Label>
                    <select
                      value={selectedNewsletter}
                      onChange={(e) => setSelectedNewsletter(Number(e.target.value))}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {sampleNewsletters.map((newsletter, index) => (
                        <option key={index} value={index}>
                          {newsletter.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyTemplate}>
                    <Copy className="h-4 w-4 mr-1" />
                    복사
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                    <Download className="h-4 w-4 mr-1" />
                    다운로드
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    공유
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>• 미리보기 모드: 실제 이메일 클라이언트에서 보이는 모습을 시뮬레이션합니다.</p>
                <p>• 반응형 디자인: 모바일과 데스크톱에서 모두 최적화된 레이아웃을 제공합니다.</p>
                <p>• 커스터마이징: 색상, 폰트, 레이아웃을 쉽게 수정할 수 있습니다.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 뉴스레터 템플릿 */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">템플릿 로딩 중...</p>
          </div>
        ) : (
          <NewsletterTemplate 
            newsletter={sampleNewsletters[selectedNewsletter]}
            isPreview={isPreview}
          />
        )}
      </div>
    </div>
  )
} 