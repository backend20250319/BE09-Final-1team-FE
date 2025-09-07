import { cookies } from 'next/headers';

// 백엔드 연결 상태 확인 함수
async function checkBackendHealth() {
  try {
    // 실제 작동하는 API 엔드포인트로 헬스 체크
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/stats/subscribers`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃으로 단축
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('🔍 백엔드 헬스 체크 실패:', error.message);
    // 헬스 체크 실패해도 구독 조회는 시도하도록 true 반환
    return true;
  }
}

// 사용자 구독 목록 조회 API
export async function GET(request) {
  try {
    // 백엔드 연결 상태 확인 (헬스 체크 실패해도 구독 조회 시도)
    const isBackendHealthy = await checkBackendHealth();
    if (!isBackendHealthy) {
      console.log('🔄 백엔드 헬스 체크 실패 - 구독 조회 시도 계속 진행');
    }

    // 쿠키에서 액세스 토큰 가져오기
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value || 
                       cookieStore.get('token')?.value ||
                       cookieStore.get('accessToken')?.value;
    
    console.log('📋 사용자 구독 목록 조회 요청:', { 
      hasAuth: !!accessToken,
      tokenLength: accessToken?.length || 0,
      allCookies: cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    });
    
    if (!accessToken) {
      console.log('❌ 인증 토큰 누락 - 쿠키에서 access-token을 찾을 수 없음');
      
      // 개발 환경에서는 기본 토큰 사용
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        console.log('🔧 개발 환경에서 기본 토큰 사용');
        // 토큰이 없어도 구독 조회 시도는 계속 진행
      } else {
        return Response.json(
          { success: false, error: '인증이 필요합니다.' },
          { status: 401 }
        );
      }
    }
    const authHeader = `Bearer ${accessToken}`

    // 백엔드 API 호출
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/my`;
    console.log('🔄 백엔드 API 호출:', {
      url: backendUrl,
      hasToken: !!accessToken,
      tokenPrefix: accessToken?.substring(0, 20) + '...'
    });

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken || 'dev-token-for-testing'}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 백엔드 API 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 백엔드 구독 목록 API 실패:', { 
        status: response.status, 
        statusText: response.statusText,
        errorText,
        url: backendUrl
      });
      
      // 500 에러인 경우 빈 구독 목록을 반환 (fallback)
      if (response.status === 500) {
        console.log('🔄 백엔드 500 에러 - 빈 구독 목록 반환 (fallback)');
        return Response.json({
          success: true,
          data: [],
          metadata: {
            total: 0,
            timestamp: new Date().toISOString(),
            fallback: true,
            message: '백엔드 서비스가 일시적으로 사용할 수 없습니다.'
          }
        });
      }
      
      // 기타 오류는 그대로 전달
      return Response.json(
        { 
          success: false, 
          error: errorText || `백엔드 API 오류 (${response.status})`,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('📡 백엔드 응답:', data);
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const userSubscriptions = data.data?.map(subscription => {
      // 활성 구독만 필터링
      if (!subscription.isActive) {
        return null;
      }
      
      return {
        id: subscription.categoryId,
        userId: subscription.userId || 1,
        email: subscription.email || 'user@example.com',
        status: subscription.isActive ? 'ACTIVE' : 'INACTIVE',
        frequency: 'DAILY',
        preferredCategories: [subscription.categoryName],
        keywords: subscription.keywords || [],
        sendTime: subscription.sendTime,
        isPersonalized: subscription.isPersonalized || true,
        subscribedAt: subscription.subscribedAt,
        lastSentAt: subscription.lastSentAt,
        createdAt: subscription.createdAt,
        // 기존 호환성을 위한 필드들
        title: `${subscription.categoryNameKo} 뉴스레터 구독`,
        category: subscription.categoryNameKo,
        // 백엔드 원본 데이터 보존
        _backendData: subscription
      };
    }).filter(Boolean) || [];

    console.log('✅ 구독 목록 조회 성공:', { 
      count: userSubscriptions.length,
      subscriptions: userSubscriptions.map(sub => ({
        id: sub.id,
        category: sub.category,
        preferredCategories: sub.preferredCategories,
        isActive: sub.status === 'ACTIVE'
      }))
    });

    return Response.json({
      success: true,
      data: userSubscriptions,
      metadata: {
        total: userSubscriptions.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 사용자 구독 목록 조회 실패:', error);
    
    // 네트워크 오류나 백엔드 연결 실패인 경우 fallback 처리
    if (error.message.includes('fetch') || error.message.includes('network') || 
        error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.log('🔄 네트워크/백엔드 연결 실패 - 빈 구독 목록 반환 (fallback)');
      return Response.json({
        success: true,
        data: [],
        metadata: {
          total: 0,
          timestamp: new Date().toISOString(),
          fallback: true,
          message: '백엔드 서비스에 연결할 수 없습니다.'
        }
      });
    }
    
    // 인증 관련 오류인 경우 401 반환
    if (error.message.includes('인증') || error.message.includes('401')) {
      return Response.json(
        { 
          success: false,
          error: '인증이 필요합니다.',
          details: error.message 
        },
        { status: 401 }
      );
    }
    
    return Response.json(
      { 
        success: false,
        error: '구독 목록을 불러오는데 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}