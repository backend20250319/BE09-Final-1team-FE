"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  SERVICE_LEVELS, 
  getServiceLevelIcon, 
  getServiceLevelColor,
  getServiceLevelFeatures,
  getSubscriptionBenefits,
  getAIRecommendations
} from "@/lib/utils/serviceLevels";
import { useEnhancedNewsletterData, useHybridNewsletterData, useSmartRecommendations } from "@/lib/hooks/useNewsletter";
import ServiceLevelUpgradePrompt, { ServiceLevelBadge, ServiceLevelComparison } from "./ServiceLevelUpgradePrompt";
import ServiceLevelIndicator, { SimpleServiceLevelBadge } from "./ServiceLevelIndicator";

/**
 * 서비스 레벨 기능 데모 컴포넌트
 */
export default function ServiceLevelDemo() {
  const [currentServiceLevel, setCurrentServiceLevel] = useState(SERVICE_LEVELS.PUBLIC);
  const [selectedCategory, setSelectedCategory] = useState("정치");

  // Enhanced API 데이터 조회
  const enhancedData = useEnhancedNewsletterData({
    headlinesPerCategory: 5,
    trendingKeywordsLimit: 8,
    category: selectedCategory,
    enabled: true
  });

  // Hybrid API 데이터 조회
  const hybridData = useHybridNewsletterData({
    category: selectedCategory,
    limit: 5,
    personalized: currentServiceLevel === SERVICE_LEVELS.PERSONALIZED,
    enabled: true
  });

  // Smart Recommendations 데이터 조회
  const smartRecommendations = useSmartRecommendations({
    category: selectedCategory,
    limit: 10,
    type: currentServiceLevel === SERVICE_LEVELS.PERSONALIZED ? 'personalized' : 'trending',
    enabled: true
  });

  const handleServiceLevelChange = (level) => {
    setCurrentServiceLevel(level);
  };

  const handleUpgrade = (level) => {
    console.log(`업그레이드 요청: ${level}`);
    // 실제 구현에서는 로그인 페이지로 이동하거나 구독 모달을 열어야 함
  };

  const getServiceLevelInfo = (level) => {
    const features = getServiceLevelFeatures(level);
    const benefits = getSubscriptionBenefits(level);
    const aiRecommendations = getAIRecommendations(level);
    
    return {
      features,
      benefits,
      aiRecommendations,
      icon: getServiceLevelIcon(level),
      color: getServiceLevelColor(level)
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 서비스 레벨별 차별화된 뉴스레터 서비스 데모
        </h1>
        <p className="text-gray-600">
          로그인 상태와 구독 여부에 따라 다른 수준의 서비스를 제공합니다.
        </p>
      </div>

      {/* 서비스 레벨 선택 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>서비스 레벨 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            {Object.values(SERVICE_LEVELS).map((level) => (
              <Button
                key={level}
                variant={currentServiceLevel === level ? "default" : "outline"}
                onClick={() => handleServiceLevelChange(level)}
                className="flex items-center gap-2"
              >
                <span>{getServiceLevelIcon(level)}</span>
                {level}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">현재 선택된 레벨:</span>
            <SimpleServiceLevelBadge serviceLevel={currentServiceLevel} />
          </div>
        </CardContent>
      </Card>

      {/* 서비스 레벨 표시기 */}
      <div className="mb-8">
        <ServiceLevelIndicator 
          serviceLevel={currentServiceLevel}
          onUpgrade={handleUpgrade}
        />
      </div>

      {/* 업그레이드 프롬프트 */}
      <div className="mb-8">
        <ServiceLevelUpgradePrompt 
          serviceLevel={currentServiceLevel}
          onUpgrade={handleUpgrade}
        />
      </div>

      {/* API 데이터 표시 */}
      <Tabs defaultValue="enhanced" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enhanced">Enhanced API</TabsTrigger>
          <TabsTrigger value="hybrid">Hybrid API</TabsTrigger>
          <TabsTrigger value="smart">Smart Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enhanced">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced API 데이터</CardTitle>
            </CardHeader>
            <CardContent>
              {enhancedData.isLoading ? (
                <div className="text-center py-4">로딩 중...</div>
              ) : enhancedData.isError ? (
                <div className="text-center py-4 text-red-500">에러: {enhancedData.error?.message}</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">서비스 레벨</h4>
                      <Badge variant="outline">{enhancedData.data?.serviceLevel}</Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">인증 상태</h4>
                      <Badge variant="outline">
                        {enhancedData.data?.userAuthenticated ? "인증됨" : "미인증"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">메시지</h4>
                    <p className="text-sm text-gray-600">{enhancedData.data?.message}</p>
                  </div>
                  
                  {enhancedData.data?.upgradePrompt && (
                    <div>
                      <h4 className="font-medium mb-2">업그레이드 프롬프트</h4>
                      <p className="text-sm text-blue-600">{enhancedData.data.upgradePrompt}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium mb-2">카테고리 데이터</h4>
                    <div className="text-sm text-gray-600">
                      {Object.keys(enhancedData.data?.categories || {}).length}개 카테고리
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hybrid">
          <Card>
            <CardHeader>
              <CardTitle>Hybrid API 데이터</CardTitle>
            </CardHeader>
            <CardContent>
              {hybridData.isLoading ? (
                <div className="text-center py-4">로딩 중...</div>
              ) : hybridData.isError ? (
                <div className="text-center py-4 text-red-500">에러: {hybridData.error?.message}</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">개인화 여부</h4>
                      <Badge variant="outline">
                        {hybridData.data?.personalized ? "개인화됨" : "일반"}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">뉴스레터 수</h4>
                      <Badge variant="outline">{hybridData.data?.newsletters?.length || 0}개</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">메시지</h4>
                    <p className="text-sm text-gray-600">{hybridData.data?.message}</p>
                  </div>
                  
                  {hybridData.data?.upgradePrompt && (
                    <div>
                      <h4 className="font-medium mb-2">업그레이드 프롬프트</h4>
                      <p className="text-sm text-blue-600">{hybridData.data.upgradePrompt}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="smart">
          <Card>
            <CardHeader>
              <CardTitle>Smart Recommendations 데이터</CardTitle>
            </CardHeader>
            <CardContent>
              {smartRecommendations.isLoading ? (
                <div className="text-center py-4">로딩 중...</div>
              ) : smartRecommendations.isError ? (
                <div className="text-center py-4 text-red-500">에러: {smartRecommendations.error?.message}</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">추천 타입</h4>
                      <Badge variant="outline">{smartRecommendations.data?.recommendationType}</Badge>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">추천 수</h4>
                      <Badge variant="outline">{smartRecommendations.data?.recommendations?.length || 0}개</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">메시지</h4>
                    <p className="text-sm text-gray-600">{smartRecommendations.data?.message}</p>
                  </div>
                  
                  {smartRecommendations.data?.aiRecommendations && (
                    <div>
                      <h4 className="font-medium mb-2">AI 추천</h4>
                      <p className="text-sm text-purple-600">{smartRecommendations.data.aiRecommendations.message}</p>
                    </div>
                  )}
                  
                  {smartRecommendations.data?.upgradePrompt && (
                    <div>
                      <h4 className="font-medium mb-2">업그레이드 프롬프트</h4>
                      <p className="text-sm text-blue-600">{smartRecommendations.data.upgradePrompt}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 서비스 레벨 비교 */}
      <div className="mb-8">
        <ServiceLevelComparison currentLevel={currentServiceLevel} />
      </div>

      {/* 사용법 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle>📖 사용법 가이드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Enhanced API</h4>
            <p className="text-sm text-gray-600">
              로그인 상태에 따라 자동으로 차별화된 뉴스레터 데이터를 제공합니다.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">2. Hybrid API</h4>
            <p className="text-sm text-gray-600">
              토큰 유무에 따라 개인화된 뉴스레터와 일반 뉴스레터를 자동 전환합니다.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">3. Smart Recommendations</h4>
            <p className="text-sm text-gray-600">
              로그인 사용자에게는 개인화 추천, 비로그인 사용자에게는 트렌딩 추천을 제공합니다.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">4. 점진적 업그레이드</h4>
            <p className="text-sm text-gray-600">
              각 서비스 레벨에서 자연스럽게 다음 레벨로 업그레이드할 수 있도록 유도합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
