// 뉴스레터 구독 해제 API
export async function POST(request) {
  try {
    const { subscriptionId } = await request.json()
    const authHeader = request.headers.get('authorization')

    if (!subscriptionId) {
      return Response.json(
        { success: false, error: '구독 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!authHeader) {
      return Response.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 백엔드 API 호출
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('뉴스레터 구독 해제 실패:', error)
    return Response.json(
      { 
        success: false,
        error: '뉴스레터 구독 해제에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
