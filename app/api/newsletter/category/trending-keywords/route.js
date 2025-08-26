// 카테고리별 트렌드 키워드 조회 API (쿼리 파라미터 방식)

// 더미 트렌드 키워드 생성 함수
function generateDummyTrendingKeywords(category, limit = 8) {
  // console.log('🔍 더미 키워드 생성 요청:', { category, limit });
  
  const categoryKeywords = {
    '정치': ['총선', '국회', '정책', '여야', '민주당', '국민의힘', '정치개혁', '외교'],
    '경제': ['주식', '부동산', '금리', '인플레이션', 'GDP', '투자', '경제정책', '환율'],
    '사회': ['교육', '의료', '복지', '범죄', '사건사고', '사회문제', '인권', '환경'],
    '생활': ['건강', '요리', '쇼핑', '여행', '취미', '가족', '육아', '반려동물'],
    '세계': ['미국', '중국', '일본', 'EU', 'UN', '국제관계', '글로벌경제', '외교'],
    'IT/과학': ['AI', '빅데이터', '클라우드', '블록체인', '5G', '반도체', '스타트업', '메타버스'],
    '자동차/교통': ['전기차', '자율주행', '테슬라', '현대차', '교통정책', '대중교통', '친환경차', '모빌리티'],
    '여행/음식': ['해외여행', '국내여행', '맛집', '카페', '호텔', '항공', '관광지', '음식문화'],
    '예술': ['영화', '음악', '미술', '문학', '공연', '전시', '문화', '엔터테인먼트']
  };

  const keywords = categoryKeywords[category] || ['트렌드', '인기', '주목', '화제', '이슈', '뉴스', '정보', '소식'];
  
  // console.log('🔍 카테고리별 키워드 매칭:', { 
  //   category, 
  //   hasCategoryKeywords: !!categoryKeywords[category], 
  //   selectedKeywords: keywords 
  // });
  
  return keywords.slice(0, limit).map((keyword, index) => ({
    keyword,
    rank: index + 1,
    diff: Math.floor(Math.random() * 5) - 2, // -2 ~ 2 사이의 랜덤 값
    category: category
  }));
}

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
    // console.log('🔑 Authorization 헤더 존재:', !!authHeader);

    // 쿠키에서 토큰 가져오기
    const cookies = request.headers.get('cookie')
    let cookieToken = null
    if (cookies) {
      const tokenMatch = cookies.match(/accessToken=([^;]+)/)
      if (tokenMatch) {
        cookieToken = tokenMatch[1]
        // console.log('🍪 쿠키 토큰 존재:', !!cookieToken);
      }
    }

    // Authorization 헤더나 쿠키에서 토큰을 찾지 못한 경우
    if (!authHeader && !cookieToken) {
      // console.log('❌ 인증 토큰이 없음 (헤더와 쿠키 모두)');
      // 인증이 없어도 카테고리별 더미 데이터 반환 (401 대신 200)
      const dummyData = generateDummyTrendingKeywords(category, limit);
      // console.log('🔄 인증 없이 더미 데이터 반환:', dummyData);
      return Response.json({
        success: true,
        data: dummyData
      })
    }

    // 사용할 토큰 결정 (헤더 우선, 없으면 쿠키)
    const token = authHeader ? authHeader.replace('Bearer ', '') : cookieToken
    const authHeaderValue = `Bearer ${token}`

    const backendUrl = `http://localhost:8085/api/newsletter/category/${backendCategory}/trending-keywords?limit=${limit}`;
    // console.log('🌐 백엔드 API 호출:', backendUrl);

    // 백엔드 API 호출
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeaderValue,
        'Content-Type': 'application/json',
      }
    })

    // console.log('📡 백엔드 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      // console.error('❌ 백엔드 에러 응답:', errorText);
      
      // 백엔드에서 401이나 다른 오류가 발생해도 더미 데이터 반환
      // console.log('🔄 백엔드 오류로 인해 더미 데이터 반환');
      const dummyData = generateDummyTrendingKeywords(category, limit);
      return Response.json({
        success: true,
        data: dummyData
      })
    }

    const data = await response.json()
    // console.log('✅ 백엔드 응답 성공:', data);
    
    // 백엔드 응답이 비어있거나 유효하지 않은 경우 더미 데이터 반환
    if (!data || !data.data || data.data.length === 0) {
      // console.log('🔄 백엔드 응답이 비어있어 카테고리별 더미 데이터 반환');
      const dummyData = generateDummyTrendingKeywords(category, limit);
      // console.log('🔄 백엔드 빈 응답으로 더미 데이터 반환:', dummyData);
      return Response.json({
        success: true,
        data: dummyData
      })
    }
    
    return Response.json(data)
  } catch (error) {
    // console.error('🚨 트렌드 키워드 조회 실패:', error)
    // 에러 발생 시에도 더미 데이터 반환
    const dummyData = generateDummyTrendingKeywords(category, limit);
    return Response.json({
      success: true,
      data: dummyData
    })
  }
}
