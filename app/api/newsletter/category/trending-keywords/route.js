// 카테고리별 트렌드 키워드 조회 API (쿼리 파라미터 방식)



export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') || 8;
    
    // console.log('🔍 트렌드 키워드 조회 요청:', { category, limit });
    
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
    // console.log('🔄 카테고리 매핑:', { frontend: category, backend: backendCategory });

    // 클라이언트에서 전달받은 인증 헤더 가져오기
    const authHeader = request.headers.get('authorization')

    // 쿠키에서 토큰 가져오기
    const cookies = request.headers.get('cookie')
    let cookieToken = null
    if (cookies) {
      const tokenMatch = cookies.match(/accessToken=([^;]+)/)
      if (tokenMatch) {
        cookieToken = tokenMatch[1]
      }
    }

    // Authorization 헤더나 쿠키에서 토큰을 찾지 못한 경우
    if (!authHeader && !cookieToken) {
      // console.log('❌ 인증 토큰이 없음 (헤더와 쿠키 모두)');
      // 인증이 없어도 실제 데이터 반환 시도
      // console.log('🔄 인증 없이 실제 데이터 반환 시도');
    }

    // 사용할 토큰 결정 (헤더 우선, 없으면 쿠키)
    const token = authHeader ? authHeader.replace('Bearer ', '') : cookieToken
    const authHeaderValue = `Bearer ${token}`

    const backendUrl = `http://localhost:8082/api/trending/trending-keywords/category/${backendCategory}?limit=${limit}&hours=24`;
    // console.log('🌐 백엔드 API 호출:', backendUrl);

    // 백엔드 API 호출 (URL 인코딩 문제로 인해 폴백 데이터 사용)
    // console.log('🌐 백엔드 API 호출 시작:', backendUrl);
    // console.log('🔍 백엔드 카테고리 확인:', backendCategory);
    
    // 백엔드 API 호출 시도
    try {
      console.log(`🔄 백엔드 API 호출 시작: ${backendCategory}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25초 타임아웃
      
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeaderValue,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // console.log('📡 백엔드 응답 상태:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${backendCategory} 백엔드 응답 성공:`, data.data?.length || 0, '개 키워드');
        
        if (data.success && data.data && Array.isArray(data.data)) {
          return Response.json(data);
        } else {
          console.log(`🔄 ${backendCategory} 백엔드 응답이 유효하지 않아 빈 배열 반환`);
          return Response.json({
            success: true,
            data: []
          });
        }
      } else {
        console.log(`🔄 ${backendCategory} 백엔드 오류 (${response.status})로 인해 빈 배열 반환`);
        return Response.json({
          success: true,
          data: []
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`🚨 ${backendCategory} 백엔드 API 호출 타임아웃`);
      } else {
        console.error(`🚨 ${backendCategory} 백엔드 API 호출 실패:`, error);
      }
      return Response.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('🚨 트렌드 키워드 조회 실패:', error)
    // 에러 발생 시에도 빈 배열 반환
    return Response.json({
      success: true,
      data: []
    })
  }
}
