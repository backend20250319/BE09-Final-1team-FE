"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Settings, 
  Bell, 
  Zap, 
  Brain, 
  Target,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getUserInfo, isAuthenticated } from "@/lib/auth/auth";

// 컴포넌트 imports
import ServiceLevelNewsletterView from "./ServiceLevelNewsletterView";
import CategorySubscriptionManager from "./CategorySubscriptionManager";
import SmartRecommendations from "./SmartRecommendations";
import HybridNewsletter from "./HybridNewsletter";
import NewsletterErrorBoundary, { 
  NetworkStatusIndicator, 
  APIErrorHandler 
} from "./NewsletterErrorBoundary";

// 훅 imports
import { useServiceLevel } from "@/lib/hooks/useServiceLevel";
import { useRealtimeNewsletter, useRealtimeNotifications } from "@/lib/hooks/useRealtimeNewsletter";

/**
 * Enhanced Newsletter Dashboard - 모든 기능을 통합한 메인 컴포넌트
 */
export default function EnhancedNewsletterDashboard() {
  const [activeTab, setActiveTab] = useState("newsletter");
  const [userInfo, setUserInfo] = useState(null);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const { toast } = useToast();

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = () => {
      try {
        const info = getUserInfo();
        setUserInfo(info);
      } catch (error) {
        console.warn('사용자 정보 로드 실패:', error);
        setUserInfo(null);
      }
    };

    loadUserInfo();
  }, []);

  // 서비스 레벨 관리
  const { 
    serviceLevel, 
    serviceLevelInfo, 
    handleUpgrade,
    isAuthenticated: userIsAuthenticated 
  } = useServiceLevel(userSubscriptions);

  // 실시간 뉴스레터 업데이트
  const {
    enhancedData,
    hybridData,
    smartRecommendations,
    isLoading,
    isUpdating,
    isError,
    error,
    lastUpdate,
    updateCount,
    connectionStatus,
    connectionIcon,
    connectionMessage,
    refreshData,
    toggleAutoRefresh,
    enableAutoRefresh
  } = useRealtimeNewsletter({
    updateInterval: 5 * 60 * 1000, // 5분마다 업데이트
    enableAutoRefresh: true,
    enableNotifications: true
  });

  // 실시간 알림 관리
  const {
    notifications,
    unreadCount,
    addBreakingNewsAlert,
    addPersonalizedAlert,
    addTrendingAlert,
    markAllAsRead
  } = useRealtimeNotifications({
    enableBreakingNews: true,
    enablePersonalizedAlerts: true,
    enableTrendingAlerts: true
  });

  // 구독 변경 핸들러
  const handleSubscriptionChange = (category, isSubscribed) => {
    setUserSubscriptions(prev => {
      const existing = prev.find(sub => sub.category === category);
      if (existing) {
        return prev.map(sub => 
          sub.category === category 
            ? { ...sub, status: isSubscribed ? 'ACTIVE' : 'INACTIVE' }
            : sub
        );
      } else {
        return [...prev, {
          id: `${category}_${Date.now()}`,
          category,
          status: isSubscribed ? 'ACTIVE' : 'INACTIVE',
          createdAt: new Date().toISOString()
        }];
      }
    });

    toast({
      title: isSubscribed ? "구독 완료" : "구독 해제",
      description: `${category} 카테고리를 ${isSubscribed ? '구독' : '구독 해제'}했습니다.`,
    });
  };

  // 업그레이드 핸들러
  const handleUpgradeClick = (level) => {
    if (level === 'PUBLIC') {
      window.location.href = '/auth';
    } else if (level === 'AUTHENTICATED_BASIC') {
      setActiveTab('subscription');
      toast({
        title: "구독 관리",
        description: "관심 카테고리를 구독해보세요!",
      });
    }
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    refreshData();
    toast({
      title: "새로고침",
      description: "뉴스레터 데이터를 업데이트했습니다.",
    });
  };

  return (
    <NewsletterErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* 네트워크 상태 표시기 */}
        <NetworkStatusIndicator />

        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    Enhanced Newsletter
                  </h1>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {serviceLevel}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                {/* 연결 상태 */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{connectionIcon}</span>
                  <span>{connectionMessage}</span>
                </div>
                
                {/* 업데이트 정보 */}
                <div className="text-sm text-gray-500">
                  {lastUpdate && `마지막 업데이트: ${lastUpdate.toLocaleTimeString()}`}
                </div>
                
                {/* 새로고침 버튼 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isUpdating}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                  새로고침
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="newsletter" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                뉴스레터
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                구독 관리
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI 추천
              </TabsTrigger>
              <TabsTrigger value="hybrid" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                하이브리드
              </TabsTrigger>
            </TabsList>

            <TabsContent value="newsletter">
              <ServiceLevelNewsletterView 
                serviceLevel={serviceLevel}
                userInfo={userInfo}
                onUpgrade={handleUpgradeClick}
              />
            </TabsContent>

            <TabsContent value="subscription">
              {userIsAuthenticated ? (
                <CategorySubscriptionManager 
                  userInfo={userInfo}
                  onSubscriptionChange={handleSubscriptionChange}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    구독 관리를 사용하려면 로그인이 필요합니다
                  </h3>
                  <p className="text-gray-600 mb-4">
                    로그인하시면 관심 카테고리를 구독하고 맞춤 뉴스를 받아보실 수 있습니다.
                  </p>
                  <Button onClick={() => window.location.href = '/auth'}>
                    로그인하기
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recommendations">
              <SmartRecommendations 
                userInfo={userInfo}
                category={null}
                limit={10}
                type="auto"
              />
            </TabsContent>

            <TabsContent value="hybrid">
              <HybridNewsletter 
                userInfo={userInfo}
                category={null}
                limit={5}
                personalized={serviceLevel === 'PERSONALIZED'}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* 알림 패널 */}
        {notifications.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50">
            <Card className="w-80 shadow-xl border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    알림
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {unreadCount}
                      </Badge>
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    모두 읽음
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.read 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 에러 처리 */}
        {isError && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <APIErrorHandler 
              error={error}
              onRetry={handleRefresh}
              className="max-w-md"
            />
          </div>
        )}
      </div>
    </NewsletterErrorBoundary>
  );
}
