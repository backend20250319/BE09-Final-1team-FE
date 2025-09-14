"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  Star, 
  Clock, 
  Eye,
  Zap,
  Target,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { useSmartRecommendations } from "@/lib/hooks/useNewsletter";
import { useToast } from "@/components/ui/use-toast";

/**
 * Smart Recommendations 컴포넌트
 */
export default function SmartRecommendations({ 
  category = null,
  limit = 10,
  type = 'auto',
  userInfo = null 
}) {
  const [selectedType, setSelectedType] = useState(type);
  const { toast } = useToast();

  // Smart Recommendations API 호출
  const { 
    data: recommendationsData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useSmartRecommendations({
    category,
    limit,
    type: selectedType,
    enabled: true
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "추천 새로고침",
      description: "AI가 새로운 추천을 분석하고 있습니다.",
    });
  };

  const handleTypeChange = (newType) => {
    setSelectedType(newType);
  };

  if (isLoading) {
    return <RecommendationsLoadingSkeleton />;
  }

  if (isError) {
    return <RecommendationsErrorFallback error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            🧠 AI 스마트 추천
          </h2>
          <p className="text-gray-600">
            {recommendationsData?.message || 'AI가 분석한 맞춤 추천을 제공합니다'}
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

      {/* 추천 타입 선택 */}
      <div className="flex gap-2">
        <Button
          variant={selectedType === 'trending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('trending')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          트렌딩
        </Button>
        <Button
          variant={selectedType === 'personalized' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('personalized')}
        >
          <Target className="h-4 w-4 mr-2" />
          개인화
        </Button>
        <Button
          variant={selectedType === 'auto' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('auto')}
        >
          <Zap className="h-4 w-4 mr-2" />
          자동
        </Button>
      </div>

      {/* AI 추천 정보 */}
      {recommendationsData?.aiRecommendations && (
        <AIPersonalizationInfo 
          aiRecommendations={recommendationsData.aiRecommendations}
          userInfo={userInfo}
        />
      )}

      {/* 추천 뉴스 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendationsData?.recommendations?.map((recommendation, index) => (
          <RecommendationCard 
            key={recommendation.id || index}
            recommendation={recommendation}
            rank={index + 1}
          />
        ))}
      </div>

      {/* 트렌딩 키워드 */}
      {recommendationsData?.trendingKeywords && (
        <TrendingKeywordsSection keywords={recommendationsData.trendingKeywords} />
      )}

      {/* 업그레이드 프롬프트 */}
      {recommendationsData?.upgradePrompt && (
        <UpgradePromptSection 
          upgradePrompt={recommendationsData.upgradePrompt}
          capabilities={recommendationsData.capabilities}
        />
      )}
    </div>
  );
}

/**
 * AI 개인화 정보 컴포넌트
 */
function AIPersonalizationInfo({ aiRecommendations, userInfo }) {
  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Brain className="h-5 w-5" />
          AI 개인화 분석
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            {aiRecommendations.message}
          </h3>
        </div>

        {/* 개인화 인사이트 */}
        {aiRecommendations.insights && (
          <div>
            <h4 className="font-medium text-purple-800 mb-2">분석 결과</h4>
            <div className="space-y-2">
              {aiRecommendations.insights.map((insight, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-purple-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 추천 카테고리 */}
        {aiRecommendations.suggestedCategories && (
          <div>
            <h4 className="font-medium text-purple-800 mb-2">추천 카테고리</h4>
            <div className="flex flex-wrap gap-2">
              {aiRecommendations.suggestedCategories.map((category, index) => (
                <Badge key={index} variant="outline" className="border-purple-300 text-purple-700">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 읽기 패턴 */}
        {aiRecommendations.readingPattern && (
          <div>
            <h4 className="font-medium text-purple-800 mb-2">읽기 패턴</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-purple-700">
                  선호 시간: {aiRecommendations.readingPattern.preferredTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="text-purple-700">
                  평균 읽기 시간: {aiRecommendations.readingPattern.averageReadTime}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 추천 카드 컴포넌트
 */
function RecommendationCard({ recommendation, rank }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <Star className="h-4 w-4" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4" />;
    return <BarChart3 className="h-4 w-4" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              #{rank}
            </Badge>
            {recommendation.personalized && (
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                AI 추천
              </Badge>
            )}
            {recommendation.trending && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                트렌딩
              </Badge>
            )}
            {recommendation.hot && (
              <Badge variant="destructive" className="text-xs">
                🔥 핫
              </Badge>
            )}
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(recommendation.score)}`}>
            {getScoreIcon(recommendation.score)}
            <span>{recommendation.score}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="font-medium text-sm mb-2 line-clamp-2">
          {recommendation.title}
        </h4>
        <p className="text-xs text-gray-600 mb-3 line-clamp-3">
          {recommendation.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>{recommendation.source}</span>
            <span>•</span>
            <span>{recommendation.category}</span>
          </div>
          <span>{new Date(recommendation.publishedAt).toLocaleDateString()}</span>
        </div>

        {/* 추천 이유 */}
        {recommendation.tags && (
          <div className="mt-3 flex flex-wrap gap-1">
            {recommendation.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 트렌딩 키워드 섹션
 */
function TrendingKeywordsSection({ keywords }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          🔥 트렌딩 키워드
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {keywords.map((keyword, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{keyword.keyword}</span>
                {keyword.personalized && (
                  <Badge variant="outline" className="text-xs">개인화</Badge>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {keyword.count}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 업그레이드 프롬프트 섹션
 */
function UpgradePromptSection({ upgradePrompt, capabilities }) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          {upgradePrompt}
        </h3>
        <p className="text-blue-700 mb-4">
          더 정확한 AI 추천과 개인화된 뉴스를 받아보세요!
        </p>
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
function RecommendationsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-8 bg-gray-200 rounded w-20"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
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
function RecommendationsErrorFallback({ error, onRetry }) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          ⚠️ AI 추천을 불러올 수 없습니다
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
