// 뉴스레터 구독 API
export async function POST(request) {
  try {
    const { newsletterId, email } = await request.json()

    // 입력 검증
    if (!newsletterId || !email) {
      return Response.json(
        { error: '뉴스레터 ID와 이메일 주소가 필요합니다.' },
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

    // 실제 환경에서는 데이터베이스에 구독 정보를 저장해야 합니다
    // 여기서는 시뮬레이션을 위해 성공 응답을 반환합니다
    
    console.log(`뉴스레터 구독: ID=${newsletterId}, Email=${email}`)

    // 구독 성공 응답
    return Response.json({
      success: true,
      message: '뉴스레터 구독이 완료되었습니다.',
      data: {
        newsletterId,
        email,
        subscribedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('뉴스레터 구독 실패:', error)
    return Response.json(
      { error: '뉴스레터 구독에 실패했습니다.' },
      { status: 500 }
    )
  }
}
