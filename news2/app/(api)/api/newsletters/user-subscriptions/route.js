// 사용자 구독 목록 조회 API
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return Response.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 백엔드 API 호출
    const response = await fetch('http://localhost:8085/api/newsletter/subscription/my', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const userSubscriptions = data.data?.map(subscription => ({
      id: subscription.id,
      userId: subscription.userId,
      email: subscription.email,
      status: subscription.status,
      frequency: subscription.frequency,
      preferredCategories: subscription.preferredCategories || [],
      keywords: subscription.keywords || [],
      sendTime: subscription.sendTime,
      isPersonalized: subscription.personalized,
      subscribedAt: subscription.subscribedAt,
      lastSentAt: subscription.lastSentAt,
      createdAt: subscription.createdAt,
      // 기존 호환성을 위한 필드들
      title: `${subscription.preferredCategories?.join(', ') || '뉴스레터'} 구독`,
      category: subscription.preferredCategories?.[0] || '일반'
    })) || []

    return Response.json(userSubscriptions)
  } catch (error) {
    console.error('사용자 구독 목록 조회 실패:', error)
    return Response.json(
      { 
        success: false,
        error: '구독 목록을 불러오는데 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
