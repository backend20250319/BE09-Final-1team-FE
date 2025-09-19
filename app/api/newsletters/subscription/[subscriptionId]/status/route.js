// 구독 상태 변경 API
export async function PUT(request, { params }) {
  try {
    const { subscriptionId } = params
    const body = await request.json()
    const { status } = body
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return Response.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    if (!status) {
      return Response.json(
        { success: false, error: '상태 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // 백엔드 API 호출
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/${subscriptionId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('구독 상태 변경 실패:', error)
    return Response.json(
      { 
        success: false,
        error: '구독 상태 변경에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
