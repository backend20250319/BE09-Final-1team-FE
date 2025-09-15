/**
 * 카카오톡 스마트 공유 유틸리티
 * 권한 확인 → 추가 동의 요청 → 스마트 전송 플로우를 제공합니다.
 */

/**
 * 카카오톡 스마트 공유 메인 함수
 * @param {Object} options - 공유 옵션
 * @param {string} options.accessToken - 카카오 액세스 토큰
 * @param {string} options.title - 뉴스레터 제목
 * @param {string} options.summary - 뉴스레터 요약
 * @param {string} options.url - 뉴스레터 URL
 * @param {string[]} options.receiverUuids - 수신자 UUID 목록 (선택사항)
 * @param {string} options.fallbackMethod - 대체 전송 방식 ('email' | 'link')
 * @returns {Promise<Object>} 전송 결과
 */
export async function smartShareNewsletter({
  accessToken,
  title,
  summary,
  url,
  receiverUuids = [],
  fallbackMethod = 'email'
}) {
  try {
    console.log('🚀 카카오톡 스마트 공유 시작');

    // 1. 권한 확인
    console.log('1️⃣ 권한 확인 중...');
    const hasPermission = await checkKakaoPermission(accessToken);
    
    if (!hasPermission) {
      console.log('❌ 카카오톡 메시지 권한이 없습니다.');
      
      // 2. 권한 없으면 추가 동의 요청
      console.log('2️⃣ 추가 동의 요청 중...');
      const consentResult = await requestAdditionalConsent(accessToken);
      
      if (consentResult.success) {
        // 사용자를 consentUrl로 리다이렉트
        console.log('📱 추가 동의 페이지로 리다이렉트:', consentResult.consentUrl);
        window.location.href = consentResult.consentUrl;
        return {
          success: false,
          requiresConsent: true,
          consentUrl: consentResult.consentUrl,
          message: '추가 동의가 필요합니다. 동의 페이지로 이동합니다.'
        };
      } else {
        throw new Error(consentResult.error || '추가 동의 요청에 실패했습니다.');
      }
    }

    console.log('✅ 카카오톡 메시지 권한이 있습니다.');

    // 3. 스마트 전송 (권한 있으면 카카오톡, 없으면 대체 방식)
    console.log('3️⃣ 스마트 전송 중...');
    const sendResult = await sendWithFallback({
      accessToken,
      title,
      summary,
      url,
      receiverUuids,
      fallbackMethod
    });

    console.log('🎉 스마트 공유 완료:', sendResult);
    return sendResult;

  } catch (error) {
    console.error('❌ 스마트 공유 실패:', error);
    return {
      success: false,
      error: error.message || '스마트 공유에 실패했습니다.'
    };
  }
}

/**
 * 카카오톡 메시지 전송 권한 확인
 * @param {string} accessToken - 카카오 액세스 토큰
 * @returns {Promise<boolean>} 권한 여부
 */
async function checkKakaoPermission(accessToken) {
  try {
    const response = await fetch('/api/kakao/permissions/talk-message', {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('권한 확인 실패:', data.error);
      return false;
    }

    return data.hasPermission;
  } catch (error) {
    console.error('권한 확인 중 오류:', error);
    return false;
  }
}

/**
 * 추가 동의 요청
 * @param {string} accessToken - 카카오 액세스 토큰
 * @returns {Promise<Object>} 동의 요청 결과
 */
async function requestAdditionalConsent(accessToken) {
  try {
    const response = await fetch('/api/kakao/consent/additional', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['talk_message'])
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('추가 동의 요청 실패:', data.error);
      return {
        success: false,
        error: data.error
      };
    }

    return {
      success: true,
      consentUrl: data.consentUrl
    };
  } catch (error) {
    console.error('추가 동의 요청 중 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 스마트 전송 (권한 있으면 카카오톡, 없으면 대체 방식)
 * @param {Object} options - 전송 옵션
 * @returns {Promise<Object>} 전송 결과
 */
async function sendWithFallback(options) {
  try {
    const response = await fetch('/api/kakao/message/send-with-fallback', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${options.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: options.title,
        summary: options.summary,
        url: options.url,
        receiverUuids: options.receiverUuids,
        fallbackMethod: options.fallbackMethod
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('스마트 전송 실패:', data.error);
      return {
        success: false,
        error: data.error
      };
    }

    return {
      success: true,
      method: data.method,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    console.error('스마트 전송 중 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 사용 예제
 */
export const exampleUsage = {
  // 기본 사용법
  async basicExample() {
    const result = await smartShareNewsletter({
      accessToken: 'your_kakao_access_token',
      title: '오늘의 뉴스레터',
      summary: '주요 뉴스 요약입니다.',
      url: 'https://example.com/newsletter/123',
      fallbackMethod: 'email'
    });

    if (result.success) {
      console.log('공유 성공:', result.message);
    } else if (result.requiresConsent) {
      console.log('추가 동의 필요:', result.consentUrl);
    } else {
      console.error('공유 실패:', result.error);
    }
  },

  // 친구에게 전송
  async friendExample() {
    const result = await smartShareNewsletter({
      accessToken: 'your_kakao_access_token',
      title: '오늘의 뉴스레터',
      summary: '주요 뉴스 요약입니다.',
      url: 'https://example.com/newsletter/123',
      receiverUuids: ['friend_uuid_1', 'friend_uuid_2'],
      fallbackMethod: 'link'
    });

    console.log('친구 전송 결과:', result);
  }
};
