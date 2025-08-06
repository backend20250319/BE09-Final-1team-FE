"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Mail, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  Heart,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Users,
  Eye
} from "lucide-react"
import SubscribeForm from "./SubscribeForm"
import SubscriberCount from "./SubscriberCount"

export default function NewsletterTemplate({ 
  newsletter = null,
  isPreview = false 
}) {
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [updateCountFunction, setUpdateCountFunction] = useState(null)

  // 기본 뉴스레터 데이터
  const defaultNewsletter = {
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
  }

  const newsletterData = newsletter || defaultNewsletter

  const formatNumber = (num) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '만'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + '천'
    }
    return num.toString()
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 뉴스레터 헤더 */}
      <Card className="mb-6">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              {newsletterData.title}
            </CardTitle>
          </div>
          <p className="text-gray-600 text-lg">
            {newsletterData.description}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="secondary" className="text-sm">
              {newsletterData.category}
            </Badge>
            <SubscriberCount 
              initialCount={newsletterData.subscribers}
              onCountUpdate={setUpdateCountFunction}
            />
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye className="h-4 w-4" />
              <span>{formatNumber(newsletterData.views)} 조회</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 구독 폼 */}
      <div className="mb-6">
        <SubscribeForm 
          onSubscribeSuccess={(email) => {
            // 구독 성공 시 구독자 수 업데이트
            if (updateCountFunction) {
              updateCountFunction(1)
            }
            console.log('🎉 새로운 구독자:', email)
          }}
        />
      </div>

      {/* 뉴스레터 본문 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* 작성자 정보 */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <Avatar className="h-10 w-10">
              <AvatarImage src={newsletterData.authorAvatar} />
              <AvatarFallback>{newsletterData.author[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{newsletterData.author}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{newsletterData.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{newsletterData.time}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLiked(!liked)}
                className={liked ? "text-red-500" : "text-gray-500"}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBookmarked(!bookmarked)}
                className={bookmarked ? "text-blue-500" : "text-gray-500"}
              >
                <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 뉴스레터 콘텐츠 */}
          <div className="space-y-6">
            {newsletterData.content.map((item, index) => (
              <div key={index}>
                {item.type === "header" && (
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h2>
                    <p className="text-gray-600">{item.subtitle}</p>
                  </div>
                )}
                
                {item.type === "article" && (
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            읽는 시간 {item.readTime}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {item.summary}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="ghost" size="sm" className="text-blue-600">
                            자세히 보기
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 태그 */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">태그:</span>
              {newsletterData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 뉴스레터 푸터 */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">
                이 뉴스레터가 도움이 되셨나요?
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm">
              <Button variant="link" size="sm" className="text-gray-500">
                {newsletterData.footer.preferences}
              </Button>
              <Button variant="link" size="sm" className="text-gray-500">
                {newsletterData.footer.contact}
              </Button>
              <Button variant="link" size="sm" className="text-red-500">
                {newsletterData.footer.unsubscribe}
              </Button>
            </div>
            
            <Separator />
            
            <p className="text-xs text-gray-400">
              © 2024 뉴스레터. 모든 권리 보유.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 미리보기 모드 표시 */}
      {isPreview && (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2">
          <span className="text-sm text-yellow-800 font-medium">미리보기 모드</span>
        </div>
      )}
    </div>
  )
} 