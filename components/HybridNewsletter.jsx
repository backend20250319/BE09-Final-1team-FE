"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  Users,
  Star,
  Eye,
  ArrowRight
} from "lucide-react";
import { useHybridNewsletterData } from "@/lib/hooks/useNewsletter";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hybrid Newsletter 컴포넌트
 */
export default function HybridNewsletter({ 
  category = null,
  limit = 5,
  personalized = false,
  userInfo = null 
}) {
  const [selectedTab, setSelectedTab] = useState('realtime');
  const { toast } = useToast();

  // Hybrid API 데이터 조회
  const { 
    data: hybridData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useHybridNewsletterData({
    category,
    limit,
    personalized,
    enabled: true
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "하이브리드 뉴스 새로고침",
      description: "최신 뉴스를 불러오고 있습니다.",
    });
  };

  if (isLoading) {
    return <HybridLoadingSkeleton />;
  }

  if (isError) {
    return <HybridErrorFallback error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-500" />
            🔄 하이브리드 뉴스레터
          </h2>
          <p className="text-gray-600">
            {hybridData?.message || '실시간 뉴스와 개인화 추천을 제공합니다'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 서비스 상태 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {hybridData?.newsletters?.length || 0}
            </div>
            <div className="text-sm text-gray-600">뉴스레터 수</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {hybridData?.personalized ? '개인화' : '일반'}
            </div>
            <div className="text-sm text-gray-600">서비스 모드</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {hybridData?.userAuthenticated ? '인증됨' : '미인증'}
            </div>
            <div className="text-sm text-gray-600">사용자 상태</div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 인터페이스 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            실시간 뉴스
          </TabsTrigger>
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            개인화 추천
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            트렌딩
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realtime">
          <RealtimeNewsSection 
            newsletters={hybridData?.newsletters || []}
            userAuthenticated={hybridData?.userAuthenticated}
          />
        </TabsContent>

        <TabsContent value="personalized">
          <PersonalizedRecommendationsSection 
            newsletters={hybridData?.newsletters || []}
            personalized={hybridData?.personalized}
            userInfo={userInfo}
          />
        </TabsContent>

        <TabsContent value="trending">
          <TrendingSection 
            newsletters={hybridData?.newsletters || []}
            capabilities={hybridData?.capabilities}
          />
        </TabsContent>
      </Tabs>

      {/* 업그레이드 프롬프트 */}
      {hybridData?.upgradePrompt && (
        <UpgradePromptCard 
          upgradePrompt={hybridData.upgradePrompt}
          capabilities={hybridData.capabilities}
        />
      )}
    </div>
  );
}

/**
 * 실시간 뉴스 섹션
 */
function RealtimeNewsSection({ newsletters, userAuthenticated }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">⚡ 실시간 뉴스</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {userAuthenticated ? '인증됨' : '공개'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {newsletters.map((newsletter, index) => (
          <RealtimeNewsCard 
            key={newsletter.id || index}
            newsletter={newsletter}
            isAuthenticated={userAuthenticated}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 개인화 추천 섹션
 */
function PersonalizedRecommendationsSection({ newsletters, personalized, userInfo }) {
  if (!personalized) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          개인화 추천을 사용하려면 로그인이 필요합니다
        </h3>
        <p className="text-gray-600 mb-4">
          로그인하시면 AI가 분석한 맞춤 뉴스를 받아보실 수 있습니다.
        </p>
        <Button onClick={() => window.location.href = '/auth'}>
          로그인하기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-semibold">🎯 개인화 추천</h3>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          {userInfo?.name || '사용자'}님 맞춤
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {newsletters
          .filter(newsletter => newsletter.personalized)
          .map((newsletter, index) => (
            <PersonalizedNewsCard 
              key={newsletter.id || index}
              newsletter={newsletter}
              userInfo={userInfo}
            />
          ))}
      </div>
    </div>
  );
}

/**
 * 트렌딩 섹션
 */
function TrendingSection({ newsletters, capabilities }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-semibold">🔥 트렌딩 뉴스</h3>
        <Badge variant="outline" className="bg-orange-50 text-orange-700">
          {capabilities?.level || 'PUBLIC'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {newsletters
          .filter(newsletter => newsletter.trending)
          .map((newsletter, index) => (
            <TrendingNewsCard 
              key={newsletter.id || index}
              newsletter={newsletter}
            />
          ))}
      </div>
    </div>
  );
}

/**
 * 실시간 뉴스 카드
 */
function RealtimeNewsCard({ newsletter, isAuthenticated }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{newsletter.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              실시간
            </Badge>
            {isAuthenticated && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                인증됨
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{newsletter.description}</p>
        
        <div className="space-y-3">
          {newsletter.articles?.slice(0, 3).map((article, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">{article.title}</h4>
              <p className="text-xs text-gray-600 line-clamp-2">{article.summary}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{article.source}</span>
                <span className="text-xs text-gray-500">{article.publishedAt}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>구독자 {newsletter.subscribers}명</span>
          </div>
          <Button size="sm" variant="outline">
            <ArrowRight className="h-4 w-4 mr-1" />
            자세히 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 개인화 뉴스 카드
 */
function PersonalizedNewsCard({ newsletter, userInfo }) {
  return (
    <Card className="border-purple-200 bg-purple-50/30 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-purple-900">{newsletter.title}</CardTitle>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            AI 추천
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-purple-700 mb-4">{newsletter.description}</p>
        
        <div className="space-y-3">
          {newsletter.articles?.slice(0, 3).map((article, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{article.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">{article.summary}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{article.source}</span>
                    <span className="text-xs text-purple-600">맞춤형</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <Target className="h-4 w-4" />
            <span>{userInfo?.name || '사용자'}님 맞춤</span>
          </div>
          <Button size="sm" variant="outline" className="border-purple-300 text-purple-700">
            <ArrowRight className="h-4 w-4 mr-1" />
            자세히 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 트렌딩 뉴스 카드
 */
function TrendingNewsCard({ newsletter }) {
  return (
    <Card className="border-orange-200 bg-orange-50/30 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-orange-900">{newsletter.title}</CardTitle>
          <Badge variant="destructive" className="bg-orange-100 text-orange-700">
            🔥 핫
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-700 mb-4">{newsletter.description}</p>
        
        <div className="space-y-3">
          {newsletter.articles?.slice(0, 3).map((article, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-orange-200">
              <h4 className="font-medium text-sm mb-1">{article.title}</h4>
              <p className="text-xs text-gray-600 line-clamp-2">{article.summary}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{article.source}</span>
                <span className="text-xs text-orange-600">트렌딩</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <TrendingUp className="h-4 w-4" />
            <span>인기 급상승</span>
          </div>
          <Button size="sm" variant="outline" className="border-orange-300 text-orange-700">
            <ArrowRight className="h-4 w-4 mr-1" />
            자세히 보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 업그레이드 프롬프트 카드
 */
function UpgradePromptCard({ upgradePrompt, capabilities }) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          {upgradePrompt}
        </h3>
        <p className="text-blue-700 mb-4">
          더 많은 기능과 개인화된 뉴스를 받아보세요!
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {capabilities?.features?.map((feature, index) => (
            <Badge key={index} variant="outline" className="border-blue-300 text-blue-700">
              {feature}
            </Badge>
          ))}
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Star className="w-4 h-4 mr-2" />
          업그레이드하기
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * 로딩 스켈레톤
 */
function HybridLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4 text-center">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
function HybridErrorFallback({ error, onRetry }) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          ⚠️ 하이브리드 뉴스를 불러올 수 없습니다
        </h3>
        <p className="text-red-700 mb-4">
          {error?.message || '잠시 후 다시 시도해주세요.'}
        </p>
        <Button 
          onClick={onRetry}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          다시 시도
        </Button>
      </CardContent>
    </Card>
  );
}
