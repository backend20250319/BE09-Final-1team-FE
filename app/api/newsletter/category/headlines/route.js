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
      // 인증이 없어도 더미 데이터 반환 (401 대신 200)
      const dummyData = generateDummyHeadlines(category, limit);
      return Response.json({
        success: true,
        data: dummyData
      })
    }

    // 사용할 토큰 결정 (헤더 우선, 없으면 쿠키)
    const token = authHeader ? authHeader.replace('Bearer ', '') : cookieToken
    const authHeaderValue = `Bearer ${token}`

    const backendUrl = `http://localhost:8085/api/newsletter/category/${backendCategory}/headlines?limit=${limit}`;
    console.log('🌐 백엔드 API 호출:', backendUrl);

    // 백엔드 API 호출
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeaderValue,
        'Content-Type': 'application/json',
      }
    })

    console.log('📡 백엔드 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 백엔드 에러 응답:', errorText);
      
      // 백엔드에서 401이나 다른 오류가 발생해도 더미 데이터 반환
      console.log('🔄 백엔드 오류로 인해 더미 데이터 반환');
      const dummyData = generateDummyHeadlines(category, limit);
      return Response.json({
        success: true,
        data: dummyData
      })
    }

    const data = await response.json()
    console.log('✅ 백엔드 응답 성공:', data);
    
    // 백엔드 응답이 비어있거나 유효하지 않은 경우 더미 데이터 반환
    if (!data || !data.data || data.data.length === 0) {
      console.log('🔄 백엔드 응답이 비어있어 더미 데이터 반환');
      const dummyData = generateDummyHeadlines(category, limit);
      return Response.json({
        success: true,
        data: dummyData
      })
    }
    
    // 백엔드에서 헤드라인 데이터를 받았지만 조회수가 없는 경우, 구독자 통계를 가져와서 조회수로 설정
    let headlinesData = data.data;
    if (Array.isArray(headlinesData) && headlinesData.length > 0 && !headlinesData[0].views) {
      console.log('🔄 헤드라인에 조회수 정보가 없어 구독자 통계를 조회수로 설정');
      
      try {
        // 구독자 통계 API 호출
        const statsResponse = await fetch(`http://localhost:8085/api/newsletter/stats/subscribers/category/${backendCategory}`, {
          method: 'GET',
          headers: {
            'Authorization': authHeaderValue,
            'Content-Type': 'application/json',
          }
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
    // 에러 발생 시에도 더미 데이터 반환
    const dummyData = generateDummyHeadlines(category, limit);
    return Response.json({
      success: true,
      data: dummyData
    })
  }
}

// 더미 헤드라인 생성 함수 (임시 제거)
function generateDummyHeadlines(category, limit = 5) {
  // 더미 데이터 제거 - 빈 배열 반환
  return [];
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

// 더미 구독자 통계 생성 함수 (임시 제거)
function generateDummySubscriberStats(category) {
  // 더미 데이터 제거 - 빈 객체 반환
  return {};
}
