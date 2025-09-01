// 활성 구독 목록 조회 API
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
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/active`, {
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
    return Response.json(data)
  } catch (error) {
    console.error('활성 구독 목록 조회 실패:', error)
    return Response.json(
      { 
        success: false,
        error: '활성 구독 목록을 조회하는데 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
