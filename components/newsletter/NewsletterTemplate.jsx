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
import EnhancedSubscribeForm from "./EnhancedSubscribeForm"
import SubscriberCount from "../SubscriberCount"
import { useKakaoShare } from "@/lib/hooks/useKakaoShare"
import { getUserInfo } from "@/lib/auth/auth"

// 카카오 공유 관련 상수
const KAKAO_TEMPLATE_ID = 123798; // 템플릿 빌더에서 생성한 템플릿 ID

// 기사 클릭 추적 함수
const trackNewsClick = async (newsId, newsletterId, category, articleTitle, articleUrl) => {
  try {
    const userInfo = getUserInfo();
    if (!userInfo) {
      console.warn('사용자 정보가 없어 클릭 추적을 건너뜁니다.');
      return;
    }

    const response = await fetch('/api/newsletter/track-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newsId,
        newsletterId,
        category,
        articleTitle,
        articleUrl
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 기사 클릭 추적 성공:', result);
    } else {
      console.warn('⚠️ 기사 클릭 추적 실패:', response.status);
    }
  } catch (error) {
    console.warn('읽기 기록 전송 실패:', error);
  }
};

export default function NewsletterTemplate({ 
  newsletter = null,
  isPreview = false 
}) {
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [updateCountFunction, setUpdateCountFunction] = useState(null)
  
  // 카카오 공유 훅 사용
  const { share: shareNewsletter, isLoading: isSharing, error: shareError } = useKakaoShare(KAKAO_TEMPLATE_ID)

  // 카카오 공유 핸들러
  const handleKakaoShare = async () => {
    try {
      await shareNewsletter(newsletterData);
      console.log('카카오톡 공유 성공!');
    } catch (error) {
      console.error('카카오톡 공유 실패:', error);
    }
  };

  // 새로운 DTO 구조와 기존 구조 모두 지원
  const newsletterData = {
    id: 0,
    title: "뉴스레터 제목",
    description: "뉴스레터 설명",
    category: "일반",
    author: "작성자",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date().toLocaleDateString("ko-KR"),
    time: new Date().toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' }),
    subscribers: 0,
    views: 0,
    content: [],
    sections: [], // 새로운 DTO 구조
    tags: [],
    footer: {
      unsubscribe: "구독 해지",
      preferences: "설정 변경",
      contact: "문의하기"
    },
    // newsletter prop이 있으면 병합
    ...newsletter
  }

  const formatNumber = (num) => {
    // undefined, null, NaN 체크
    if (num == null || isNaN(num)) {
      return '0'
    }
    
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '만'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + '천'
    }
    return num.toString()
  }

  // 새로운 DTO 구조에서 섹션 렌더링
  const renderSections = () => {
    // 새로운 DTO 구조 우선 사용
    if (newsletterData.sections && newsletterData.sections.length > 0) {
      return newsletterData.sections.map((section, index) => (
        <div key={index}>
          {section.type === "header" && (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {section.heading}
              </h2>
              {section.subtitle && (
                <p className="text-gray-600">{section.subtitle}</p>
              )}
            </div>
          )}
          
          {section.type === "article" && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {section.heading}
              </h3>
              <div className="space-y-4">
                {section.items && section.items.length > 0 ? section.items.map((article, articleIndex) => (
                  <div key={articleIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {article.source || newsletterData.category}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ko-KR') : '오늘'}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {article.title}
                        </h4>
                        {article.summary && (
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {article.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600"
                            onClick={() => {
                              // 기사 클릭 추적
                              trackNewsClick(
                                article.id || `article-${articleIndex}`,
                                newsletterData.id,
                                newsletterData.category,
                                article.title,
                                article.url || article.link
                              );
                              
                              // 기사 링크로 이동 (URL이 있는 경우)
                              if (article.url || article.link) {
                                window.open(article.url || article.link, '_blank', 'noopener,noreferrer');
                              }
                            }}
                          >
                            자세히 보기
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                      {article.imageUrl && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>아직 뉴스가 없습니다.</p>
                    <p className="text-sm">곧 새로운 뉴스를 가져올 예정입니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))
    }

    // 기존 구조 폴백
    if (newsletterData.content && newsletterData.content.length > 0) {
      return newsletterData.content.map((item, index) => (
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600"
                      onClick={() => {
                        // 기사 클릭 추적
                        trackNewsClick(
                          item.id || `item-${index}`,
                          newsletterData.id,
                          newsletterData.category,
                          item.title,
                          item.url || item.link
                        );
                        
                        // 기사 링크로 이동 (URL이 있는 경우)
                        if (item.url || item.link) {
                          window.open(item.url || item.link, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
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
      ))
    }

    // 기본 메시지
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">새로운 뉴스가 준비 중입니다.</p>
      </div>
    )
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
            {newsletterData.personalized && (
              <Badge variant="destructive" className="text-sm">
                맞춤
              </Badge>
            )}
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
        <EnhancedSubscribeForm 
          category={newsletterData.category}
          onSubscribeSuccess={(email, subscriptionData) => {
            // 구독 성공 시 구독자 수 업데이트
            if (updateCountFunction) {
              updateCountFunction(1)
            }
            console.log('🎉 새로운 구독자:', email, subscriptionData)
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
              <AvatarFallback>{newsletterData.author?.charAt(0) || "N"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">{newsletterData.author}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{newsletterData.date}</span>
                <Clock className="h-3 w-3" />
                <span>{newsletterData.time}</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setLiked(!liked)}>
                <Heart className={`h-4 w-4 ${liked ? 'text-red-500 fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setBookmarked(!bookmarked)}>
                <Bookmark className={`h-4 w-4 ${bookmarked ? 'text-blue-500 fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleKakaoShare} disabled={isSharing}>
                <Share2 className="h-4 w-4" />
                {isSharing && (
                  <svg className="animate-spin h-4 w-4 ml-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </Button>
            </div>
          </div>

          {/* 뉴스레터 콘텐츠 */}
          <div className="space-y-6">
            {renderSections()}
          </div>

          {/* 태그 */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">태그:</span>
              {newsletterData.tags && newsletterData.tags.map((tag, index) => (
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
              {newsletterData.footer?.preferences && (
                <Button variant="link" size="sm" className="text-gray-500">
                  {newsletterData.footer.preferences}
                </Button>
              )}
              {newsletterData.footer?.contact && (
                <Button variant="link" size="sm" className="text-gray-500">
                  {newsletterData.footer.contact}
                </Button>
              )}
              {newsletterData.footer?.unsubscribe && (
                <Button variant="link" size="sm" className="text-red-500">
                  {newsletterData.footer.unsubscribe}
                </Button>
              )}
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