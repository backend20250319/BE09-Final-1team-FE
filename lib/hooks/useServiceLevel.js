import { useState, useEffect, useMemo } from 'react';
import { getUserInfo, isAuthenticated } from '@/lib/auth/auth';
import { 
  SERVICE_LEVELS, 
  determineServiceLevel,
  getServiceLevelMessage,
  getUpgradePrompt,
  getServiceLevelFeatures,
  getSubscriptionBenefits,
  getAIRecommendations
} from '@/lib/utils/serviceLevels';

/**
 * 서비스 레벨 관리 훅
 */
export function useServiceLevel(userSubscriptions = []) {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = () => {
      try {
        const info = getUserInfo();
        setUserInfo(info);
      } catch (error) {
        console.warn('사용자 정보 로드 실패:', error);
        setUserInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  // 서비스 레벨 계산
  const serviceLevel = useMemo(() => {
    return determineServiceLevel(userInfo, userSubscriptions);
  }, [userInfo, userSubscriptions]);

  // 서비스 레벨별 정보
  const serviceLevelInfo = useMemo(() => {
    return {
      level: serviceLevel,
      message: getServiceLevelMessage(serviceLevel, userInfo),
      upgradePrompt: getUpgradePrompt(serviceLevel),
      features: getServiceLevelFeatures(serviceLevel),
      benefits: getSubscriptionBenefits(serviceLevel),
      aiRecommendations: getAIRecommendations(serviceLevel),
      isAuthenticated: isAuthenticated(),
      hasSubscriptions: userSubscriptions && userSubscriptions.length > 0
    };
  }, [serviceLevel, userInfo, userSubscriptions]);

  // 업그레이드 가능 여부
  const canUpgrade = useMemo(() => {
    return serviceLevel !== SERVICE_LEVELS.PERSONALIZED;
  }, [serviceLevel]);

  // 다음 레벨 정보
  const nextLevel = useMemo(() => {
    switch (serviceLevel) {
      case SERVICE_LEVELS.PUBLIC:
        return SERVICE_LEVELS.AUTHENTICATED_BASIC;
      case SERVICE_LEVELS.AUTHENTICATED_BASIC:
        return SERVICE_LEVELS.PERSONALIZED;
      default:
        return null;
    }
  }, [serviceLevel]);

  // 업그레이드 액션
  const handleUpgrade = () => {
    switch (serviceLevel) {
      case SERVICE_LEVELS.PUBLIC:
        // 로그인 페이지로 이동
        window.location.href = '/auth';
        break;
      case SERVICE_LEVELS.AUTHENTICATED_BASIC:
        // 구독 모달 열기 또는 구독 페이지로 이동
        console.log('구독 기능 활성화');
        break;
      default:
        console.log('업그레이드 불가능');
    }
  };

  return {
    serviceLevel,
    serviceLevelInfo,
    userInfo,
    isLoading,
    canUpgrade,
    nextLevel,
    handleUpgrade,
    isAuthenticated: isAuthenticated(),
    hasSubscriptions: userSubscriptions && userSubscriptions.length > 0
  };
}

/**
 * 서비스 레벨별 콘텐츠 필터링 훅
 */
export function useServiceLevelContent(content, serviceLevel) {
  return useMemo(() => {
    if (!content) return content;

    const features = getServiceLevelFeatures(serviceLevel);
    
    // 서비스 레벨에 따른 콘텐츠 필터링
    const filteredContent = { ...content };

    // 뉴스 수 제한
    if (filteredContent.categories) {
      Object.keys(filteredContent.categories).forEach(category => {
        if (filteredContent.categories[category].articles) {
          filteredContent.categories[category].articles = 
            filteredContent.categories[category].articles.slice(0, features.newsPerCategory);
        }
      });
    }

    // AI 추천 제한
    if (serviceLevel !== SERVICE_LEVELS.PERSONALIZED && filteredContent.aiRecommendations) {
      filteredContent.aiRecommendations = null;
    }

    return filteredContent;
  }, [content, serviceLevel]);
}

/**
 * 서비스 레벨별 UI 상태 관리 훅
 */
export function useServiceLevelUI(serviceLevel) {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [dismissedPrompts, setDismissedPrompts] = useState(new Set());

  // 로컬 스토리지에서 닫힌 프롬프트 로드
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissed-upgrade-prompts');
    if (dismissed) {
      try {
        const parsed = JSON.parse(dismissed);
        setDismissedPrompts(new Set(parsed));
      } catch (error) {
        console.warn('닫힌 프롬프트 로드 실패:', error);
      }
    }
  }, []);

  // 업그레이드 프롬프트 표시 여부 결정
  useEffect(() => {
    const shouldShow = serviceLevel !== SERVICE_LEVELS.PERSONALIZED && 
                      !dismissedPrompts.has(serviceLevel);
    setShowUpgradePrompt(shouldShow);
  }, [serviceLevel, dismissedPrompts]);

  // 프롬프트 닫기
  const dismissPrompt = (level) => {
    const newDismissed = new Set(dismissedPrompts);
    newDismissed.add(level);
    setDismissedPrompts(newDismissed);
    setShowUpgradePrompt(false);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('dismissed-upgrade-prompts', JSON.stringify([...newDismissed]));
  };

  // 프롬프트 다시 표시
  const showPrompt = () => {
    setShowUpgradePrompt(true);
  };

  return {
    showUpgradePrompt,
    dismissPrompt,
    showPrompt,
    dismissedPrompts
  };
}
