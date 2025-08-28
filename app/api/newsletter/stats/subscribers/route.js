// 구독자 통계 조회 API
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  try {
    console.log('🔍 구독자 통계 조회 요청:', { category });
    
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
      // 인증이 없어도 백엔드에서 데이터 가져오기 시도
      console.log('🔄 인증 없이 백엔드 데이터 조회 시도');
    }

    // 사용할 토큰 결정 (헤더 우선, 없으면 쿠키)
    const token = authHeader ? authHeader.replace('Bearer ', '') : cookieToken
    const authHeaderValue = token ? `Bearer ${token}` : null

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

    // 특정 카테고리 요청이어도 전체 데이터를 가져와서 필터링
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/stats/subscribers`;
    
    console.log('🌐 백엔드 API 호출:', backendUrl);

    // 백엔드 API 호출 헤더 설정
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (authHeaderValue) {
      headers['Authorization'] = authHeaderValue;
    }

    // 백엔드 API 호출
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: headers
    })

    console.log('📡 백엔드 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 백엔드 에러 응답:', errorText);
      
      // 백엔드에서 401이나 다른 오류가 발생해도 빈 데이터 반환
      console.log('🔄 백엔드 오류로 인해 빈 데이터 반환');
      const emptyData = category ? { [category]: 0 } : {};
      return Response.json({
        success: true,
        data: emptyData
      })
    }

    const data = await response.json()
    console.log('✅ 백엔드 응답 성공:', data);
    console.log('🔍 백엔드 데이터 구조:', {
      hasData: !!data,
      hasDataData: !!data.data,
      hasSubscriberCounts: !!(data.data && data.data.subscriberCounts),
      subscriberCounts: data.data?.subscriberCounts
    });
    
    // 백엔드 응답이 비어있거나 유효하지 않은 경우 빈 데이터 반환
    if (!data || !data.data) {
      console.log('🔄 백엔드 응답이 비어있어 빈 데이터 반환');
      const emptyData = category ? { [category]: 0 } : {};
      return Response.json({
        success: true,
        data: emptyData
      })
    }
    
    // 백엔드 데이터를 프론트엔드 형식으로 매핑
    let mappedData = {};
    
    // 특정 카테고리 요청인 경우
    if (category) {
      // subscriberCounts에서 해당 카테고리 값 추출
      if (data.data.subscriberCounts && data.data.subscriberCounts[category] !== undefined) {
        mappedData = { [category]: data.data.subscriberCounts[category] };
      } else {
        mappedData = { [category]: 0 };
      }
    } else {
      // 전체 통계인 경우 subscriberCounts 사용
      if (data.data.subscriberCounts) {
        mappedData = data.data.subscriberCounts;
      }
    }
    
    console.log('🔄 매핑된 데이터:', mappedData);
    
    return Response.json({
      success: true,
      data: mappedData
    })
  } catch (error) {
    console.error('🚨 구독자 통계 조회 실패:', error)
    
    // 백엔드 연결 실패 시 빈 데이터 반환
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      console.log('🔄 백엔드 서버 연결 실패로 빈 데이터 반환');
    }
    
    // 에러 발생 시 빈 데이터 반환
    const emptyData = category ? { [category]: 0 } : {};
    return Response.json({
      success: true,
      data: emptyData
    })
  }
}


