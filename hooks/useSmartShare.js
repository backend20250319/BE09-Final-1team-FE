import { useState, useCallback } from 'react';
import { getUserInfo, isAuthenticated } from '@/lib/auth';
import { loadKakaoSDK } from '@/utils/kakaoShare';

/**
 * 스마트 공유 기능을 위한 커스텀 훅
 * 사용자 로그인 상태와 선호도에 따라 최적의 공유 방법을 제공
 */
export function useSmartShare() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 사용자 정보 가져오기
  const getUser = useCallback(() => {
    if (!isAuthenticated()) return null;
    return getUserInfo();
  }, []);

  // 개인화된 데이터 생성
  const getPersonalizedData = useCallback((data, user) => {
    if (!user) return data;

    const preferences = user.preferences || {};
    const personalizedData = { ...data };

    // 선호 카테고리 기반 기사 재정렬
    if (preferences.categories && data.sections) {
      personalizedData.sections = data.sections.map(section => ({
        ...section,
        items: section.items?.sort((a, b) => {
          const aScore = preferences.categories.includes(a.category) ? 1 : 0;
          const bScore = preferences.categories.includes(b.category) ? 1 : 0;
          return bScore - aScore;
        })
      }));
    }

    // 개인화 메타데이터 추가
    personalizedData.personalizedFor = user.name || user.email;
    personalizedData.personalizationApplied = true;
    
    return personalizedData;
  }, []);

  // 카카오톡 공유
  const shareViaKakao = useCallback(async (newsletterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const Kakao = await loadKakaoSDK();
      const user = getUser();
      const personalizedData = getPersonalizedData(newsletterData, user);

      if (!Kakao || !Kakao.isInitialized()) {
        throw new Error('카카오 SDK가 초기화되지 않았습니다.');
      }

      // 기사 추출
      const articles = [];
      if (personalizedData.sections) {
        personalizedData.sections.forEach(section => {
          if (section.items && Array.isArray(section.items)) {
            section.items.slice(0, 5).forEach(item => {
              articles.push({
                title: item.title || '',
                summary: item.summary || '',
                url: item.url || ''
              });
            });
          }
        });
      }

      const templateArgs = {
        title: personalizedData.title || '오늘의 뉴스레터',
        description: personalizedData.description || '맞춤형 뉴스를 확인하세요',
        imageUrl: personalizedData.imageUrl || 'https://via.placeholder.com/800x400/667eea/ffffff?text=Newsletter',
        webUrl: typeof window !== 'undefined' ? window.location.href : '',
        mobileWebUrl: typeof window !== 'undefined' ? window.location.href : '',
        userName: user?.name || '구독자',
        userEmail: user?.email || '',
        personalizedMessage: personalizedData.personalizationApplied ? '맞춤형' : '일반',
        totalArticles: String(articles.length),
        readTime: String(personalizedData.readTime || 5) + '분'
      };

      // 기사 정보 추가
      articles.forEach((article, index) => {
        if (index < 5) {
          templateArgs[`article${index + 1}Title`] = article.title;
          templateArgs[`article${index + 1}Summary`] = article.summary;
          templateArgs[`article${index + 1}Url`] = article.url;
        }
      });

      await Kakao.Link.sendCustom({
        templateId: parseInt(process.env.NEXT_PUBLIC_KAKAO_TEMPLATE_ID || 123798),
        templateArgs: templateArgs
      });

      // 공유 통계 기록
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({
          method: 'kakao',
          newsletterId: newsletterData.id,
          userId: user?.id,
          personalized: personalizedData.personalizationApplied
        })
      });

      return {
        success: true,
        type: 'kakao',
        user: user,
        personalized: personalizedData.personalizationApplied
      };

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getUser, getPersonalizedData]);

  // 이메일 공유
  const shareViaEmail = useCallback(async (newsletterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = getUser();
      const personalizedData = getPersonalizedData(newsletterData, user);
      
      const shareData = {
        newsletterId: newsletterData.id,
        recipientEmail: user?.email,
        personalizedData: personalizedData,
        shareUrl: typeof window !== 'undefined' ? window.location.href : ''
      };

      const response = await fetch('/api/newsletter/share/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify(shareData)
      });

      if (!response.ok) {
        throw new Error('이메일 공유 실패');
      }

      return {
        success: true,
        type: 'email',
        user: user,
        personalized: personalizedData.personalizationApplied
      };

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getUser, getPersonalizedData]);

  // 링크 복사 공유
  const shareViaLink = useCallback(async (newsletterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = getUser();
      const shareUrl = `${window.location.href}?shared=true&userId=${user?.id || 'anonymous'}`;
      
      await navigator.clipboard.writeText(shareUrl);

      return {
        success: true,
        type: 'link',
        user: user,
        shareUrl: shareUrl
      };

    } catch (err) {
      // 폴백: 텍스트 선택
      try {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        return {
          success: true,
          type: 'link',
          user: getUser(),
          shareUrl: window.location.href
        };
      } catch (fallbackErr) {
        setError(fallbackErr.message);
        throw fallbackErr;
      }
    } finally {
      setIsLoading(false);
    }
  }, [getUser]);

  // 사용자별 최적 공유 방법 결정
  const getOptimalShareMethod = useCallback((user) => {
    if (!user) return 'link';

    const loginMethod = user.loginMethod || user.provider;
    
    switch (loginMethod) {
      case 'kakao':
        return 'kakao';
      case 'email':
        return 'email';
      default:
        return 'link';
    }
  }, []);

  // 스마트 공유 (자동으로 최적의 방법 선택)
  const smartShare = useCallback(async (newsletterData) => {
    const user = getUser();
    const method = getOptimalShareMethod(user);

    switch (method) {
      case 'kakao':
        return await shareViaKakao(newsletterData);
      case 'email':
        return await shareViaEmail(newsletterData);
      default:
        return await shareViaLink(newsletterData);
    }
  }, [getUser, getOptimalShareMethod, shareViaKakao, shareViaEmail, shareViaLink]);

  return {
    // 공유 메서드들
    shareViaKakao,
    shareViaEmail,
    shareViaLink,
    smartShare,
    
    // 유틸리티 함수들
    getUser,
    getPersonalizedData,
    getOptimalShareMethod,
    
    // 상태
    isLoading,
    error,
    isAuthenticated: isAuthenticated()
  };
}

/**
 * 공유 통계를 위한 훅
 */
export function useShareAnalytics() {
  const trackShare = useCallback(async (shareData) => {
    try {
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({
          ...shareData,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
          referrer: typeof window !== 'undefined' ? document.referrer : ''
        })
      });
    } catch (error) {
      console.error('공유 통계 기록 실패:', error);
    }
  }, []);

  const getShareStats = useCallback(async (newsletterId) => {
    try {
      const response = await fetch(`/api/analytics/newsletter-shares/${newsletterId}`, {
        credentials: 'include' // 쿠키 포함
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('공유 통계 조회 실패:', error);
    }
    return null;
  }, []);

  return {
    trackShare,
    getShareStats
  };
}
