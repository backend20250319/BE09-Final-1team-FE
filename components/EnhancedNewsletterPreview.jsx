"use client"

import { useState, useEffect } from 'react';
import { ExternalLink, Clock, Calendar, Tag, Share2, User, Eye, TrendingUp, Users, BookOpen } from 'lucide-react';
import SmartShareComponent from './SmartShareComponent';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 뉴스 클릭 추적 함수
const trackNewsClick = async (newsId, userId, newsletterId) => {
  try {
    await fetch('/api/analytics/news-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 쿠키 포함
      body: JSON.stringify({
        newsId,
        userId,
        newsletterId,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('클릭 추적 실패:', error);
  }
};

// 뉴스 기사 컴포넌트
const NewsArticle = ({ article, index, userId, newsletterId, onNewsClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    
    // 클릭 추적
    trackNewsClick(article.id || index, userId, newsletterId);
    
    // 콜백 실행
    onNewsClick?.(article);
    
    // 새 탭에서 열기
    if (article.url && article.url !== 'null') {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  const isValidUrl = article.url && article.url !== 'null' && article.url !== '';

  return (
    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {isValidUrl ? (
              <a
                href={article.url}
                onClick={handleClick}
                className="block group cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2 line-clamp-2">
                  {article.title}
                  <ExternalLink className="inline-block h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
              </a>
            ) : (
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {article.title}
                <Badge variant="destructive" className="ml-2 text-xs">
                  링크 없음
                </Badge>
              </h3>
            )}
            
            {article.summary && (
              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                {article.summary}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {article.category && (
              <Badge variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {article.category}
              </Badge>
            )}
            {article.publishedAt && (
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(article.publishedAt).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
          
          {isValidUrl && (
            <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
              자세히 보기 →
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// 메인 뉴스레터 미리보기 컴포넌트
export default function EnhancedNewsletterPreview({ 
  newsletterData = {},
  userId = null,
  showPersonalization = true 
}) {
  const [viewCount, setViewCount] = useState(0);
  const [shareStats, setShareStats] = useState({ total: 0, recent: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 조회수 추적
  useEffect(() => {
    const trackView = async () => {
      try {
        const response = await fetch('/api/analytics/newsletter-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // 쿠키 포함
          body: JSON.stringify({
            newsletterId: newsletterData.id,
            userId: userId,
            timestamp: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setViewCount(data.totalViews || 0);
        }
      } catch (error) {
        console.error('조회수 추적 실패:', error);
      }
    };

    if (newsletterData.id) {
      trackView();
    }
  }, [newsletterData.id, userId]);

  // 공유 통계 조회
  useEffect(() => {
    const fetchShareStats = async () => {
      try {
        const response = await fetch(`/api/analytics/newsletter-shares/${newsletterData.id}`, {
          credentials: 'include' // 쿠키 포함
        });
        if (response.ok) {
          const data = await response.json();
          setShareStats(data);
        }
      } catch (error) {
        console.error('공유 통계 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (newsletterData.id) {
      fetchShareStats();
    } else {
      setIsLoading(false);
    }
  }, [newsletterData.id]);

  const handleNewsClick = (article) => {
    console.log('뉴스 클릭:', article.title);
    // 추가적인 클릭 처리 로직
  };

  const handleShareSuccess = (result) => {
    console.log('공유 성공:', result);
    // 공유 통계 업데이트
    setShareStats(prev => ({
      ...prev,
      total: prev.total + 1,
      recent: prev.recent + 1
    }));
  };

  const totalArticles = newsletterData.sections?.reduce((total, section) => 
    total + (section.items?.length || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white">
        <div className="animate-pulse">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-48 rounded-t-lg"></div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
              📰 뉴스레터
            </Badge>
            {showPersonalization && userId && (
              <Badge variant="secondary" className="bg-green-500 bg-opacity-80 text-white border-green-400">
                맞춤형
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {viewCount.toLocaleString()}회 조회
            </span>
            <span className="flex items-center">
              <Share2 className="h-4 w-4 mr-1" />
              {shareStats.total}회 공유
            </span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">
          {newsletterData.title || '📰 오늘의 핫한 뉴스'}
        </h1>
        
        <div className="flex items-center space-x-4 text-blue-100">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(newsletterData.publishedAt || Date.now()).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short'
            })}
          </span>
          <span>총 {totalArticles}개 기사</span>
          <span>예상 읽기 시간 {newsletterData.readTime || Math.ceil(totalArticles * 0.5)}분</span>
        </div>
      </div>

      {/* 뉴스레터 통계 */}
      <div className="bg-blue-50 border-b p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-600">{totalArticles}</div>
            <div className="text-sm text-gray-600 flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              총 기사 수
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-green-600">{newsletterData.sections?.length || 0}</div>
            <div className="text-sm text-gray-600 flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              섹션 수
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-purple-600">{viewCount.toLocaleString()}</div>
            <div className="text-sm text-gray-600 flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              조회수
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-orange-600">{shareStats.total}</div>
            <div className="text-sm text-gray-600 flex items-center">
              <Share2 className="h-4 w-4 mr-1" />
              공유 횟수
            </div>
          </div>
        </div>
      </div>

      {/* 개인화 정보 */}
      {showPersonalization && userId && (
        <div className="bg-green-50 border-b border-green-200 p-4">
          <div className="flex items-center">
            <User className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              이 뉴스레터는 회원님의 관심사에 맞게 개인화되었습니다
            </span>
          </div>
        </div>
      )}

      {/* 뉴스 섹션들 */}
      <div className="p-6 space-y-8">
        {newsletterData.sections?.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            <div className="border-b-2 border-blue-500 pb-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {section.title || `섹션 ${sectionIndex + 1}`}
              </h2>
              {section.description && (
                <p className="text-gray-600 mt-1">{section.description}</p>
              )}
            </div>

            <div className="grid gap-4">
              {section.items?.map((article, articleIndex) => (
                <NewsArticle
                  key={articleIndex}
                  article={article}
                  index={`${sectionIndex}-${articleIndex}`}
                  userId={userId}
                  newsletterId={newsletterData.id}
                  onNewsClick={handleNewsClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 공유 섹션 */}
      <div className="border-t bg-gray-50 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          이 뉴스레터가 유용했나요? 공유해보세요!
        </h3>
        <SmartShareComponent
          newsletterData={newsletterData}
          showStats={true}
          onShareSuccess={handleShareSuccess}
          onShareError={(error) => console.error('공유 실패:', error)}
        />
      </div>

      {/* 푸터 */}
      <div className="bg-gray-100 p-6 text-center text-gray-600 text-sm">
        <p className="mb-2">
          <strong>📧 NewSphere 뉴스레터</strong>
        </p>
        <p>매일 선별된 뉴스를 받아보세요. 구독 설정은 언제든 변경 가능합니다.</p>
        <div className="mt-4 space-x-4">
          <a href="/settings" className="text-blue-600 hover:underline">
            구독 설정
          </a>
          <a href="/unsubscribe" className="text-gray-500 hover:underline">
            구독 해지
          </a>
          <a href="/privacy" className="text-gray-500 hover:underline">
            개인정보처리방침
          </a>
        </div>
      </div>
    </div>
  );
}
