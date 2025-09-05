import { cookies } from 'next/headers';

// 사용자 구독 목록 조회 API
export async function GET(request) {
  try {
    // 쿠키에서 액세스 토큰 가져오기
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    
    console.log('📋 사용자 구독 목록 조회 요청:', { hasAuth: !!accessToken });
    
    if (!accessToken) {
      console.log('❌ 인증 토큰 누락');
      return Response.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 백엔드 API 호출
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/my`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 백엔드 구독 목록 API 실패:', { 
        status: response.status, 
        statusText: response.statusText,
        errorText 
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📡 백엔드 응답:', data);
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const userSubscriptions = data.data?.map(subscription => ({
      id: subscription.id,
      userId: subscription.userId,
      email: subscription.email,
      status: subscription.status,
      frequency: subscription.frequency,
      preferredCategories: subscription.preferredCategories || [],
      keywords: subscription.keywords || [],
      sendTime: subscription.sendTime,
      isPersonalized: subscription.personalized,
      subscribedAt: subscription.subscribedAt,
      lastSentAt: subscription.lastSentAt,
      createdAt: subscription.createdAt,
      // 기존 호환성을 위한 필드들
      title: `${subscription.preferredCategories?.join(', ') || '뉴스레터'} 구독`,
      category: subscription.preferredCategories?.[0] || '일반'
    })) || [];

    console.log('✅ 구독 목록 조회 성공:', { count: userSubscriptions.length });

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