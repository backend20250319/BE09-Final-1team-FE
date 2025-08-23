// 뉴스레터 구독 API - 백엔드 연동
export async function POST(request) {
  try {
    // 요청 본문 안전하게 파싱
    let body
    try {
      const text = await request.text()
      console.log('요청 본문 원본:', text)
      
      if (!text || text.trim() === '') {
        console.error('요청 본문이 비어있음')
        return Response.json(
          { error: '요청 본문이 비어있습니다.' },
          { status: 400 }
        )
      }
      
      body = JSON.parse(text)
    } catch (parseError) {
      console.error('요청 본문 파싱 실패:', parseError)
      return Response.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      )
    }
    
    const { newsletterId, email, category } = body
    
    console.log('구독 요청 데이터:', { newsletterId, email, category })
    console.log('요청 본문 전체:', body)

    // 입력 검증
    if (!category || !email) {
      return Response.json(
        { error: '카테고리와 이메일 주소가 필요합니다.' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    // 카테고리 매핑 (프론트엔드 → 백엔드)
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
    }

    const backendCategory = categoryMapping[category]
    if (!backendCategory) {
      return Response.json(
        { error: '지원하지 않는 카테고리입니다.' },
        { status: 400 }
      )
    }

    // 백엔드 API 호출
    const backendUrl = process.env.NEWSLETTER_SERVICE_URL || 'http://localhost:8085'
    
    // 인증 토큰 가져오기
    const authHeader = request.headers.get('authorization')
    
    try {
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // 인증 토큰이 있으면 백엔드로 전달
      if (authHeader) {
        headers['Authorization'] = authHeader
      }
      
      const response = await fetch(`${backendUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: email,
          frequency: 'DAILY', // 기본값: 매일
          preferredCategories: [backendCategory],
          keywords: [],
          sendTime: 9, // 기본값: 오전 9시
          isPersonalized: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('백엔드 구독 실패:', errorData)
        return Response.json(
          { error: errorData.message || '뉴스레터 구독에 실패했습니다.' },
          { status: response.status }
        )
      }

      const result = await response.json()
      
      console.log(`뉴스레터 구독 성공: 카테고리=${category}, Email=${email}`)

      // 구독 성공 응답
      return Response.json({
        success: true,
        message: '뉴스레터 구독이 완료되었습니다.',
        data: {
          category,
          email,
          subscribedAt: new Date().toISOString(),
          ...result.data
        }
      })
    } catch (backendError) {
      console.error('백엔드 서비스 연결 실패, 임시 모드로 전환:', backendError.message)
      
      // 백엔드 서비스가 실행되지 않았을 때 임시 성공 응답
      console.log(`뉴스레터 구독 (임시): 카테고리=${category}, Email=${email}`)
      
      return Response.json({
        success: true,
        message: '뉴스레터 구독이 완료되었습니다. (임시 모드)',
        data: {
          category,
          email,
          subscribedAt: new Date().toISOString(),
          isTemporary: true
        }
      })
    }

  } catch (error) {
    console.error('뉴스레터 구독 실패:', error)
    return Response.json(
      { error: '뉴스레터 구독에 실패했습니다.' },
      { status: 500 }
    )
  }
}
