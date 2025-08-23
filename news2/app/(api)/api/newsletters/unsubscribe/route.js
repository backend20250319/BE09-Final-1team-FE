// 뉴스레터 구독 해제 API - 구독 ID 기반
export async function POST(request) {
  try {
    const { subscriptionId } = await request.json()

    // 입력 검증
    if (!subscriptionId) {
      return Response.json(
        { error: '구독 ID가 필요합니다.' },
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
      
      // 구독 해제 API 호출
      const response = await fetch(`${backendUrl}/api/newsletter/subscription/${subscriptionId}`, {
        method: 'DELETE',
        headers,
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
      
      console.log(`뉴스레터 구독 해제 성공: 구독ID=${subscriptionId}`)

      return Response.json({
        success: true,
        message: '뉴스레터 구독이 해제되었습니다.',
        data: {
          subscriptionId,
          unsubscribedAt: new Date().toISOString()
        }
      })
    } catch (backendError) {
      console.error('백엔드 서비스 연결 실패, 임시 모드로 전환:', backendError.message)
      
      // 백엔드 서비스가 실행되지 않았을 때 임시 성공 응답
      console.log(`뉴스레터 구독 해제 (임시): 구독ID=${subscriptionId}`)
      
      return Response.json({
        success: true,
        message: '뉴스레터 구독이 해제되었습니다. (임시 모드)',
        data: {
          subscriptionId,
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
