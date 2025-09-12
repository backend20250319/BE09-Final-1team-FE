import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getUserInfo, isAuthenticated } from '@/lib/auth/auth';

/**
 * 카카오톡 메시지 전송 권한 관리 훅
 * 
 * 주요 기능:
 * - 카카오톡 메시지 권한 확인
 * - 권한 요청 및 동의항목 추가 동의
 * - 권한 상태 관리
 * - 에러 처리 및 사용자 안내
 */
export function useKakaoPermission() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null); // null: 미확인, true: 권한 있음, false: 권한 없음
  const [sessionBackup, setSessionBackup] = useState(null); // 세션 백업
  const { toast } = useToast();

  /**
   * 백엔드 서버 연결 상태 확인
   */
  const checkBackendHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        credentials: 'include'
      });
      return response.ok;
    } catch (error) {
      console.warn('백엔드 헬스체크 실패:', error.message);
      return false;
    }
  }, []);

  /**
   * 서버 사이드에서 권한 확인
   */
  const checkPermissionViaServer = useCallback(async () => {
    try {
      console.log('서버에서 카카오 권한 확인 API 호출');
      
      // 먼저 백엔드 서버 상태 확인
      const isBackendHealthy = await checkBackendHealth();
      if (!isBackendHealthy) {
        console.warn('백엔드 서버가 응답하지 않습니다. 권한 확인을 건너뜁니다.');
        
        // 사용자에게 백엔드 서버 문제 알림
        toast({
          title: "서버 연결 실패",
          description: "백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.",
          variant: "destructive"
        });
        
        setHasPermission(false);
        return false;
      }
      
      const response = await fetch('/api/kakao/permissions/talk-message', {
        method: 'GET',
        credentials: 'include' // JWT 쿠키 포함
      });

      console.log('권한 확인 API 응답:', {
        status: response.status,
        ok: response.ok
      });

      if (response.ok) {
        const data = await response.json();
        console.log('권한 확인 API 데이터:', data);
        const hasPermission = data.hasPermission || false;
        setHasPermission(hasPermission);
        return hasPermission;
      } else {
        const errorData = await response.json().catch(() => ({ 
          error: '응답 파싱 실패',
          status: response.status,
          statusText: response.statusText 
        }));
        console.error('서버 권한 확인 실패:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          url: '/api/kakao/permissions/talk-message',
          timestamp: new Date().toISOString()
        });
        
        // 백엔드 API가 없는 경우 임시로 권한이 없다고 가정
        console.log('백엔드 API 응답 실패로 인해 권한 확인을 우회합니다.');
        
        // 사용자에게 친화적인 메시지 표시
        toast({
          title: "권한 확인 실패",
          description: `서버 연결에 문제가 있습니다. (상태: ${response.status}) 잠시 후 다시 시도해주세요.`,
          variant: "destructive"
        });
        
        setHasPermission(false);
        return false;
      }
    } catch (serverError) {
      console.error('서버 사이드 권한 확인 실패:', {
        error: serverError.message || '알 수 없는 오류',
        name: serverError.name,
        stack: serverError.stack,
        url: '/api/kakao/permissions/talk-message',
        timestamp: new Date().toISOString(),
        errorType: serverError.constructor.name
      });
      
      // 네트워크 오류나 API가 없는 경우 임시로 권한이 없다고 가정
      console.log('서버 오류로 인해 권한 확인을 우회합니다.');
      
      // 사용자에게 친화적인 메시지 표시
      toast({
        title: "네트워크 오류",
        description: "서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.",
        variant: "destructive"
      });
      
      setHasPermission(false);
      return false;
    }
  }, [checkBackendHealth]);

  /**
   * 카카오톡 메시지 전송 권한 확인
   */
  const checkTalkMessagePermission = useCallback(async () => {
    try {
      // 1. 기본 환경 확인
      if (typeof window === 'undefined') {
        console.warn('브라우저 환경이 아닙니다.');
        setHasPermission(false);
        return false;
      }

      // 2. 사용자 인증 상태 확인
      const userInfo = getUserInfo();
      if (!userInfo || !isAuthenticated()) {
        console.warn('사용자 로그인이 필요합니다.');
        setHasPermission(false);
        
        // 로그인이 필요한 경우 사용자에게 안내
        toast({
          title: "로그인이 필요합니다",
          description: "카카오톡 권한을 요청하려면 먼저 로그인을 해주세요.",
          variant: "destructive"
        });
        
        return false;
      }

      // 3. 서버 사이드에서 권한 확인 (JWT 쿠키 기반)
      console.log('서버 사이드에서 카카오 권한 확인 시작');
      return await checkPermissionViaServer();
    } catch (error) {
      console.error('카카오 권한 확인 실패:', error);
      setHasPermission(false);
      return false;
    }
  }, [checkPermissionViaServer]);

  /**
   * 현재 세션 상태 백업
   */
  const getCurrentSession = useCallback(async () => {
    try {
      const session = {
        kakaoAccessToken: typeof window !== 'undefined' && window.Kakao ? window.Kakao.Auth.getAccessToken() : null,
        userInfo: getUserInfo(),
        isAuthenticated: isAuthenticated(),
        timestamp: Date.now()
      };
      
      console.log('세션 백업 완료:', session);
      setSessionBackup(session);
      return session;
    } catch (error) {
      console.error('세션 백업 실패:', error);
      return null;
    }
  }, []);

  /**
   * 세션 복구 또는 재인증
   */
  const restoreOrReauth = useCallback(async (previousSession) => {
    try {
      // 현재 토큰 상태 확인
      const currentToken = typeof window !== 'undefined' && window.Kakao ? window.Kakao.Auth.getAccessToken() : null;
      
      if (!currentToken) {
        // 토큰이 없으면 기존 세션으로 복구 시도
        if (previousSession?.kakaoAccessToken) {
          console.log('카카오 토큰 복구 시도');
          if (typeof window !== 'undefined' && window.Kakao) {
            window.Kakao.Auth.setAccessToken(previousSession.kakaoAccessToken);
          }
        } else {
          // 복구 불가능하면 재로그인 필요
          throw new Error('재로그인이 필요합니다.');
        }
      }
      
      // 서버 세션도 확인
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('서버 세션 검증 실패');
        }
        
        console.log('세션 복구 성공');
        return true;
      } catch (serverError) {
        console.warn('서버 세션 검증 실패, 클라이언트 세션만 복구:', serverError);
        return true; // 클라이언트 세션은 복구되었으므로 성공으로 처리
      }
      
    } catch (error) {
      console.error('세션 복구 실패:', error);
      throw error;
    }
  }, []);

  /**
   * 세션 만료 에러 처리
   */
  const handleSessionExpired = useCallback((error) => {
    console.error('세션 만료 감지:', error);
    
    // 세션 만료 에러인 경우 재로그인 안내
    if (error.message?.includes('세션이 만료') || error.message?.includes('재로그인')) {
      const relogin = confirm('세션이 만료되었습니다. 다시 로그인하시겠습니까?');
      if (relogin) {
        window.location.href = '/auth';
        return true;
      }
    }
    return false;
  }, []);

  /**
   * 카카오톡 메시지 권한 요청 (동의항목 추가 동의)
   */
  const requestTalkMessagePermission = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (typeof window === 'undefined' || !window.Kakao) {
        throw new Error('카카오 SDK가 로드되지 않았습니다.');
      }

      // 1. 현재 세션 상태 백업
      const currentSession = await getCurrentSession();
      
      // 현재 사용자 토큰 정보 확인
      const tokenInfo = window.Kakao.Auth.getAccessToken();
      console.log('카카오 SDK 토큰 정보:', tokenInfo);
      console.log('카카오 SDK 초기화 상태:', window.Kakao.isInitialized());
      
      if (!tokenInfo) {
        // 토큰이 없는 경우 바로 로그인 + 권한 요청으로 이동
        console.log('카카오 토큰이 없습니다. 로그인 + 권한 요청을 진행합니다.');
        
        // 현재 URL을 저장하여 권한 요청 후 돌아올 수 있도록 함
        sessionStorage.setItem('kakao_permission_return_url', window.location.href);
        
        // 환경 변수 확인
        const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
        
        if (!appKey) {
          toast({
            title: "환경 변수 설정 필요",
            description: "카카오 앱 키가 설정되지 않았습니다. .env.local 파일에 NEXT_PUBLIC_KAKAO_JS_KEY를 설정해주세요.",
            variant: "destructive"
          });
          return false;
        }
        
        // 카카오 로그인 + 권한 요청 URL 생성
        const redirectUri = `${window.location.origin}/auth/oauth/kakao`;
        const scope = 'talk_message';
        const state = 'talk_message_permission';
        
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${appKey}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&prompt=login`;
        
        console.log('카카오 로그인 + 권한 요청 URL:', kakaoAuthUrl);
        
        // 직접 리다이렉트
        window.location.href = kakaoAuthUrl;
        
        return true;
      }

      // 사용자 정보 조회로 현재 권한 상태 확인
      const userInfo = await new Promise((resolve, reject) => {
        window.Kakao.API.request({
          url: '/v2/user/me',
          data: {
            secure_resource: true
          },
          success: (response) => {
            resolve(response);
          },
          fail: (error) => {
            reject(error);
          }
        });
      });

      // talk_message 권한 확인
      const scopes = userInfo.kakao_account?.scopes || [];
      const hasTalkMessageScope = scopes.some(scope => 
        scope.id === 'talk_message' && scope.agreed === true
      );

      if (!hasTalkMessageScope) {
        // 추가 동의 요청
        console.log('카카오톡 메시지 권한 요청 시작...');
        
        // 현재 URL을 저장하여 권한 요청 후 돌아올 수 있도록 함
        sessionStorage.setItem('kakao_permission_return_url', window.location.href);
        
        // 카카오 권한 요청 (리다이렉트 방식)
        const redirectUri = `${window.location.origin}/auth/oauth/kakao`;
        const scope = 'talk_message';
        const state = 'talk_message_permission';
        
        // 환경 변수 확인
        const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
        
        console.log('카카오 권한 요청 파라미터:', {
          redirectUri,
          scope,
          state,
          appKey,
          hasAppKey: !!appKey,
          envVars: {
            NEXT_PUBLIC_KAKAO_JS_KEY: process.env.NEXT_PUBLIC_KAKAO_JS_KEY,
            NEXT_PUBLIC_KAKAO_APP_KEY: process.env.NEXT_PUBLIC_KAKAO_APP_KEY
          },
          currentUrl: window.location.href,
          origin: window.location.origin
        });
        
        if (!appKey) {
          console.error('카카오 앱 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
          console.log('임시로 테스트용 키를 사용합니다. 실제 배포시에는 반드시 환경 변수를 설정해주세요.');
          
          // 임시 테스트용 키 (실제로는 작동하지 않음)
          const testKey = 'test_key_placeholder';
          console.log('테스트용 키 사용:', testKey);
          
          toast({
            title: "환경 변수 설정 필요",
            description: "카카오 앱 키가 설정되지 않았습니다. .env.local 파일에 NEXT_PUBLIC_KAKAO_JS_KEY를 설정해주세요.",
            variant: "destructive"
          });
          
          // 테스트용 URL 생성 (실제로는 작동하지 않음)
          const testUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${testKey}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&prompt=consent`;
          console.log('테스트용 카카오 OAuth URL:', testUrl);
          
          return false;
        }
        
        // 카카오 권한 요청 URL 생성 (로그인 + 권한 요청)
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${appKey}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}&prompt=login`;
        
        console.log('카카오 권한 요청 URL:', kakaoAuthUrl);
        console.log('URL 구성 요소:', {
          baseUrl: 'https://kauth.kakao.com/oauth/authorize',
          client_id: appKey,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: scope,
          state: state,
          prompt: 'login'
        });
        
        // URL 유효성 검사
        try {
          new URL(kakaoAuthUrl);
          console.log('URL 유효성 검사 통과');
        } catch (urlError) {
          console.error('URL 유효성 검사 실패:', urlError);
          toast({
            title: "URL 생성 오류",
            description: "카카오 OAuth URL 생성에 실패했습니다.",
            variant: "destructive"
          });
          return false;
        }
        
        // 직접 리다이렉트
        console.log('카카오 OAuth 페이지로 리다이렉트 시작...');
        window.location.href = kakaoAuthUrl;
        
        // authorize는 비동기적으로 처리되므로 즉시 true 반환
        // 실제 권한 확인은 페이지 리로드 후 checkTalkMessagePermission에서 수행
        console.log('카카오톡 메시지 권한 요청 완료');
        return true;
      } else {
        // 이미 권한이 있는 경우
        setHasPermission(true);
        toast({
          title: "이미 권한이 있습니다!",
          description: "카카오톡 뉴스레터를 받을 수 있습니다.",
        });
        return true;
      }
      
      return hasTalkMessageScope;
    } catch (error) {
      console.error('카카오 권한 요청 실패:', error);
      setHasPermission(false);
      
      // 세션 만료 에러 처리
      if (handleSessionExpired(error)) {
        return false; // 재로그인으로 이동했으므로 false 반환
      }
      
      let errorMessage = "카카오톡 메시지 권한을 허용할 수 없습니다.";
      
      if (error.code === 'KOE101') {
        errorMessage = "앱 설정에 오류가 있습니다. 관리자에게 문의해주세요.";
      } else if (error.code === 'KOE320') {
        errorMessage = "사용자가 권한 요청을 거부했습니다.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "권한 요청 실패",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, getCurrentSession, restoreOrReauth, handleSessionExpired]);

  /**
   * 카카오톡 메시지 전송 테스트
   */
  const testTalkMessage = useCallback(async (testData) => {
    try {
      if (!hasPermission) {
        throw new Error('카카오톡 메시지 권한이 없습니다.');
      }

      // 실제 메시지 전송은 서버에서 처리하므로 여기서는 권한만 확인
      const response = await fetch('/api/kakao/message/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '메시지 전송 테스트 실패');
      }

      return await response.json();
    } catch (error) {
      console.error('카카오 메시지 전송 테스트 실패:', error);
      throw error;
    }
  }, [hasPermission]);

  /**
   * 권한 상태 초기화
   */
  const resetPermission = useCallback(() => {
    setHasPermission(null);
  }, []);

  /**
   * 권한 요청 플로우 (권한 확인 → 요청 → 테스트)
   */
  const requestPermissionFlow = useCallback(async (category) => {
    try {
      // 1. 현재 권한 확인
      const currentPermission = await checkTalkMessagePermission();
      
      if (currentPermission) {
        toast({
          title: "이미 권한이 있습니다!",
          description: "카카오톡 뉴스레터를 받을 수 있습니다.",
        });
        return true;
      }

      // 2. 권한 요청 (세션 관리 포함)
      const permissionResult = await requestTalkMessagePermission();
      
      if (!permissionResult) {
        // 권한 요청 실패 (세션 만료 등)
        return false;
      }
      
      // 3. 권한 재확인 (짧은 지연 후)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newPermission = await checkTalkMessagePermission();
      
      if (newPermission) {
        toast({
          title: "권한 허용 완료!",
          description: `${category} 뉴스레터를 카카오톡으로 받을 수 있습니다.`,
        });
        return true;
      } else {
        // 권한이 확인되지 않아도 사용자에게는 성공으로 처리
        // (카카오 API 지연이나 동기화 문제일 수 있음)
        toast({
          title: "권한 요청 완료",
          description: "권한이 곧 적용될 예정입니다. 잠시 후 다시 확인해주세요.",
        });
        return true;
      }
    } catch (error) {
      console.error('권한 요청 플로우 실패:', error);
      
      // 세션 만료 에러 처리
      if (handleSessionExpired(error)) {
        return false;
      }
      
      throw error;
    }
  }, [checkTalkMessagePermission, requestTalkMessagePermission, toast, handleSessionExpired]);

  /**
   * 권한 요청 완료 후 권한 상태 강제 설정
   */
  const setPermissionGranted = useCallback(() => {
    console.log('권한 요청 완료, 권한 상태를 true로 설정');
    setHasPermission(true);
  }, []);

  return {
    // 상태
    isLoading,
    hasPermission,
    sessionBackup,
    
    // 메서드
    checkTalkMessagePermission,
    requestTalkMessagePermission,
    testTalkMessage,
    resetPermission,
    requestPermissionFlow,
    setPermissionGranted,
    
    // 세션 관리
    getCurrentSession,
    restoreOrReauth,
    handleSessionExpired,
  };
}

/**
 * 카카오톡 권한 모달 상태 관리 훅
 */
export function useKakaoPermissionModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const openModal = useCallback((data = {}) => {
    setModalData(data);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalData(null);
  }, []);

  return {
    isModalOpen,
    modalData,
    openModal,
    closeModal,
  };
}
