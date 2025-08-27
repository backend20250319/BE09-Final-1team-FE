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
      // 인증이 없어도 더미 데이터 반환 (401 대신 200)
      const dummyData = generateDummySubscriberStats(category);
      return Response.json({
        success: true,
        data: dummyData
      })
    }

    // 사용할 토큰 결정 (헤더 우선, 없으면 쿠키)
    const token = authHeader ? authHeader.replace('Bearer ', '') : cookieToken
    const authHeaderValue = `Bearer ${token}`

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

    const backendUrl = category 
          ? `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/stats/subscribers/category/${backendCategory}`
    : `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/stats/subscribers`;
    
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
      const dummyData = generateDummySubscriberStats(category);
      return Response.json({
        success: true,
        data: dummyData
      })
    }

    const data = await response.json()
    console.log('✅ 백엔드 응답 성공:', data);
    
    // 백엔드 응답이 비어있거나 유효하지 않은 경우 더미 데이터 반환
    if (!data || !data.data) {
      console.log('🔄 백엔드 응답이 비어있어 더미 데이터 반환');
      const dummyData = generateDummySubscriberStats(category);
      return Response.json({
        success: true,
        data: dummyData
      })
    }
    
    return Response.json(data)
  } catch (error) {
    console.error('🚨 구독자 통계 조회 실패:', error)
    
    // 백엔드 연결 실패 시 더미 데이터 반환
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      console.log('🔄 백엔드 서버 연결 실패로 더미 데이터 반환');
    }
    
    const dummyData = generateDummySubscriberStats(category);
    return Response.json({
      success: true,
      data: dummyData
    })
  }
}

// 더미 구독자 통계 생성 함수 (임시 제거)
function generateDummySubscriberStats(category) {
  // 더미 데이터 제거 - 빈 객체 반환
  return {};
}
