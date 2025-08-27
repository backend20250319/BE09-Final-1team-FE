// 카테고리별 헤드라인 조회 API
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') || 5;
    
    console.log('🔍 헤드라인 조회 요청:', { category, limit });
    
    if (!category) {
      return Response.json(
        { success: false, error: '카테고리가 필요합니다.' },
        { status: 400 }
      )
    }

    // 프론트엔드 카테고리명을 백엔드 카테고리명으로 매핑
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
    console.log('🔄 카테고리 매핑:', { frontend: category, backend: backendCategory });

    // 클라이언트에서 전달받은 인증 헤더 가져오기
    const authHeader = request.headers.get('authorization')
    console.log('🔑 Authorization 헤더 존재:', !!authHeader);

    // 쿠키에서 토큰 가져오기
    const cookies = request.headers.get('cookie')
    let cookieToken = null
    if (cookies) {
      const tokenMatch = cookies.match(/accessToken=([^;]+)/)
      if (tokenMatch) {
        cookieToken = tokenMatch[1]
        console.log('🍪 쿠키 토큰 존재:', !!cookieToken);
      }
    }

    // Authorization 헤더나 쿠키에서 토큰을 찾지 못한 경우
    if (!authHeader && !cookieToken) {
      console.log('❌ 인증 토큰이 없음 (헤더와 쿠키 모두)');
      // 인증이 없어도 백엔드 호출 시도 (토큰 없이)
      console.log('🔄 인증 없이 백엔드 호출 시도');
    }

    // 사용할 토큰 결정 (헤더 우선, 없으면 쿠키)
    const token = authHeader ? authHeader.replace('Bearer ', '') : cookieToken
    const authHeaderValue = token ? `Bearer ${token}` : null

    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/category/${backendCategory}/headlines?limit=${limit}`;
    console.log('🌐 백엔드 API 호출:', backendUrl);

    // 백엔드 API 호출 (토큰이 있으면 헤더에 포함, 없으면 제외)
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (authHeaderValue) {
      headers['Authorization'] = authHeaderValue;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers
    })

    console.log('📡 백엔드 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 백엔드 에러 응답:', errorText);
      
      // 백엔드에서 401이나 다른 오류가 발생하면 빈 배열 반환
      console.log('🔄 백엔드 오류로 인해 빈 배열 반환');
      return Response.json({
        success: true,
        data: []
      })
    }

    const data = await response.json()
    console.log('✅ 백엔드 응답 성공:', data);
    
    // 백엔드 응답이 비어있거나 유효하지 않은 경우 빈 배열 반환
    if (!data || !data.data || data.data.length === 0) {
      console.log('🔄 백엔드 응답이 비어있어 빈 배열 반환');
      return Response.json({
        success: true,
        data: []
      })
    }
    
    // 백엔드 데이터를 프론트엔드 형식으로 변환
    let headlinesData = data.data.map(headline => ({
      ...headline,
      // publishedAt을 time으로 변환
      time: formatTimeAgo(headline.publishedAt),
      // 기존 publishedAt도 유지
      publishedAt: headline.publishedAt
    }));
    if (Array.isArray(headlinesData) && headlinesData.length > 0 && !headlinesData[0].views) {
      console.log('🔄 헤드라인에 조회수 정보가 없어 구독자 통계를 조회수로 설정');
      
      try {
        // 구독자 통계 API 호출
        const statsHeaders = {
          'Content-Type': 'application/json',
        };
        
        if (authHeaderValue) {
          statsHeaders['Authorization'] = authHeaderValue;
        }
        
        const statsResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/stats/subscribers/category/${backendCategory}`, {
          method: 'GET',
          headers: statsHeaders
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          const subscriberCount = statsData.data?.subscriberCount || statsData.data?.activeSubscribers || 5000;
          
          // 헤드라인에 조회수 정보 추가
          headlinesData = headlinesData.map((headline, index) => ({
            ...headline,
            views: formatSubscriberCount(subscriberCount * (0.9 - index * 0.1)) // 시간순으로 조회수 감소
          }));
        }
      } catch (error) {
        console.warn('구독자 통계 조회 실패, 기본 조회수 사용:', error);
        // 구독자 통계 조회 실패 시 기본 조회수 설정
        headlinesData = headlinesData.map((headline, index) => ({
          ...headline,
          views: formatSubscriberCount(5000 * (0.9 - index * 0.1))
        }));
      }
    }
    
    return Response.json({
      success: true,
      data: headlinesData
    })
  } catch (error) {
    console.error('🚨 헤드라인 조회 실패:', error)
    // 에러 발생 시에도 빈 배열 반환
    return Response.json({
      success: true,
      data: []
    })
  }
}



// 시간 포맷팅 함수 (몇 시간/일 전)
function formatTimeAgo(dateString) {
  if (!dateString) return '최근';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays}일 전`;
    } else if (diffInHours > 0) {
      return `${diffInHours}시간 전`;
    } else {
      return '방금 전';
    }
  } catch (error) {
    console.warn('시간 포맷팅 실패:', error);
    return '최근';
  }
}

// 구독자 수 포맷팅 함수
function formatSubscriberCount(count) {
  if (count >= 10000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return count.toString();
  }
}


