"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { smartShareNewsletter } from '@/lib/kakaoSmartShare';
import { MessageCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * 카카오톡 스마트 공유 버튼 컴포넌트
 * 권한 확인 → 추가 동의 요청 → 스마트 전송 플로우를 제공합니다.
 */
export default function SmartKakaoShareButton({
  newsletterData,
  accessToken,
  className = "",
  children = "카카오톡으로 공유하기"
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error' | 'consent_required'
  const { toast } = useToast();

  const handleSmartShare = async () => {
    if (!accessToken) {
      toast({
        title: "로그인이 필요합니다",
        description: "카카오톡 공유를 위해 로그인해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!newsletterData?.title || !newsletterData?.summary || !newsletterData?.url) {
      toast({
        title: "공유할 내용이 없습니다",
        description: "뉴스레터 정보를 확인해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setStatus('loading');

    try {
      const result = await smartShareNewsletter({
        accessToken,
        title: newsletterData.title,
        summary: newsletterData.summary,
        url: newsletterData.url,
        receiverUuids: newsletterData.receiverUuids || [],
        fallbackMethod: newsletterData.fallbackMethod || 'email'
      });

      if (result.success) {
        setStatus('success');
        toast({
          title: "공유 완료!",
          description: result.message,
        });
      } else if (result.requiresConsent) {
        setStatus('consent_required');
        toast({
          title: "추가 동의가 필요합니다",
          description: "카카오톡 메시지 권한을 허용해주세요.",
        });
        // consentUrl로 리다이렉트는 smartShareNewsletter에서 처리됨
      } else {
        setStatus('error');
        toast({
          title: "공유 실패",
          description: result.error || "공유 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('스마트 공유 오류:', error);
      setStatus('error');
      toast({
        title: "공유 실패",
        description: "예상치 못한 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            공유 중...
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            공유 완료
          </div>
        );
      case 'consent_required':
        return (
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
            권한 필요
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
            다시 시도
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            {children}
          </div>
        );
    }
  };

  const getButtonVariant = () => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'consent_required':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Button
      onClick={handleSmartShare}
      disabled={isLoading}
      variant={getButtonVariant()}
      className={`${className} transition-all duration-200`}
    >
      {getButtonContent()}
    </Button>
  );
}

/**
 * 사용 예제
 */
export const SmartKakaoShareExample = () => {
  const newsletterData = {
    title: "오늘의 주요 뉴스",
    summary: "경제, 정치, 사회 분야의 주요 뉴스를 정리했습니다.",
    url: "https://example.com/newsletter/123",
    receiverUuids: [], // 친구 UUID 목록 (선택사항)
    fallbackMethod: 'email' // 'email' | 'link'
  };

  const accessToken = "your_kakao_access_token"; // 실제 액세스 토큰

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">카카오톡 스마트 공유 예제</h3>
      
      <SmartKakaoShareButton
        newsletterData={newsletterData}
        accessToken={accessToken}
        className="w-full"
      />
      
      <SmartKakaoShareButton
        newsletterData={newsletterData}
        accessToken={accessToken}
        className="w-full"
      >
        친구들과 공유하기
      </SmartKakaoShareButton>
    </div>
  );
};
