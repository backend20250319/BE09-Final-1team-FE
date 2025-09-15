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
import { newsletterService } from "@/lib/api/newsletterService";

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

  // 구독 상태 확인 헬퍼 함수
  const isCategorySubscribed = (category) => {
    return subscriptions.some(sub => 
      (sub.categoryNameKo === category || sub.category === category) && 
      sub.isActive === true
    );
  };

  // 구독 목록 로드
  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      
      // 먼저 로컬 상태를 로드하여 기본값 설정
      let subs = [];
      try {
        const local = JSON.parse(localStorage.getItem('localSubscriptions') || '{}');
        if (local && typeof local === 'object') {
          const categories = [
            '정치','경제','사회','IT/과학','세계','생활','자동차/교통','여행/음식','예술'
          ];
          categories.forEach(cat => {
            if (cat in local) {
              subs.push({ 
                id: `local-${cat}`, 
                category: cat, 
                categoryNameKo: cat,
                isActive: !!local[cat], 
                status: local[cat] ? 'ACTIVE' : 'INACTIVE' 
              });
            }
          });
        }
      } catch (e) {
        console.warn('로컬 구독 상태 로드 실패:', e);
      }

      // 서버에서 구독 정보 가져오기 시도
      try {
        const subscriptionInfo = await newsletterService.getUserSubscriptionInfo();
        
        if (subscriptionInfo && subscriptionInfo.subscriptions) {
          console.log('✅ 서버 구독 목록 로드 완료:', subscriptionInfo.subscriptions);
          
          // 서버 데이터로 로컬 데이터 덮어쓰기 (서버가 우선)
          const serverSubs = subscriptionInfo.subscriptions;
          const mergedSubs = [];
          
          // 모든 카테고리에 대해 서버 데이터 우선, 없으면 로컬 데이터 사용
          const categories = [
            '정치','경제','사회','IT/과학','세계','생활','자동차/교통','여행/음식','예술'
          ];
          
          categories.forEach(cat => {
            const serverSub = serverSubs.find(s => (s.categoryNameKo === cat || s.category === cat));
            if (serverSub) {
              mergedSubs.push({
                ...serverSub,
                category: cat,
                categoryNameKo: cat,
                isActive: serverSub.isActive || serverSub.status === 'ACTIVE'
              });
            } else {
              // 서버에 없으면 로컬 데이터 사용
              const localSub = subs.find(s => s.category === cat);
              if (localSub) {
                mergedSubs.push(localSub);
              }
            }
          });
          
          subs = mergedSubs;
        }
      } catch (error) {
        console.warn('서버 구독 목록 로드 실패, 로컬 상태 유지:', error);
        // 서버 로드 실패 시 로컬 상태만 사용 (이미 subs에 로컬 데이터가 있음)
      }

      setSubscriptions(subs);
      console.log('📋 최종 구독 목록:', subs);
    } catch (error) {
      console.error('구독 목록 로드 실패:', error);
      toast({
        title: "오류",
        description: "구독 목록을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // 구독 상태 토글
  const toggleSubscription = async (category, currentStatus) => {
    setUpdating(prev => new Set([...prev, category]));

    // Optimistic update for instant UI feedback
    const prevSubs = subscriptions;
    const nextStatus = !currentStatus;
    setSubscriptions(prev => {
      const idx = prev.findIndex(sub => (sub.categoryNameKo === category || sub.category === category));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], isActive: nextStatus, status: nextStatus ? 'ACTIVE' : 'INACTIVE' };
        return copy;
      }
      return [...prev, { id: `local-${category}`, category, isActive: nextStatus, status: nextStatus ? 'ACTIVE' : 'INACTIVE' }];
    });

    try {
      const result = await newsletterService.toggleSubscription(category, nextStatus);
      
      // fallback 응답인 경우 로컬 상태만 유지
      if (result?.fallback) {
        console.log('🔄 Fallback 모드 - 로컬 상태 유지');
        toast({
          title: nextStatus ? "구독 완료" : "구독 해제",
          description: `${category} 카테고리를 ${nextStatus ? '구독' : '구독 해제'}했습니다. (로컬 처리)`,
        });
        if (onSubscriptionChange) onSubscriptionChange(category, nextStatus);
        return; // 서버 동기화 시도하지 않음
      }
      
      if (!result?.success) throw new Error('구독 상태 변경 실패');

      // 성공한 경우에만 서버에서 최신 상태 동기화
      try {
        await loadSubscriptions();
      } catch (syncError) {
        console.warn('서버 동기화 실패, 로컬 상태 유지:', syncError);
        // 동기화 실패해도 UI는 이미 업데이트되었으므로 그대로 유지
      }

      toast({
        title: nextStatus ? "구독 완료" : "구독 해제",
        description: `${category} 카테고리를 ${nextStatus ? '구독' : '구독 해제'}했습니다.`,
      });

      if (onSubscriptionChange) onSubscriptionChange(category, nextStatus);
    } catch (error) {
      console.error('구독 상태 변경 실패:', error);
      
      // 네트워크 오류나 백엔드 연결 실패인 경우 로컬 상태 유지
      if (error.message.includes('백엔드 서비스') || 
          error.message.includes('ECONNREFUSED') || 
          error.message.includes('ENOTFOUND') ||
          error.message.includes('fetch')) {
        console.log('🔄 네트워크 오류 - 로컬 상태 유지');
        toast({
          title: nextStatus ? "구독 완료" : "구독 해제",
          description: `${category} 카테고리를 ${nextStatus ? '구독' : '구독 해제'}했습니다. (로컬 처리)`,
        });
        if (onSubscriptionChange) onSubscriptionChange(category, nextStatus);
        return; // rollback하지 않음
      }
      
      // 기타 오류인 경우에만 rollback
      setSubscriptions(prevSubs);
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
              {subscriptions.filter(sub => sub.isActive === true).length}
            </div>
            <div className="text-sm text-gray-600">구독 중인 카테고리</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {subscriptions.reduce((total, sub) => 
                total + (sub.isActive === true ? (sub.subscriberCount || getSubscriberCount(sub.categoryNameKo || sub.category)) : 0), 0
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
          const subscribed = isCategorySubscribed(category);
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
