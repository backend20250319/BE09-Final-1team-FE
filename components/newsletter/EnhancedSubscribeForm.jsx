"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAsyncLoading } from "@/lib/hooks/useLoading";
import { useKakaoPermission, useKakaoPermissionModal } from "@/lib/hooks/useKakaoPermission";
import KakaoPermissionModal from "../KakaoPermissionModal";
import { 
  Mail, 
  MessageCircle, 
  Info, 
  CheckCircle,
  AlertCircle,
  Bell
} from "lucide-react";

// 이메일 검증 함수
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function EnhancedSubscribeForm({ 
  compact = false, 
  darkTheme = false,
  category = "뉴스레터",
  onSubscribeSuccess = null,
  showKakaoOption = true
}) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [kakaoNewsletterEnabled, setKakaoNewsletterEnabled] = useState(false);
  const [emailNewsletterEnabled, setEmailNewsletterEnabled] = useState(true);
  const { loading, execute } = useAsyncLoading();
  
  // 카카오 권한 관련 훅
  const { 
    hasPermission, 
    checkTalkMessagePermission, 
    requestPermissionFlow,
    setPermissionGranted,
    isLoading: isPermissionLoading 
  } = useKakaoPermission();
  
  const { 
    isModalOpen, 
    modalData, 
    openModal, 
    closeModal 
  } = useKakaoPermissionModal();

  // 컴포넌트 마운트 시 카카오 권한 확인
  useEffect(() => {
    if (showKakaoOption && typeof window !== 'undefined') {
      // URL 파라미터에서 권한 요청 완료 여부 확인
      const urlParams = new URLSearchParams(window.location.search);
      const permissionGranted = urlParams.get('permission_granted');
      
      if (permissionGranted === 'true') {
        // 권한 요청 완료 후 돌아온 경우 체크박스 자동 활성화
        console.log('권한 요청 완료 감지, 카카오 뉴스레터 체크박스 활성화');
        setKakaoNewsletterEnabled(true);
        setPermissionGranted(); // 권한 상태도 강제로 설정
        toast({
          title: "카카오톡 권한 허용 완료",
          description: "카카오톡 뉴스레터 구독이 활성화되었습니다.",
        });
        
        // URL에서 파라미터 제거
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('permission_granted');
        window.history.replaceState({}, '', newUrl);
      } else {
        // 일반적인 권한 확인
        checkTalkMessagePermission();
      }
    }
  }, [showKakaoOption, checkTalkMessagePermission]);

  // 카카오 뉴스레터 체크박스 변경 핸들러
  const handleKakaoNewsletterToggle = async (checked) => {
    if (checked) {
      // 카카오 뉴스레터 활성화 시 권한 확인
      if (hasPermission === false) {
        // 권한이 없는 경우 모달 표시
        openModal({ category });
        return;
      } else if (hasPermission === null) {
        // 권한 상태를 모르는 경우 확인 후 모달 표시
        const hasPermissionResult = await checkTalkMessagePermission();
        if (!hasPermissionResult) {
          openModal({ category });
          return;
        }
      }
    }
    
    setKakaoNewsletterEnabled(checked);
  };

  // 카카오 권한 모달에서 권한 허용 클릭
  const handlePermissionConfirm = async () => {
    try {
      const permissionResult = await requestPermissionFlow(category);
      
      if (permissionResult) {
        setKakaoNewsletterEnabled(true);
        closeModal();
      } else {
        // 권한 요청 실패 (세션 만료 등)
        setKakaoNewsletterEnabled(false);
        closeModal();
      }
    } catch (error) {
      console.error('권한 요청 실패:', error);
      // 권한 요청 실패 시 체크박스는 해제된 상태 유지
      setKakaoNewsletterEnabled(false);
      closeModal();
    }
  };

  // 카카오 권한 모달에서 대체 옵션 선택
  const handleAlternativeOption = () => {
    setKakaoNewsletterEnabled(false);
    setEmailNewsletterEnabled(true);
    closeModal();
    
    toast({
      title: "이메일 구독으로 변경",
      description: "이메일로 뉴스레터를 받아보실 수 있습니다.",
    });
  };

  // 구독 폼 제출
  async function onSubmit(e) {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({ 
        description: "이메일 형식이 올바르지 않습니다.",
        variant: "destructive"
      });
      return;
    }

    // 최소 하나의 구독 방법이 선택되어야 함
    if (!kakaoNewsletterEnabled && !emailNewsletterEnabled) {
      toast({ 
        description: "최소 하나의 구독 방법을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      await execute(async () => {
        // 구독 요청 데이터 구성
        const subscriptionData = {
          email,
          category,
          kakaoNewsletter: kakaoNewsletterEnabled,
          emailNewsletter: emailNewsletterEnabled,
          hasKakaoPermission: hasPermission
        };

        const res = await fetch("/api/newsletters/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscriptionData),
          credentials: "include"
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "구독 실패");
        }
        
        // 성공 메시지 구성
        let successMessage = "구독이 완료되었습니다!";
        if (kakaoNewsletterEnabled && emailNewsletterEnabled) {
          successMessage = "카카오톡과 이메일로 뉴스레터를 받아보실 수 있습니다.";
        } else if (kakaoNewsletterEnabled) {
          successMessage = "카카오톡으로 뉴스레터를 받아보실 수 있습니다.";
        } else {
          successMessage = "이메일로 뉴스레터를 받아보실 수 있습니다.";
        }
        
        toast({ 
          description: successMessage,
        });
        
        setEmail("");
        setKakaoNewsletterEnabled(false);
        setEmailNewsletterEnabled(true);
        
        // 성공 콜백 호출
        if (onSubscribeSuccess) {
          onSubscribeSuccess(email, subscriptionData);
        }
      });
    } catch (err) {
      toast({ 
        description: err.message || "오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4 w-full">
        {/* 이메일 입력 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            이메일 주소
          </label>
          <Input
            type="email"
            placeholder="이메일 주소를 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${compact ? 'h-10 text-sm' : 'h-12 text-base'} px-4 border-2 rounded-lg focus:ring-2 transition-all duration-200 ${
              darkTheme 
                ? 'border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-blue-500/20' 
                : 'border-gray-200 bg-white/90 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-200'
            }`}
            disabled={loading}
            required
          />
        </div>

        {/* 구독 방법 선택 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            구독 방법 선택
          </label>
          
          {/* 이메일 구독 */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <Checkbox
              id="email-newsletter"
              checked={emailNewsletterEnabled}
              onCheckedChange={setEmailNewsletterEnabled}
              disabled={loading}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <label htmlFor="email-newsletter" className="text-sm font-medium cursor-pointer">
                  이메일 뉴스레터
                </label>
                <Badge variant="secondary" className="text-xs">기본</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                매일 아침 이메일로 맞춤 뉴스를 받아보세요
              </p>
            </div>
          </div>

          {/* 카카오톡 구독 */}
          {showKakaoOption && (
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <Checkbox
                id="kakao-newsletter"
                checked={kakaoNewsletterEnabled}
                onCheckedChange={handleKakaoNewsletterToggle}
                disabled={loading || isPermissionLoading}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-yellow-600" />
                  <label htmlFor="kakao-newsletter" className="text-sm font-medium cursor-pointer">
                    카카오톡 뉴스레터
                  </label>
                  {hasPermission === true && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      권한 있음
                    </Badge>
                  )}
                  {hasPermission === false && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      로그인 필요
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  카카오톡으로 매일 아침 맞춤 뉴스를 받아보세요
                  {hasPermission === false && (
                    <span className="text-orange-600 font-medium"> (카카오 로그인 필요)</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-blue-800 font-medium">구독 안내</p>
              <p className="text-xs text-blue-700 mt-1">
                • 언제든지 구독 해지 가능 • 광고성 메시지 없음 • 오직 뉴스만 전송
              </p>
            </div>
          </div>
        </div>

        {/* 구독 버튼 */}
        <Button 
          type="submit" 
          disabled={loading || isPermissionLoading}
          className={`${compact ? 'h-10 text-sm px-6' : 'h-12 text-base px-8'} w-full font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              구독 처리 중...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Bell className="h-4 w-4 mr-2" />
              뉴스레터 구독하기
            </div>
          )}
        </Button>
      </form>

      {/* 카카오 권한 요청 모달 */}
      <KakaoPermissionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handlePermissionConfirm}
        onAlternative={handleAlternativeOption}
        category={modalData?.category || category}
        isLoading={isPermissionLoading}
      />
    </>
  );
}
