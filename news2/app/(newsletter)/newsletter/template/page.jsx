"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Download, Share2, Copy } from "lucide-react"
import Header from "@/components/header"
import NewsletterTemplate from "@/components/NewsletterTemplate"

export default function NewsletterTemplatePage() {
  const [isPreview, setIsPreview] = useState(true)
  const [showControls, setShowControls] = useState(true)

  const sampleNewsletters = [
    {
      id: 1,
      title: "매일 경제 뉴스",
      description: "주요 경제 뉴스와 시장 동향을 매일 아침에 받아보세요",
      category: "경제",
      author: "김경제",
      authorAvatar: "/placeholder-user.jpg",
      date: "2024년 1월 15일",
      time: "오전 9:00",
      subscribers: 15420,
      views: 8920,
      content: [
        {
          type: "header",
          title: "오늘의 주요 경제 뉴스",
          subtitle: "2024년 1월 15일 경제 동향 요약"
        },
        {
          type: "article",
          title: "한국은행, 기준금리 동결 결정",
          summary: "한국은행이 기준금리를 현재 수준으로 동결하기로 결정했습니다. 인플레이션 압력과 경제 성장률을 종합적으로 고려한 결정으로 분석됩니다.",
          image: "/placeholder.jpg",
          readTime: "3분",
          category: "금융"
        },
        {
          type: "article",
          title: "반도체 수출 회복세 지속",
          summary: "반도체 수출이 전년 대비 15% 증가하며 회복세를 보이고 있습니다. AI 수요 증가와 메모리 가격 상승이 주요 요인으로 꼽힙니다.",
          image: "/placeholder.jpg",
          readTime: "2분",
          category: "산업"
        },
        {
          type: "article",
          title: "원-달러 환율 변동성 확대",
          summary: "원-달러 환율이 1,300원 선에서 변동성을 보이고 있습니다. 미국 연방준비제도(Fed)의 통화정책 기조와 국내 경제 지표가 영향을 미치고 있습니다.",
          image: "/placeholder.jpg",
          readTime: "4분",
          category: "환율"
        }
      ],
      tags: ["경제", "투자", "시장동향", "금융"],
      footer: {
        unsubscribe: "구독 해지",
        preferences: "설정 변경",
        contact: "문의하기"
      }
    },
    {
      id: 2,
      title: "AI & Tech Weekly",
      description: "AI와 기술 분야의 최신 동향을 주간으로 정리해드립니다",
      category: "IT/과학",
      author: "박테크",
      authorAvatar: "/placeholder-user.jpg",
      date: "2024년 1월 14일",
      time: "오후 2:00",
      subscribers: 8920,
      views: 5670,
      content: [
        {
          type: "header",
          title: "이번 주 AI & Tech 하이라이트",
          subtitle: "2024년 1월 14일 기술 트렌드 요약"
        },
        {
          type: "article",
          title: "ChatGPT-5 출시 예고",
          summary: "OpenAI가 ChatGPT-5 출시를 예고했습니다. 더욱 정교한 대화 능력과 멀티모달 기능이 강화될 것으로 예상됩니다.",
          image: "/placeholder.jpg",
          readTime: "5분",
          category: "AI"
        },
        {
          type: "article",
          title: "메타버스 기술 발전",
          summary: "VR/AR 기술이 급속도로 발전하며 메타버스 생태계가 확장되고 있습니다. 주요 기업들의 투자가 활발히 이어지고 있습니다.",
          image: "/placeholder.jpg",
          readTime: "4분",
          category: "메타버스"
        },
        {
          type: "article",
          title: "블록체인 기술 동향",
          summary: "블록체인 기술이 금융, 공급망, 디지털 자산 분야에서 혁신을 가져오고 있습니다. 새로운 활용 사례들이 계속 등장하고 있습니다.",
          image: "/placeholder.jpg",
          readTime: "3분",
          category: "블록체인"
        }
      ],
      tags: ["AI", "기술", "혁신", "메타버스"],
      footer: {
        unsubscribe: "구독 해지",
        preferences: "설정 변경",
        contact: "문의하기"
      }
    }
  ]

  const [selectedNewsletter, setSelectedNewsletter] = useState(0)

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
      <Header />
      
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
        <NewsletterTemplate 
          newsletter={sampleNewsletters[selectedNewsletter]}
          isPreview={isPreview}
        />
      </div>
    </div>
  )
} 