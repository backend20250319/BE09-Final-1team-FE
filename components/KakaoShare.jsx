"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, ExternalLink, Users, TrendingUp } from 'lucide-react'

// 카카오 SDK 로드 함수
const loadKakaoSDK = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not available'));
      return;
    }

    if (window.Kakao) {
      resolve(window.Kakao);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    script.onload = () => resolve(window.Kakao);
    script.onerror = () => reject(new Error('Failed to load Kakao SDK'));
    document.head.appendChild(script);
  });
};

export default function KakaoShare({ 
  newsletterData, 
  showStats = false, 
  showFloating = false,
  className = "" 
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 환경변수에서 카카오 JavaScript 키 가져오기
  const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  const TEMPLATE_ID = process.env.NEXT_PUBLIC_KAKAO_TEMPLATE_ID || 123798;

  useEffect(() => {
    const initKakao = async () => {
      try {
        const Kakao = await loadKakaoSDK();
        
        if (!KAKAO_JS_KEY) {
          console.error('카카오 JavaScript 키가 설정되지 않았습니다.');
          return;
        }
        
        if (!Kakao.isInitialized()) {
          Kakao.init(KAKAO_JS_KEY);
          console.log('카카오 SDK 초기화 완료');
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('카카오 SDK 로드 실패:', error);
      }
    };

    initKakao();
  }, [KAKAO_JS_KEY]);

  // 템플릿 인자 구성 - 실제 카카오 템플릿 변수명에 맞게 수정
  const buildTemplateArgs = (data) => {
    console.log('카카오 공유 데이터:', data);
    console.log('현재 도메인:', window.location.origin);
    
    return {
      // 카카오 개발자 콘솔에서 확인한 실제 변수명 사용
      '${REGI_WEB_DOMAIN}': window.location.origin,
      '${IMAGE_URL}': data.imageUrl || 'https://via.placeholder.com/800x400/667eea/ffffff?text=NewSphere',
      
      // 기본 템플릿 변수들 (실제 템플릿에 따라 수정 필요)
      'title': data.title || '뉴스레터',
      'description': data.description || '',
      'webUrl': data.url || window.location.href,
      'mobileUrl': data.url || window.location.href,
      'category': data.category || 'Newsletter',
      'author': data.author || 'NewSphere'
    };
  };

  const handleKakaoShare = async () => {
    if (!isInitialized) {
      alert('카카오 SDK가 초기화되지 않았습니다.');
      return;
    }

    if (!window.Kakao) {
      alert('카카오 SDK를 사용할 수 없습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const templateArgs = buildTemplateArgs(newsletterData);
      console.log('템플릿 인자:', templateArgs);

      // 사용자 정의 템플릿 사용
      await window.Kakao.Link.sendCustom({
        templateId: parseInt(TEMPLATE_ID),
        templateArgs: templateArgs
      });

      console.log('카카오톡 공유 성공');
      
      // 공유 통계 추적 (선택사항)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'share', {
          method: 'kakao',
          content_type: 'newsletter',
          content_id: newsletterData.id
        });
      }

    } catch (error) {
      console.error('카카오톡 공유 실패:', error);
      
      // 에러 타입에 따른 메시지 처리
      let errorMessage = '카카오톡 공유에 실패했습니다.';
      
      if (error.message?.includes('4019')) {
        errorMessage = '인증 오류입니다. 도메인 등록을 확인해주세요.';
      } else if (error.message?.includes('4002')) {
        errorMessage = '도메인이 등록되지 않았습니다.';
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 기본 템플릿으로 테스트하는 함수 (디버깅용)
  const handleBasicShare = async () => {
    if (!window.Kakao) return;

    try {
      await window.Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
          title: newsletterData.title,
          description: newsletterData.description,
          imageUrl: newsletterData.imageUrl,
          link: {
            webUrl: window.location.href,
            mobileWebUrl: window.location.href
          }
        },
        buttons: [{
          title: '뉴스레터 보기',
          link: {
            webUrl: window.location.href,
            mobileWebUrl: window.location.href
          }
        }]
      });
      
      console.log('기본 템플릿 공유 성공');
    } catch (error) {
      console.error('기본 템플릿 공유 실패:', error);
    }
  };

  if (!isInitialized) {
    return (
      <div className={`text-center ${className}`}>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 메인 공유 버튼 */}
      <Button
        onClick={handleKakaoShare}
        disabled={isLoading}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
            공유 중...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            카카오톡으로 공유하기
          </div>
        )}
      </Button>

      {/* 디버깅용 기본 템플릿 버튼 (개발 환경에서만 표시) */}
      {process.env.NODE_ENV === 'development' && (
        <Button
          onClick={handleBasicShare}
          variant="outline"
          className="w-full text-xs"
        >
          기본 템플릿 테스트
        </Button>
      )}

      {/* 통계 정보 (선택사항) */}
      {showStats && (
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            <span>구독자 수</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>성장률</span>
          </div>
        </div>
      )}

      {/* 플로팅 공유 버튼 (선택사항) */}
      {showFloating && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleKakaoShare}
            className="bg-yellow-400 hover:bg-yellow-500 text-black p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isLoading}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}