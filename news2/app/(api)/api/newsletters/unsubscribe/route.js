// 뉴스레터 구독 해제 API - 카테고리 기반
export async function POST(request) {
  try {
    const { category } = await request.json()

    // 입력 검증
    if (!category) {
      return Response.json(
        { error: '카테고리가 필요합니다.' },
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

    // 백엔드 API 호출 (구독 해제 API가 구현되면 활성화)
    const backendUrl = process.env.NEWSLETTER_SERVICE_URL || 'http://localhost:8085'
    
    try {
      // TODO: 백엔드에 구독 해제 API가 구현되면 아래 코드 활성화
      /*
      const response = await fetch(`${backendUrl}/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: backendCategory,
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('백엔드 구독 해제 실패:', errorData)
        return Response.json(
          { error: errorData.message || '뉴스레터 구독 해제에 실패했습니다.' },
          { status: response.status }
        )
      }

      const result = await response.json()
      */
      
      console.log(`뉴스레터 구독 해제 (임시): 카테고리=${category}`)

      // 구독 해제 성공 응답 (임시)
      return Response.json({
        success: true,
        message: '뉴스레터 구독이 해제되었습니다. (임시 모드)',
        data: {
          category,
          unsubscribedAt: new Date().toISOString(),
          isTemporary: true
        }
      })
    } catch (backendError) {
      console.error('백엔드 서비스 연결 실패, 임시 모드로 전환:', backendError.message)
      
      // 백엔드 서비스가 실행되지 않았을 때 임시 성공 응답
      console.log(`뉴스레터 구독 해제 (임시): 카테고리=${category}`)
      
      return Response.json({
        success: true,
        message: '뉴스레터 구독이 해제되었습니다. (임시 모드)',
        data: {
          category,
          unsubscribedAt: new Date().toISOString(),
          isTemporary: true
        }
      })
    }

  } catch (error) {
    console.error('뉴스레터 구독 해제 실패:', error)
    return Response.json(
      { error: '뉴스레터 구독 해제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
