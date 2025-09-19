'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * 세션 만료 및 인증 상태 관리를 담당하는 컴포넌트
 * 전역 이벤트를 감지하여 사용자에게 알림을 표시하고 적절한 처리를 수행합니다.
 */
export default function SessionManager() {
  const router = useRouter();

  useEffect(() => {
    // 세션 만료 이벤트 리스너
    const handleSessionExpired = (event) => {
      const { message } = event.detail || {};
      
      // 토스트 알림 표시
      toast.error(message || "세션이 만료되었습니다. 다시 로그인해주세요.", {
        duration: 5000,
        action: {
          label: "로그인",
          onClick: () => {
            router.push('/auth');
          }
        }
      });

      // 3초 후 자동으로 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
    };

    // 인증 상태 변경 이벤트 리스너
    const handleAuthStateChanged = () => {
      // 인증 상태가 변경되었을 때 필요한 처리를 수행
      console.log("🔔 인증 상태가 변경되었습니다.");
    };

    // 이벤트 리스너 등록
    window.addEventListener('sessionExpired', handleSessionExpired);
    window.addEventListener('authStateChanged', handleAuthStateChanged);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
      window.removeEventListener('authStateChanged', handleAuthStateChanged);
    };
  }, [router]);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}
