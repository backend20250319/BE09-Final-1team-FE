"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Clock,
  Star,
  Zap
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/**
 * 카테고리별 구독 관리 컴포넌트
 */
export default function CategorySubscriptionManager({ 
  userInfo,
  onSubscriptionChange = null 
}) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(new Set());
  const { toast } = useToast();

  // 구독 목록 로드
  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/newsletters/user-subscriptions');
      const data = await response.json();
      
      if (data.success) {
        setSubscriptions(data.data || []);
      }
    } catch (error) {
      console.error('구독 목록 로드 실패:', error);
      toast({
        title: "오류",
        description: "구독 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 구독 상태 토글
  const toggleSubscription = async (category, currentStatus) => {
    const subscriptionId = `${category}_${Date.now()}`;
    setUpdating(prev => new Set([...prev, category]));

    try {
      const response = await fetch(
        `/api/newsletter/category/${category}/subscribe`,
        {
          method: currentStatus ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            category,
            userId: userInfo?.id
          })
        }
      );

      if (response.ok) {
        const newStatus = !currentStatus;
        
        // 로컬 상태 업데이트
        setSubscriptions(prev => {
          const existing = prev.find(sub => sub.category === category);
          if (existing) {
            return prev.map(sub => 
              sub.category === category 
                ? { ...sub, status: newStatus ? 'ACTIVE' : 'INACTIVE' }
                : sub
            );
          } else {
            return [...prev, {
              id: subscriptionId,
              category,
              status: newStatus ? 'ACTIVE' : 'INACTIVE',
              createdAt: new Date().toISOString()
            }];
          }
        });

        toast({
          title: newStatus ? "구독 완료" : "구독 해제",
          description: `${category} 카테고리를 ${newStatus ? '구독' : '구독 해제'}했습니다.`,
        });

        // 부모 컴포넌트에 변경사항 알림
        if (onSubscriptionChange) {
          onSubscriptionChange(category, newStatus);
        }
      } else {
        throw new Error('구독 상태 변경 실패');
      }
    } catch (error) {
      console.error('구독 상태 변경 실패:', error);
      toast({
        title: "오류",
        description: "구독 상태를 변경하는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(category);
        return newSet;
      });
    }
  };

  // 구독 상태 확인
  const isSubscribed = (category) => {
    const subscription = subscriptions.find(sub => sub.category === category);
    return subscription?.status === 'ACTIVE';
  };

  // 카테고리별 구독자 수 (실제로는 API에서 가져와야 함)
  const getSubscriberCount = (category) => {
    const counts = {
      '정치': 1250,
      '경제': 980,
      '사회': 750,
      'IT/과학': 650,
      '세계': 420,
      '생활': 380,
      '자동차/교통': 290,
      '여행/음식': 180,
      '예술': 120
    };
    return counts[category] || 0;
  };

  if (loading) {
    return <SubscriptionLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Bell className="h-6 w-6 text-blue-500" />
          카테고리 구독 관리
        </h2>
        <p className="text-gray-600">
          관심 있는 카테고리를 구독하여 맞춤 뉴스를 받아보세요
        </p>
      </div>

      {/* 구독 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {subscriptions.filter(sub => sub.status === 'ACTIVE').length}
            </div>
            <div className="text-sm text-gray-600">구독 중인 카테고리</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {subscriptions.reduce((total, sub) => 
                total + (sub.status === 'ACTIVE' ? getSubscriberCount(sub.category) : 0), 0
              )}
            </div>
            <div className="text-sm text-gray-600">총 구독자 수</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {subscriptions.filter(sub => sub.status === 'ACTIVE').length * 5}
            </div>
            <div className="text-sm text-gray-600">예상 뉴스 수/일</div>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          '정치', '경제', '사회', 'IT/과학', '세계', 
          '생활', '자동차/교통', '여행/음식', '예술'
        ].map((category) => {
          const subscribed = isSubscribed(category);
          const subscriberCount = getSubscriberCount(category);
          const isUpdating = updating.has(category);

          return (
            <CategorySubscriptionCard
              key={category}
              category={category}
              subscribed={subscribed}
              subscriberCount={subscriberCount}
              isUpdating={isUpdating}
              onToggle={() => toggleSubscription(category, subscribed)}
            />
          );
        })}
      </div>

      {/* 구독 혜택 안내 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Star className="h-5 w-5" />
            구독 혜택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">관심 카테고리 맞춤 뉴스</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">AI 개인화 추천</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">최적 발송 시간 설정</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">읽기 기록 관리</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 카테고리 구독 카드 컴포넌트
 */
function CategorySubscriptionCard({ 
  category, 
  subscribed, 
  subscriberCount, 
  isUpdating, 
  onToggle 
}) {
  const getCategoryIcon = (category) => {
    const icons = {
      '정치': '🏛️',
      '경제': '💰',
      '사회': '👥',
      'IT/과학': '💻',
      '세계': '🌍',
      '생활': '🏠',
      '자동차/교통': '🚗',
      '여행/음식': '✈️',
      '예술': '🎨'
    };
    return icons[category] || '📰';
  };

  const getCategoryColor = (category) => {
    const colors = {
      '정치': 'blue',
      '경제': 'green',
      '사회': 'purple',
      'IT/과학': 'orange',
      '세계': 'red',
      '생활': 'pink',
      '자동차/교통': 'indigo',
      '여행/음식': 'yellow',
      '예술': 'teal'
    };
    return colors[category] || 'gray';
  };

  const color = getCategoryColor(category);

  return (
    <Card className={`transition-all duration-200 ${
      subscribed 
        ? `border-${color}-300 bg-${color}-50` 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(category)}</span>
            <CardTitle className="text-lg">{category}</CardTitle>
          </div>
          {subscribed && (
            <Badge className={`bg-${color}-100 text-${color}-700`}>
              구독중
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 구독자 수 */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>구독자 {subscriberCount.toLocaleString()}명</span>
        </div>

        {/* 구독 토글 */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`subscription-${category}`} className="text-sm font-medium">
            구독하기
          </Label>
          <Switch
            id={`subscription-${category}`}
            checked={subscribed}
            onCheckedChange={onToggle}
            disabled={isUpdating}
            className={`data-[state=checked]:bg-${color}-600`}
          />
        </div>

        {/* 업데이트 중 표시 */}
        {isUpdating && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>처리 중...</span>
          </div>
        )}

        {/* 구독 상태 표시 */}
        <div className="flex items-center gap-2 text-sm">
          {subscribed ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-700">구독 중</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">구독 안함</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 로딩 스켈레톤
 */
function SubscriptionLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
