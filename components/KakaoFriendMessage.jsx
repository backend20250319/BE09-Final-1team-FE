"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MessageCircle, 
  UserCheck, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

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
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js';
    script.integrity = 'sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = () => resolve(window.Kakao);
    script.onerror = () => reject(new Error('Failed to load Kakao SDK'));
    document.head.appendChild(script);
  });
};

export default function KakaoFriendMessage({ 
  newsletterData, 
  className = "" 
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  const { toast } = useToast();

  // 환경변수에서 카카오 JavaScript 키 가져오기
  const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '58255a3390abb537df22b14097e5265e';
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || window.location.origin + '/auth/oauth/kakao';

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
        
        // 로그인 상태 확인
        checkLoginStatus();
        setIsInitialized(true);
      } catch (error) {
        console.error('카카오 SDK 로드 실패:', error);
        toast({
          title: "❌ 카카오 SDK 로드 실패",
          description: "카카오톡 서비스를 사용할 수 없습니다.",
          variant: "destructive"
        });
      }
    };

    initKakao();
  }, [KAKAO_JS_KEY]);

  // 로그인 상태 확인
  const checkLoginStatus = () => {
    if (window.Kakao && window.Kakao.Auth.getAccessToken()) {
      setIsLoggedIn(true);
    }
  };

  // 카카오 로그인
  const loginWithKakao = () => {
    if (!window.Kakao) return;

    window.Kakao.Auth.authorize({
      redirectUri: REDIRECT_URI,
      state: 'sendfriend_newsletter',
      scope: 'friends,talk_message', // 친구 목록과 메시지 전송 권한
    });
  };

  // 친구 선택 피커 열기
  const openFriendPicker = () => {
    if (!window.Kakao || !isLoggedIn) {
      toast({
        title: "❌ 로그인 필요",
        description: "친구에게 메시지를 보내려면 카카오 로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setShowFriendPicker(true);

    window.Kakao.Picker.selectFriends({
      showMyProfile: false,
      maxPickableCount: 5, // 최대 5명
      minPickableCount: 1,
    })
    .then(function(res) {
      const friends = res.users.map(user => ({
        uuid: user.uuid,
        profile_nickname: user.profile_nickname,
        profile_thumbnail_image: user.profile_thumbnail_image
      }));
      
      setSelectedFriends(friends);
      setShowFriendPicker(false);
      setIsLoading(false);
      
      toast({
        title: "✅ 친구 선택 완료",
        description: `${friends.length}명의 친구가 선택되었습니다.`,
      });
    })
    .catch(function(err) {
      console.error('친구 선택 실패:', err);
      setShowFriendPicker(false);
      setIsLoading(false);
      
      if (err.code === -1) {
        toast({
          title: "❌ 친구 선택 취소",
          description: "친구 선택이 취소되었습니다.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "❌ 친구 선택 실패",
          description: "친구를 선택하는데 실패했습니다.",
          variant: "destructive"
        });
      }
    });
  };

  // 친구에게 뉴스레터 메시지 보내기
  const sendToFriends = async () => {
    if (!window.Kakao || selectedFriends.length === 0) return;

    setIsLoading(true);

    try {
      const uuids = selectedFriends.map(friend => friend.uuid);
      
      // 뉴스레터 미리보기 URL 생성 (실제 newsletterId 사용)
      const newsletterPreviewUrl = newsletterData.id 
        ? `${window.location.origin}/newsletter/${newsletterData.id}/preview`
        : window.location.href;
      
      console.log('🔗 친구에게 보낼 뉴스레터 URL:', newsletterPreviewUrl);
      
      // 뉴스레터 메시지 템플릿 구성
      const templateObject = {
        object_type: 'feed',
        content: {
          title: newsletterData.title || '📰 뉴스레터',
          description: newsletterData.description || '흥미로운 뉴스를 확인해보세요!',
          image_url: newsletterData.imageUrl || 'https://via.placeholder.com/800x400/667eea/ffffff?text=Newsletter',
          link: {
            web_url: newsletterPreviewUrl,
            mobile_web_url: newsletterPreviewUrl,
          },
        },
        social: {
          like_count: 0,
          comment_count: 0,
          shared_count: 0,
        },
        buttons: [
          {
            title: '뉴스레터 보기',
            link: {
              web_url: newsletterPreviewUrl,
              mobile_web_url: newsletterPreviewUrl,
            },
          },
          {
            title: '구독하기',
            link: {
              web_url: window.location.origin,
              mobile_web_url: window.location.origin,
            },
          },
        ],
      };

      // 친구에게 메시지 발송
      const response = await window.Kakao.API.request({
        url: '/v1/api/talk/friends/message/default/send',
        data: {
          receiver_uuids: uuids,
          template_object: templateObject,
        },
      });

      console.log('친구에게 메시지 발송 성공:', response);
      
      toast({
        title: "✅ 메시지 발송 완료",
        description: `${selectedFriends.length}명의 친구에게 뉴스레터가 전송되었습니다!`,
      });

      // 선택된 친구 목록 초기화
      setSelectedFriends([]);

    } catch (error) {
      console.error('친구에게 메시지 발송 실패:', error);
      
      let errorMessage = '친구에게 메시지 발송에 실패했습니다.';
      
      if (error.code === -401) {
        errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
      } else if (error.code === -402) {
        errorMessage = '권한이 없습니다. 카카오톡 메시지 권한을 확인해주세요.';
      } else if (error.code === -403) {
        errorMessage = '쿼터를 초과했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      toast({
        title: "❌ 메시지 발송 실패",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 선택된 친구 제거
  const removeFriend = (uuid) => {
    setSelectedFriends(prev => prev.filter(friend => friend.uuid !== uuid));
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
    <div className={`space-y-4 ${className}`}>
      {/* 로그인 상태에 따른 UI */}
      {!isLoggedIn ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              친구에게 뉴스레터 보내기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              친구에게 뉴스레터를 보내려면 카카오 로그인이 필요합니다.
            </p>
            <Button 
              onClick={loginWithKakao}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              카카오 로그인
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              친구에게 뉴스레터 보내기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 친구 선택 버튼 */}
            <Button 
              onClick={openFriendPicker}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  친구 선택 중...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  친구 선택하기
                </>
              )}
            </Button>

            {/* 선택된 친구 목록 */}
            {selectedFriends.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">
                  선택된 친구 ({selectedFriends.length}명)
                </h4>
                <div className="space-y-2">
                  {selectedFriends.map((friend) => (
                    <div key={friend.uuid} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <img 
                          src={friend.profile_thumbnail_image} 
                          alt={friend.profile_nickname}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm font-medium">{friend.profile_nickname}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFriend(friend.uuid)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* 메시지 발송 버튼 */}
                <Button 
                  onClick={sendToFriends}
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      발송 중...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      뉴스레터 보내기
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">안내사항</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• 최대 5명의 친구에게 동시에 보낼 수 있습니다</li>
                    <li>• 일일 발송 한도가 있습니다</li>
                    <li>• 친구가 카카오톡을 사용하지 않으면 메시지를 받을 수 없습니다</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
