"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, ExternalLink } from 'lucide-react'

// 카카오 SDK 로드 함수 (개선된 버전)
const loadKakaoSDK = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not available'));
      return;
    }

    // 이미 로드된 경우
    if (window.Kakao && window.Kakao.isInitialized) {
      resolve(window.Kakao);
      return;
    }

    // 이미 로드 중인 경우
    if (window.kakaoSDKLoading) {
      const checkLoaded = () => {
        if (window.Kakao && window.Kakao.isInitialized) {
          resolve(window.Kakao);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // SDK 로드 시작
    window.kakaoSDKLoading = true;

    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js';
    script.integrity = 'sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm';
    script.crossOrigin = 'anonymous';
    script.async = true;
    
    script.onload = () => {
      window.kakaoSDKLoading = false;
      if (window.Kakao) {
        resolve(window.Kakao);
      } else {
        reject(new Error('Kakao SDK loaded but not available'));
      }
    };
    
    script.onerror = () => {
      window.kakaoSDKLoading = false;
      reject(new Error('Failed to load Kakao SDK'));
    };
    
    document.head.appendChild(script);
  });
};

export default function NewsphereKakaoShare({ 
  newsData, 
  className = "" 
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 환경변수에서 카카오 JavaScript 키 가져오기
  const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

  useEffect(() => {
    const initKakao = async () => {
      try {
        // 환경변수 확인
        if (!KAKAO_JS_KEY) {
          console.warn('카카오 JavaScript 키가 설정되지 않았습니다. 환경변수를 확인해주세요.');
          setIsInitialized(false);
          return;
        }

        const Kakao = await loadKakaoSDK();
        
        if (!Kakao) {
          throw new Error('Kakao SDK를 로드할 수 없습니다.');
        }
        
        // 초기화 확인 및 실행
        if (!Kakao.isInitialized()) {
          try {
            Kakao.init(KAKAO_JS_KEY);
            console.log('카카오 SDK 초기화 완료');
          } catch (initError) {
            console.error('카카오 SDK 초기화 실패:', initError);
            throw initError;
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('카카오 SDK 로드/초기화 실패:', error);
        setIsInitialized(false);
      }
    };

    // 컴포넌트가 마운트된 후에만 초기화 실행
    if (typeof window !== 'undefined') {
      initKakao();
    }
  }, [KAKAO_JS_KEY]);

  // Newsphere 뉴스 공유
  const handleNewsphereShare = async () => {
    if (!isInitialized) {
      console.warn('카카오 SDK가 초기화되지 않았습니다.');
      alert('카카오톡 공유 기능을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!window.Kakao || !window.Kakao.Share) {
      console.error('카카오 SDK 또는 Share 모듈을 사용할 수 없습니다.');
      alert('카카오톡 공유 기능을 사용할 수 없습니다.');
      return;
    }

    if (!newsData) {
      console.error('뉴스 데이터가 없습니다.');
      alert('공유할 데이터가 없습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const currentUrl = newsData.url || window.location.href;
      
      // Newsphere 전용 피드 템플릿
      const newsphereTemplate = {
        objectType: 'feed',
        content: {
          title: '📰 Newsphere - 오늘의 뉴스',
          description: '맞춤형 뉴스를 확인해보세요!',
          imageUrl: newsData.imageUrl || 'https://via.placeholder.com/800x400/667eea/ffffff?text=Newsphere',
          link: {
            webUrl: currentUrl,
            mobileWebUrl: currentUrl
          }
        },
        buttons: [{
          title: '뉴스 보기',
          link: { 
            webUrl: currentUrl,
            mobileWebUrl: currentUrl
          }
        }]
      };

      await window.Kakao.Share.sendDefault(newsphereTemplate);
      
      console.log('Newsphere 뉴스 공유 성공');
      
      // 공유 통계 추적 (선택사항)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'share', {
          method: 'kakao',
          content_type: 'newsphere_news',
          content_id: newsData.id
        });
      }

    } catch (error) {
      console.error('Newsphere 뉴스 공유 실패:', error);
      
      // 에러 타입에 따른 메시지 처리
      let errorMessage = '카카오톡 공유에 실패했습니다.';
      
      if (error.message?.includes('4019')) {
        errorMessage = '인증 오류입니다. 도메인 등록을 확인해주세요.';
      } else if (error.message?.includes('4002')) {
        errorMessage = '도메인이 등록되지 않았습니다.';
      } else if (error.message?.includes('4001')) {
        errorMessage = '템플릿 ID가 올바르지 않습니다.';
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
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
      {/* Newsphere 공유 버튼 */}
      <Button
        onClick={handleNewsphereShare}
        disabled={isLoading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            공유 중...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Newsphere 뉴스 공유
          </div>
        )}
      </Button>

      {/* 추가 정보 */}
      <div className="text-xs text-gray-500 text-center">
        맞춤형 뉴스를 카카오톡으로 공유하세요
      </div>
    </div>
  );
}
