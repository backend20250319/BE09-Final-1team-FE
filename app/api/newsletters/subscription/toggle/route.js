import { cookies } from 'next/headers';

// 백엔드 연결 상태 확인 함수
async function checkBackendHealth() {
  try {
    // 실제 작동하는 API 엔드포인트로 헬스 체크
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/stats/subscribers`;
    const response = await fetch(backendUrl, {
      method: 'GET',
      timeout: 5000 // 5초 타임아웃
    });
    return response.ok;
  } catch (error) {
    console.log('🔍 백엔드 헬스 체크 실패:', error.message);
    return false;
  }
}

// 구독 토글 API
export async function POST(request) {
  try {
    // 백엔드 연결 상태 먼저 확인
    const isBackendHealthy = await checkBackendHealth();
    if (!isBackendHealthy) {
      console.log('🔄 백엔드 서비스가 사용할 수 없음 - fallback 모드로 동작');
      return Response.json({
        success: false,
        error: '백엔드 서비스가 일시적으로 사용할 수 없습니다.',
        fallback: true
      }, { status: 503 });
    }

    const body = await request.json();
    const { category, isActive, email } = body;

    // 쿠키에서 액세스 토큰 가져오기
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    
    // 프론트엔드에서 전송한 이메일 사용
    const userEmail = email;
    
    console.log('🔄 구독 토글 요청:', { 
      category,
      isActive,
      email: userEmail,
      hasAuth: !!accessToken,
      tokenLength: accessToken?.length || 0
    });
    
    if (!accessToken) {
      console.log('❌ 인증 토큰 누락 - 쿠키에서 access-token을 찾을 수 없음');
      return Response.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    if (!userEmail) {
      console.log('❌ 사용자 이메일 정보 누락');
      return Response.json(
        { success: false, error: '사용자 이메일 정보를 가져올 수 없습니다.' },
        { status: 400 }
      );
    }

    if (!category) {
      return Response.json(
        { success: false, error: '카테고리 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 백엔드 카테고리명을 프론트엔드 카테고리명으로 변환
    const categoryMapping = {
      '정치': 'POLITICS',
      '경제': 'ECONOMY',
      '사회': 'SOCIETY',
      '생활': 'LIFE',
      '세계': 'INTERNATIONAL',
      'IT/과학': 'IT_SCIENCE',
      '자동차/교통': 'VEHICLE',
      '여행/음식': 'TRAVEL_FOOD',
      '예술': 'ART'
    };

    const backendCategory = categoryMapping[category] || category;

    if (isActive) {
      // 구독 요청 - 기존 구독 API와 동일한 방식 사용
      const subscribeUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscribe`;
      console.log('🔄 구독 요청:', {
        url: subscribeUrl,
        category: backendCategory,
        email: userEmail,
        hasToken: !!accessToken
      });

      const subscribeResponse = await fetch(subscribeUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          preferredCategories: [backendCategory],
          frequency: 'DAILY',
          emailNewsletter: true,
          kakaoNewsletter: false
        })
      });

      console.log('📡 구독 응답:', {
        status: subscribeResponse.status,
        statusText: subscribeResponse.statusText,
        ok: subscribeResponse.ok
      });

      if (!subscribeResponse.ok) {
        const errorText = await subscribeResponse.text();
        console.error('❌ 구독 실패:', { 
          status: subscribeResponse.status, 
          statusText: subscribeResponse.statusText,
          errorText
        });
        
        // 구독 제한 오류 처리
        if (subscribeResponse.status === 400 && errorText.includes('CATEGORY_LIMIT_EXCEEDED')) {
          return Response.json(
            { 
              success: false, 
              error: 'CATEGORY_LIMIT_EXCEEDED',
              message: '최대 3개 카테고리까지 구독할 수 있습니다.'
            },
            { status: 400 }
          );
        }
        
        return Response.json(
          { 
            success: false, 
            error: errorText || `구독 실패 (${subscribeResponse.status})`,
            status: subscribeResponse.status 
          },
          { status: subscribeResponse.status }
        );
      }

      const subscribeData = await subscribeResponse.json();
      console.log('✅ 구독 성공:', subscribeData);

      return Response.json({
        success: true,
        message: `${category} 카테고리를 구독했습니다.`,
        data: subscribeData
      });

    } else {
      // 구독 해제 요청 - 먼저 사용자의 구독 목록을 조회하여 해당 카테고리의 구독 ID를 찾음
      const mySubscriptionsUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/my`;
      console.log('🔄 구독 목록 조회:', {
        url: mySubscriptionsUrl,
        hasToken: !!accessToken
      });

      const subscriptionsResponse = await fetch(mySubscriptionsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!subscriptionsResponse.ok) {
        const errorText = await subscriptionsResponse.text();
        console.error('❌ 구독 목록 조회 실패:', { 
          status: subscriptionsResponse.status, 
          statusText: subscriptionsResponse.statusText,
          errorText
        });
        
        return Response.json(
          { 
            success: false, 
            error: errorText || `구독 목록 조회 실패 (${subscriptionsResponse.status})`,
            status: subscriptionsResponse.status 
          },
          { status: subscriptionsResponse.status }
        );
      }

      const subscriptionsData = await subscriptionsResponse.json();
      console.log('📋 구독 목록:', subscriptionsData);

      // 해당 카테고리의 구독을 찾음
      const targetSubscription = subscriptionsData.data?.find(sub => 
        sub.preferredCategories?.includes(backendCategory)
      );

      if (!targetSubscription) {
        console.log('❌ 해당 카테고리의 구독을 찾을 수 없음:', backendCategory);
        return Response.json(
          { 
            success: false, 
            error: '해당 카테고리의 구독을 찾을 수 없습니다.',
            status: 404 
          },
          { status: 404 }
        );
      }

      // 구독 해제 요청
      const unsubscribeUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/${targetSubscription.id}`;
      console.log('🔄 구독 해제 요청:', {
        url: unsubscribeUrl,
        subscriptionId: targetSubscription.id,
        category: backendCategory
      });

      const unsubscribeResponse = await fetch(unsubscribeUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 구독 해제 응답:', {
        status: unsubscribeResponse.status,
        statusText: unsubscribeResponse.statusText,
        ok: unsubscribeResponse.ok
      });

      if (!unsubscribeResponse.ok) {
        const errorText = await unsubscribeResponse.text();
        console.error('❌ 구독 해제 실패:', { 
          status: unsubscribeResponse.status, 
          statusText: unsubscribeResponse.statusText,
          errorText
        });
        
        return Response.json(
          { 
            success: false, 
            error: errorText || `구독 해제 실패 (${unsubscribeResponse.status})`,
            status: unsubscribeResponse.status 
          },
          { status: unsubscribeResponse.status }
        );
      }

      const unsubscribeData = await unsubscribeResponse.json();
      console.log('✅ 구독 해제 성공:', unsubscribeData);

      return Response.json({
        success: true,
        message: `${category} 카테고리 구독을 해제했습니다.`,
        data: unsubscribeData
      });
    }

  } catch (error) {
    console.error('❌ 구독 토글 실패:', error);
    
    // 네트워크 오류나 백엔드 연결 실패인 경우
    if (error.message.includes('fetch') || error.message.includes('network') || 
        error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.log('🔄 네트워크/백엔드 연결 실패');
      return Response.json(
        { 
          success: false,
          error: '백엔드 서비스에 연결할 수 없습니다.',
          fallback: true
        },
        { status: 503 }
      );
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
        error: '구독 상태 변경에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
