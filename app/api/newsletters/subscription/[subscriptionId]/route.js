import { cookies } from 'next/headers';

// 구독 정보 조회 API
export async function GET(request, { params }) {
  try {
    const { subscriptionId } = params;
    // 쿠키에서 액세스 토큰 가져오기
   const cookieStore = await cookies();
   const accessToken = cookieStore.get('access-token')?.value;
    
    console.log('🔍 구독 정보 조회 요청:', { subscriptionId, hasAuth: !!accessToken });

    if (!accessToken) {
      console.log('❌ 인증 토큰 누락');
      return Response.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    if (!subscriptionId) {
      console.log('❌ 구독 ID 누락');
      return Response.json(
        { success: false, error: '구독 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 백엔드 API 호출
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 백엔드 구독 조회 API 실패:', { 
        status: response.status, 
        statusText: response.statusText,
        errorText,
        subscriptionId
      });
      
      if (response.status === 404) {
        return Response.json(
          { success: false, error: '구독 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ 구독 정보 조회 성공:', { subscriptionId });
    
    return Response.json(data);

  } catch (error) {
    console.error('❌ 구독 정보 조회 실패:', error);
    return Response.json(
      { 
        success: false,
        error: '구독 정보를 조회하는데 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// 구독 해지 API (GET과 DELETE 모두 지원)
export async function DELETE(request, { params }) {
  try {
    const { subscriptionId } = params;
    // 쿠키에서 액세스 토큰 가져오기
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    
    console.log('🗑️ 구독 해지 요청:', { subscriptionId, hasAuth: !!accessToken });

    if (!subscriptionId) {
      console.log('❌ 구독 ID 누락');
      return Response.json(
        { success: false, error: '구독 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 백엔드 API 호출
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/${subscriptionId}`;
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 백엔드 구독 해지 API 실패:', { 
        status: response.status, 
        statusText: response.statusText,
        errorText,
        subscriptionId
      });
      
      if (response.status === 404) {
        return Response.json(
          { success: false, error: '구독 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      if (response.status === 403) {
        return Response.json(
          { success: false, error: '이 구독을 해지할 권한이 없습니다.' },
          { status: 403 }
        );
      }
      
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
    console.log('✅ 구독 해지 성공:', { subscriptionId });
    
    // 성공 응답에 추가 정보 포함
    return Response.json({
      ...data,
      success: true,
      message: '뉴스레터 구독이 해제되었습니다.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 구독 해지 실패:', error);
    return Response.json(
      { 
        success: false,
        error: '뉴스레터 구독 해제에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}