// 뉴스레터 구독 해제 API
export async function POST(request) {
  try {
    const { newsletterId } = await request.json()

    // 입력 검증
    if (!newsletterId) {
      return Response.json(
        { error: '뉴스레터 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 실제 환경에서는 데이터베이스에서 구독 정보를 삭제해야 합니다
    // 여기서는 시뮬레이션을 위해 성공 응답을 반환합니다
    
    console.log(`뉴스레터 구독 해제: ID=${newsletterId}`)

    // 구독 해제 성공 응답
    return Response.json({
      success: true,
      message: '뉴스레터 구독이 해제되었습니다.',
      data: {
        newsletterId,
        unsubscribedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('뉴스레터 구독 해제 실패:', error)
    return Response.json(
      { error: '뉴스레터 구독 해제에 실패했습니다.' },
      { status: 500 }
    )
  }
}
