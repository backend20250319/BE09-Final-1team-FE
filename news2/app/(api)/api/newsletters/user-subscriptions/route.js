// 사용자 구독 목록 조회 API
export async function GET(request) {
  try {
    // 실제 환경에서는 사용자 인증 후 해당 사용자의 구독 목록을 데이터베이스에서 가져와야 합니다
    // 여기서는 시뮬레이션을 위해 빈 배열을 반환합니다
    
    // 사용자 인증 확인
    const authHeader = request.headers.get('authorization')
    
    // TODO: 실제 JWT 토큰 검증 로직 구현 필요
    // 현재는 토큰이 있으면 인증된 것으로 간주
    if (!authHeader) {
      console.log('인증 헤더 없음, 빈 구독 목록 반환')
      return Response.json([])
    }
    
    // 토큰에서 사용자 ID 추출 (실제로는 JWT 디코딩 필요)
    console.log('인증된 사용자 요청:', authHeader.substring(0, 20) + '...')

    // 백엔드 API 호출
    const backendUrl = process.env.NEWSLETTER_SERVICE_URL || 'http://localhost:8085'
    
    try {
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // 인증 토큰이 있으면 백엔드로 전달
      if (authHeader) {
        headers['Authorization'] = authHeader
      }
      
      const response = await fetch(`${backendUrl}/api/newsletter/subscription/my`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('백엔드 구독 목록 조회 실패:', errorData)
        return Response.json([])
      }

      const result = await response.json()
      
      console.log('백엔드 구독 목록 조회 성공:', result)
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const userSubscriptions = result.data?.map(subscription => ({
        id: subscription.id,
        title: `${subscription.preferredCategories?.join(', ') || '뉴스레터'} 구독`,
        category: subscription.preferredCategories?.[0] || '일반',
        frequency: subscription.frequency === 'DAILY' ? '매일' : 
                   subscription.frequency === 'WEEKLY' ? '주간' : 
                   subscription.frequency === 'MONTHLY' ? '월간' : '기타',
        status: subscription.status,
        subscribedAt: subscription.subscribedAt
      })) || []

      return Response.json(userSubscriptions)
    } catch (backendError) {
      console.error('백엔드 서비스 연결 실패, 빈 목록 반환:', backendError.message)
      return Response.json([])
    }

  } catch (error) {
    console.error('사용자 구독 목록 조회 실패:', error)
    return Response.json(
      { error: '구독 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
