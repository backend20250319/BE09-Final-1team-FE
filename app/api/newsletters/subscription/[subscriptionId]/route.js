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

// 구독 해지 API
export async function DELETE(request, { params }) {
  try {
    const { subscriptionId } = params;
    // 쿠키에서 액세스 토큰 가져오기
    const accessToken = cookies().get('access-token')?.value;
    
    console.log('🗑️ 구독 해지 요청:', { subscriptionId, hasAuth: !!accessToken });

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
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
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
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ 구독 해지 성공:', { subscriptionId });
    
    return Response.json({
      ...data,
      message: '구독이 성공적으로 해지되었습니다.'
    });

  } catch (error) {
    console.error('❌ 구독 해지 실패:', error);
    return Response.json(
      { 
        success: false,
        error: '구독 해지에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}