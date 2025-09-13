"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Star, 
  TrendingUp, 
  User, 
  Lock, 
  Unlock,
  Zap,
  Brain,
  Crown
} from "lucide-react";
import { SERVICE_LEVELS } from "@/lib/utils/serviceLevels";
import { useEnhancedNewsletterData } from "@/lib/hooks/useNewsletter";

/**
 * 서비스 레벨별 차별화된 뉴스레터 뷰 컴포넌트
 */
export default function ServiceLevelNewsletterView({ 
  serviceLevel, 
  userInfo = null,
  onUpgrade = null 
}) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  
  // Enhanced API 데이터 조회
  const { data: enhancedData, isLoading, error } = useEnhancedNewsletterData({
    headlinesPerCategory: 5,
    trendingKeywordsLimit: 8,
    category: selectedCategory === "전체" ? null : selectedCategory,
    enabled: true
  });

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade(serviceLevel);
    } else {
      // 기본 업그레이드 동작
      if (serviceLevel === SERVICE_LEVELS.PUBLIC) {
        window.location.href = '/auth';
      } else if (serviceLevel === SERVICE_LEVELS.AUTHENTICATED_BASIC) {
        // 구독 모달 열기
        console.log('구독 기능 활성화');
      }
    }
  };

  if (isLoading) {
    return <NewsletterLoadingSkeleton />;
  }

  if (error) {
    return <NewsletterErrorFallback error={error} />;
  }

  // 서비스 레벨별 렌더링
  switch (serviceLevel) {
    case SERVICE_LEVELS.PUBLIC:
      return <PublicNewsletterView data={enhancedData} onUpgrade={handleUpgrade} />;
    case SERVICE_LEVELS.AUTHENTICATED_BASIC:
      return <AuthenticatedNewsletterView data={enhancedData} userInfo={userInfo} onUpgrade={handleUpgrade} />;
    case SERVICE_LEVELS.PERSONALIZED:
      return <PersonalizedNewsletterView data={enhancedData} userInfo={userInfo} />;
    default:
      return <PublicNewsletterView data={enhancedData} onUpgrade={handleUpgrade} />;
  }
}

/**
 * 공개 사용자 뷰 (PUBLIC)
 */
function PublicNewsletterView({ data, onUpgrade }) {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Mail className="h-6 w-6 text-blue-500" />
          📰 오늘의 뉴스
        </h2>
        <p className="text-gray-600">최신 뉴스를 확인해보세요</p>
      </div>

      {/* 기본 뉴스 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.categories && Object.entries(data.categories).map(([category, categoryData]) => (
          <CategorySection 
            key={category} 
            category={category} 
            data={categoryData}
            showSubscription={false}
          />
        ))}
      </div>

      {/* 로그인 유도 메시지 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🔐 더 많은 기능을 원하시나요?
          </h3>
          <p className="text-blue-700 mb-4">
            로그인하면 개인화된 뉴스와 구독 관리 기능을 이용할 수 있습니다!
          </p>
          <Button onClick={onUpgrade} className="bg-blue-600 hover:bg-blue-700">
            <Unlock className="w-4 h-4 mr-2" />
            로그인하기
          </Button>
        </CardContent>
      </Card>

      {/* 트렌딩 키워드 */}
      {data?.trendingKeywords && (
        <TrendingKeywords keywords={data.trendingKeywords} />
      )}
    </div>
  );
}

/**
 * 로그인 사용자 뷰 (AUTHENTICATED_BASIC)
 */
function AuthenticatedNewsletterView({ data, userInfo, onUpgrade }) {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <User className="h-6 w-6 text-green-500" />
          📰 {userInfo?.name || '사용자'}님의 뉴스레터
        </h2>
        <p className="text-gray-600">확장된 뉴스와 구독 관리 기능을 제공합니다</p>
      </div>

      {/* 확장된 뉴스 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.categories && Object.entries(data.categories).map(([category, categoryData]) => (
          <CategorySection 
            key={category} 
            category={category} 
            data={categoryData}
            showSubscription={true}
            userInfo={userInfo}
          />
        ))}
      </div>

      {/* 구독 유도 메시지 */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            ⭐ 프리미엄 구독으로 더 많은 혜택을!
          </h3>
          <p className="text-green-700 mb-4">
            AI 추천 뉴스, 무제한 구독, 우선 알림 등 다양한 혜택을 누려보세요!
          </p>
          <Button onClick={onUpgrade} className="bg-green-600 hover:bg-green-700">
            <Crown className="w-4 h-4 mr-2" />
            구독하기
          </Button>
        </CardContent>
      </Card>

      {/* 트렌딩 키워드 */}
      {data?.trendingKeywords && (
        <TrendingKeywords keywords={data.trendingKeywords} />
      )}
    </div>
  );
}

/**
 * 구독자 뷰 (PERSONALIZED)
 */
function PersonalizedNewsletterView({ data, userInfo }) {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Brain className="h-6 w-6 text-purple-500" />
          🎯 {userInfo?.name || '사용자'}님의 맞춤 뉴스레터
        </h2>
        <p className="text-gray-600">AI가 분석한 개인화된 뉴스를 제공합니다</p>
      </div>

      {/* AI 추천 뉴스 */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Zap className="h-5 w-5" />
            🤖 AI가 추천하는 오늘의 뉴스
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SmartRecommendations />
        </CardContent>
      </Card>

      {/* 개인화된 카테고리 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.categories && Object.entries(data.categories).map(([category, categoryData]) => (
          <PersonalizedCategorySection 
            key={category} 
            category={category} 
            data={categoryData}
            userInfo={userInfo}
          />
        ))}
      </div>

      {/* 트렌딩 키워드 */}
      {data?.trendingKeywords && (
        <TrendingKeywords keywords={data.trendingKeywords} />
      )}
    </div>
  );
}

/**
 * 카테고리 섹션 컴포넌트
 */
function CategorySection({ category, data, showSubscription = false, userInfo = null }) {
  const [isSubscribed, setIsSubscribed] = useState(data?.isSubscribed || false);

  const toggleSubscription = async () => {
    try {
      const response = await fetch(
        `/api/newsletter/category/${category}/subscribe`,
        {
          method: isSubscribed ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        setIsSubscribed(!isSubscribed);
      }
    } catch (error) {
      console.error('구독 상태 변경 실패:', error);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{category}</CardTitle>
          {showSubscription && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                구독자 {data?.subscriberCount || 0}명
              </span>
              <Button
                size="sm"
                variant={isSubscribed ? "default" : "outline"}
                onClick={toggleSubscription}
              >
                {isSubscribed ? '구독중' : '구독하기'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data?.articles?.slice(0, 5).map((article, index) => (
            <NewsItem key={index} article={article} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 개인화된 카테고리 섹션
 */
function PersonalizedCategorySection({ category, data, userInfo }) {
  return (
    <Card className="border-purple-200 bg-purple-50/30 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-purple-900">{category}</CardTitle>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            맞춤형
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data?.articles?.slice(0, 7).map((article, index) => (
            <PersonalizedNewsItem key={index} article={article} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 뉴스 아이템 컴포넌트
 */
function NewsItem({ article }) {
  return (
    <div className="p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
      <h4 className="font-medium text-sm mb-1 line-clamp-2">{article.title}</h4>
      <p className="text-xs text-gray-600 line-clamp-2">{article.summary}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">{article.source}</span>
        <span className="text-xs text-gray-500">{article.publishedAt}</span>
      </div>
    </div>
  );
}

/**
 * 개인화된 뉴스 아이템
 */
function PersonalizedNewsItem({ article }) {
  return (
    <div className="p-3 bg-white rounded-lg border border-purple-200 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-2">
        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
        <div className="flex-1">
          <h4 className="font-medium text-sm mb-1 line-clamp-2">{article.title}</h4>
          <p className="text-xs text-gray-600 line-clamp-2">{article.summary}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">{article.source}</span>
            <span className="text-xs text-purple-600">AI 추천</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 트렌딩 키워드 컴포넌트
 */
function TrendingKeywords({ keywords }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          🔥 트렌딩 키워드
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {keywords?.map((keyword, index) => (
            <Badge key={index} variant="outline" className="hover:bg-gray-100">
              {keyword.keyword}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * AI 추천 컴포넌트
 */
function SmartRecommendations() {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Brain className="h-8 w-8 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-purple-900 mb-2">
        AI가 뉴스를 분석 중입니다...
      </h3>
      <p className="text-purple-700">
        당신의 관심사와 읽기 패턴을 분석하여 맞춤 뉴스를 준비하고 있습니다.
      </p>
    </div>
  );
}

/**
 * 로딩 스켈레톤
 */
function NewsletterLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 bg-gray-100 rounded">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * 에러 폴백 컴포넌트
 */
function NewsletterErrorFallback({ error }) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          ⚠️ 뉴스레터를 불러올 수 없습니다
        </h3>
        <p className="text-red-700 mb-4">
          {error?.message || '잠시 후 다시 시도해주세요.'}
        </p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          새로고침
        </Button>
      </CardContent>
    </Card>
  );
}
