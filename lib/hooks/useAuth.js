import { useState, useEffect, useCallback } from 'react';
import { getUserInfo, setUserInfo } from '@/lib/auth/auth';

export function useAuth() {
  const [userInfo, setUserInfoState] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 먼저 localStorage에서 사용자 정보 확인
      const localUserInfo = getUserInfo();
      
      if (localUserInfo) {
        // localStorage에 사용자 정보가 있으면 서버에서 인증 상태 확인
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });
        
        console.log('🔍 /api/auth/me 응답:', {
          status: response.status,
          ok: response.ok
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // 서버에서 사용자 정보를 받았으면 업데이트
            const serverUserInfo = data.data;
            setUserInfoState(serverUserInfo);
            setUserRole(serverUserInfo.role || 'user');
            
            console.log('🔍 useAuth 상태 업데이트 (서버 확인):', {
              userInfo: serverUserInfo,
              userRole: serverUserInfo.role || 'user',
            });
            return;
          }
        } else {
          // 401 오류인 경우 응답 내용 확인
          const errorData = await response.json().catch(() => ({}));
          console.log('🔍 /api/auth/me 오류 응답:', errorData);
          
          // 디버깅을 위해 쿠키 상태 확인
          try {
            const cookieResponse = await fetch('/api/debug/cookies', {
              method: 'GET',
              credentials: 'include',
            });
            if (cookieResponse.ok) {
              const cookieData = await cookieResponse.json();
              console.log('🍪 현재 쿠키 상태:', cookieData);
            }
          } catch (cookieError) {
            console.log('🍪 쿠키 디버깅 실패:', cookieError);
          }
        }
        
        // 서버 인증 실패 시 localStorage 정리
        console.log('🔍 서버 인증 실패, localStorage 정리');
        localStorage.removeItem('userInfo');
      }
      
      // localStorage에 사용자 정보가 없거나 서버 인증 실패
      setUserInfoState(null);
      setUserRole(null);
      
      console.log('🔍 useAuth 상태 업데이트 (인증 없음):', {
        userInfo: null,
        userRole: null,
      });
      
    } catch (error) {
      console.error('🔍 useAuth 상태 업데이트 오류:', error);
      setUserInfoState(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    updateUserStatus();

    // 커스텀 이벤트 감지 (로그인/로그아웃 시)
    const handleAuthChange = () => {
      console.log('🔍 AuthStateChanged 이벤트 감지 (useAuth)');
      // 약간의 지연을 두고 상태 업데이트 (localStorage 저장 완료 대기)
      setTimeout(() => {
        updateUserStatus();
      }, 100);
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [updateUserStatus]);

  const isLoggedIn = !!userRole;

  return {
    userInfo,
    userRole,
    isLoggedIn,
    isLoading,
    updateUserStatus,
  };
}
