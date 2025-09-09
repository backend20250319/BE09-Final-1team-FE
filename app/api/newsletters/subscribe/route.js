import { cookies } from 'next/headers';

// 뉴스레터 구독 API
export async function POST(request) {
  try {
    // 쿠키에서 액세스 토큰 가져오기
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;

    const body = await request.json();
    const { email, frequency, preferredCategories } = body;

    console.log('📧 뉴스레터 구독 요청:', { email, frequency, preferredCategories, hasAuth: !!accessToken });

    if (!email || !preferredCategories) {
      return Response.json(
        { success: false, error: '이메일과 선호 카테고리가 필요합니다.' },
        { status: 400 }
      );
    }

    // 기존 구독 정보 확인 (인증된 사용자만)
    let existingSubscriptions = [];
    if (accessToken) {
      try {
        const subscriptionsResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/my`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        });

        if (subscriptionsResponse.ok) {
          const subscriptionsData = await subscriptionsResponse.json();
          if (subscriptionsData.success && subscriptionsData.data) {
            existingSubscriptions = subscriptionsData.data;
          }
        }
      } catch (error) {
        console.warn('⚠️ 기존 구독 정보 조회 실패:', error);
      }
    }

    // 기존 구독에서 카테고리 수집
    const existingCategories = [];
    existingSubscriptions.forEach(sub => {
      if (sub.preferredCategories && Array.isArray(sub.preferredCategories)) {
        existingCategories.push(...sub.preferredCategories);
      }
    });

    // 중복 제거
    const uniqueExistingCategories = [...new Set(existingCategories)];
    
    // 새로 구독할 카테고리들
    const newCategories = Array.isArray(preferredCategories) ? preferredCategories : [preferredCategories];
    
    // 이미 구독 중인 카테고리 필터링
    const categoriesToAdd = newCategories.filter(cat => !uniqueExistingCategories.includes(cat));
    
    // 최대 3개 제한 확인
    const totalCategories = uniqueExistingCategories.length + categoriesToAdd.length;
    
    if (totalCategories > 3) {
      return Response.json(
        { 
          success: false,
          error: '최대 3개 카테고리까지 구독할 수 있습니다. 다른 카테고리 구독을 해제한 후 다시 시도해주세요.',
          details: {
            current: uniqueExistingCategories.length,
            requested: categoriesToAdd.length,
            limit: 3
          }
        },
        { status: 400 }
      );
    }

    let response;

    // 기존 구독이 있으면 업데이트, 없으면 새로 생성
    if (existingSubscriptions.length > 0 && accessToken) {
      console.log('🔄 기존 구독 업데이트 처리');
      
      // 기존 구독에 새로운 카테고리 추가
      const updatedCategories = [...uniqueExistingCategories, ...categoriesToAdd];
      
      // 기존 구독을 모두 삭제하고 새로운 구독으로 대체
      for (const existingSub of existingSubscriptions) {
        try {
          await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/${existingSub.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            }
          });
        } catch (error) {
          console.warn('⚠️ 기존 구독 삭제 실패:', error);
        }
      }
      
      // 새로운 구독 생성 (모든 카테고리 포함)
      response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          email,
          frequency: frequency || 'DAILY',
          preferredCategories: updatedCategories
        })
      });
    } else {
      console.log('✨ 새로운 구독 생성');
      
      // 새로운 구독 생성
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscribe`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email,
          frequency: frequency || 'DAILY',
          preferredCategories: categoriesToAdd.length > 0 ? categoriesToAdd : newCategories
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 백엔드 구독 API 실패:', { 
        status: response.status, 
        statusText: response.statusText,
        errorText 
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ 뉴스레터 구독 성공:', data);
    
    // 성공 응답에 추가 정보 포함
    return Response.json({
      ...data,
      success: true,
      message: '뉴스레터 구독이 완료되었습니다.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 뉴스레터 구독 실패:', error);
    return Response.json(
      { 
        success: false,
        error: '뉴스레터 구독에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}