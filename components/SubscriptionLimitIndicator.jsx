"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Bell, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Crown,
  Zap
} from "lucide-react";
import { newsletterService } from "@/lib/api/newsletterService";

/**
 * 구독 제한 표시 컴포넌트
 * - 현재 구독 수와 최대 구독 가능 수를 표시
 * - 구독 제한에 도달했을 때 업그레이드 안내
 */
export default function SubscriptionLimitIndicator({ 
  className = "",
  showUpgradePrompt = true 
}) {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const MAX_SUBSCRIPTIONS = 3; // 최대 구독 가능 수

  useEffect(() => {
    loadSubscriptionInfo();
  }, []);

  const loadSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const info = await newsletterService.getUserSubscriptionInfo();
      setSubscriptionInfo(info);
      console.log("✅ 구독 제한 정보 로드 완료:", info);
    } catch (error) {
      console.error("구독 제한 정보 로드 실패:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscriptionInfo = async () => {
    await loadSubscriptionInfo();
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-500">구독 정보 로딩 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center text-red-500">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm">구독 정보를 불러올 수 없습니다</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshSubscriptionInfo}
              className="mt-2"
            >
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentCount = subscriptionInfo?.count || 0;
  const remainingCount = MAX_SUBSCRIPTIONS - currentCount;
  const progressPercentage = (currentCount / MAX_SUBSCRIPTIONS) * 100;
  const isNearLimit = currentCount >= MAX_SUBSCRIPTIONS - 1;
  const isAtLimit = currentCount >= MAX_SUBSCRIPTIONS;

  return (
    <Card className={`${className} ${isAtLimit ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-500" />
            구독 현황
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshSubscriptionInfo}
            className="h-6 w-6 p-0"
          >
            <Zap className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 구독 개수 표시 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">현재 구독</span>
          <Badge 
            variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "default"}
            className="text-sm"
          >
            {currentCount}/{MAX_SUBSCRIPTIONS}개
          </Badge>
        </div>

        {/* 진행률 표시 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>구독 진행률</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
            // 색상 변경을 위한 클래스
            style={{
              '--progress-background': isAtLimit ? '#ef4444' : isNearLimit ? '#f59e0b' : '#3b82f6'
            }}
          />
        </div>

        {/* 상태 메시지 */}
        <div className="space-y-2">
          {isAtLimit ? (
            <div className="flex items-center text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>구독 한도에 도달했습니다</span>
            </div>
          ) : isNearLimit ? (
            <div className="flex items-center text-yellow-600 text-sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>구독 한도에 거의 도달했습니다 ({remainingCount}개 남음)</span>
            </div>
          ) : (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>{remainingCount}개 더 구독할 수 있습니다</span>
            </div>
          )}
        </div>

        {/* 구독 중인 카테고리 목록 */}
        {subscriptionInfo?.subscriptions && subscriptionInfo.subscriptions.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-600">구독 중인 카테고리:</span>
            <div className="flex flex-wrap gap-1">
              {subscriptionInfo.subscriptions.map((subscription, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs px-2 py-1"
                >
                  {subscription.categoryNameKo || subscription.category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 업그레이드 안내 */}
        {showUpgradePrompt && isAtLimit && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                <span>더 많은 구독이 필요하신가요?</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => {
                  // 업그레이드 페이지로 이동하거나 모달 열기
                  console.log("업그레이드 페이지로 이동");
                }}
              >
                업그레이드
              </Button>
            </div>
          </div>
        )}

        {/* 구독자 통계 */}
        {subscriptionInfo?.subscriptions && subscriptionInfo.subscriptions.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span>총 구독자 수</span>
              </div>
              <span>
                {subscriptionInfo.subscriptions.reduce((total, sub) => 
                  total + (sub.subscriberCount || 0), 0
                ).toLocaleString()}명
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
