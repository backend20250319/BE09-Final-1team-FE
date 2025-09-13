"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Mail, 
  Share2, 
  ExternalLink, 
  Users, 
  TrendingUp, 
  User, 
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useSmartShare } from '@/lib/hooks/useSmartShare'
import { loadKakaoSDK } from '@/utils/kakaoShare'
import { isAuthenticated, getUserInfo } from '@/lib/auth/auth'
import { shareNewsletterAsKakaoFeed } from '@/lib/utils/kakaoFeedTemplate'

// 로그인 방식 감지 및 사용자 정보 관리
const useUserAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          // localStorage에서 사용자 정보 가져오기
          const userData = getUserInfo();
          if (userData) {
            setUser(userData);
          } else {
            // localStorage에 없으면 API에서 가져오기
            const response = await fetch('/api/auth/me', {
              method: 'GET',
              credentials: 'include'
            });
            
            if (response.ok) {
              const apiUserData = await response.json();
              setUser(apiUserData);
            }
          }
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // 인증 상태 변경 이벤트 리스너
    const handleAuthChange = () => {
      checkAuth();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('authStateChanged', handleAuthChange);
      return () => {
        window.removeEventListener('authStateChanged', handleAuthChange);
      };
    }
  }, []);

  return { user, loading, isLoggedIn: !!user };
};

export default function SmartShareComponent({ 
  newsletterData = {}, 
  showStats = true,
  className = "",
  onShareSuccess,
  onShareError
}) {
  const { user, loading: authLoading, isLoggedIn } = useUserAuth();
  const [isKakaoReady, setIsKakaoReady] = useState(false);
  const { toast } = useToast();
  
  // 스마트 공유 훅 사용
  const { 
    shareViaKakao, 
    shareViaEmail, 
    shareViaLink, 
    smartShare,
    isLoading: isSharing,
    error: shareError
  } = useSmartShare();

  const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '58255a3390abb537df22b14097e5265e';
  const TEMPLATE_ID = process.env.NEXT_PUBLIC_KAKAO_TEMPLATE_ID || 123798;

  // 카카오 SDK 초기화
  useEffect(() => {
    const initKakao = async () => {
      try {
        const Kakao = await loadKakaoSDK();
        if (!KAKAO_JS_KEY) {
          console.warn('카카오 JavaScript 키가 설정되지 않았습니다.');
          return;
        }
        
        if (!Kakao.isInitialized()) {
          Kakao.init(KAKAO_JS_KEY);
        }
        setIsKakaoReady(true);
      } catch (error) {
        console.error('카카오 SDK 초기화 실패:', error);
      }
    };

    initKakao();
  }, [KAKAO_JS_KEY]);

  // 공유 함수들 (훅에서 가져온 함수들을 래핑)
  const handleKakaoShare = async () => {
    if (!isKakaoReady || !window.Kakao) {
      toast({
        title: "❌ 카카오톡 공유 불가",
        description: "카카오톡 공유를 사용할 수 없습니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      // 피드 B형 템플릿으로 공유
      const result = await shareNewsletterAsKakaoFeed(newsletterData, {
        showSocial: true,
        baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      });
      
      toast({
        title: "✅ 카카오톡 피드 공유 완료",
        description: "뉴스레터가 카카오톡 피드 B형으로 공유되었습니다!",
      });
      onShareSuccess?.(result);
    } catch (error) {
      console.error('카카오톡 피드 공유 실패:', error);
      
      // 피드 공유 실패 시 기존 방식으로 폴백
      try {
        const fallbackResult = await shareViaKakao(newsletterData);
        toast({
          title: "✅ 카카오톡 공유 완료 (폴백)",
          description: "뉴스레터가 카카오톡으로 공유되었습니다!",
        });
        onShareSuccess?.(fallbackResult);
      } catch (fallbackError) {
        console.error('카카오톡 공유 폴백 실패:', fallbackError);
        onShareError?.(fallbackError);
        toast({
          title: "❌ 카카오톡 공유 실패",
          description: "카카오톡 공유에 실패했습니다.",
          variant: "destructive"
        });
      }
    }
  };

  const handleEmailShare = async () => {
    try {
      const result = await shareViaEmail(newsletterData);
      toast({
        title: "✅ 이메일 공유 완료",
        description: "뉴스레터가 이메일로 공유되었습니다!",
      });
      onShareSuccess?.(result);
    } catch (error) {
      console.error('이메일 공유 실패:', error);
      onShareError?.(error);
      toast({
        title: "❌ 이메일 공유 실패",
        description: "이메일 공유에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleLinkShare = async () => {
    try {
      const result = await shareViaLink(newsletterData);
      toast({
        title: "✅ 링크 복사 완료",
        description: "링크가 클립보드에 복사되었습니다!",
      });
      onShareSuccess?.(result);
    } catch (error) {
      console.error('링크 복사 실패:', error);
      onShareError?.(error);
      toast({
        title: "❌ 링크 복사 실패",
        description: "링크 복사에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  // 개인화 설정 페이지로 이동
  const openPersonalizationSettings = () => {
    window.open('/settings/personalization', '_blank');
  };

  if (authLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isKakaoUser = user?.loginMethod === 'kakao' || user?.provider === 'kakao';
  const isEmailUser = user?.loginMethod === 'email' || user?.provider === 'email';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          뉴스레터 공유
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 사용자 정보 표시 */}
        {isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="font-medium text-blue-900">
                    {user.name || user.email}님 안녕하세요!
                  </p>
                  <p className="text-sm text-blue-700">
                    {user.preferences?.categories?.length > 0 
                      ? `${user.preferences.categories.join(', ')} 맞춤형 뉴스레터` 
                      : '개인화 설정을 완료하면 더 나은 뉴스를 받아보실 수 있어요'}
                  </p>
                </div>
              </div>
              <Button
                onClick={openPersonalizationSettings}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300"
              >
                <Settings className="h-4 w-4 mr-1" />
                설정
              </Button>
            </div>
          </div>
        )}

        {/* 로그인 방식별 공유 버튼 */}
        <div className="space-y-3">
          {!isLoggedIn ? (
            <div className="bg-gray-50 border rounded-lg p-4 text-center">
              <p className="text-gray-600 mb-3">로그인하면 맞춤형 공유가 가능해요!</p>
              <div className="space-y-2">
                <Button onClick={handleLinkShare} variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  링크 복사하기
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* 카카오 사용자 - 카카오톡 공유 우선 */}
              {isKakaoUser && (
                <Button
                  onClick={handleKakaoShare}
                  disabled={isSharing || !isKakaoReady}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3"
                >
                  {isSharing ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      카카오톡으로 공유 중...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      맞춤형 뉴스레터 카카오톡 공유
                    </div>
                  )}
                </Button>
              )}

              {/* 이메일 사용자 - 이메일 공유 우선 */}
              {isEmailUser && (
                <Button
                  onClick={handleEmailShare}
                  disabled={isSharing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                >
                  {isSharing ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      이메일로 공유 중...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2" />
                      맞춤형 뉴스레터 이메일 공유
                    </div>
                  )}
                </Button>
              )}

              {/* 공통 공유 옵션 */}
              <div className="grid grid-cols-2 gap-2">
                {isKakaoUser && (
                  <Button onClick={handleEmailShare} variant="outline" disabled={isSharing}>
                    <Mail className="h-4 w-4 mr-1" />
                    이메일
                  </Button>
                )}
                {isEmailUser && isKakaoReady && (
                  <Button onClick={handleKakaoShare} variant="outline" disabled={isSharing}>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    카카오톡
                  </Button>
                )}
                <Button onClick={handleLinkShare} variant="outline">
                  <Share2 className="h-4 w-4 mr-1" />
                  링크 복사
                </Button>
              </div>
            </>
          )}
        </div>

        {/* 통계 정보 */}
        {showStats && (
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>구독자 {newsletterData.subscriberCount || 0}명</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>읽기 {newsletterData.readTime || 5}분</span>
            </div>
          </div>
        )}

        {/* 개인화 정보 */}
        {isLoggedIn && user?.preferences?.categories?.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p className="text-sm text-green-800">
                ✨ 이 뉴스레터는 회원님의 관심사({user.preferences.categories.join(', ')})에 맞게 개인화되었습니다.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
