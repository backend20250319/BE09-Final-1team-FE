// 내 구독 목록 조회 API
export async function GET(request) {
  try {
    // HttpOnly 쿠키에서 access-token 가져오기
    const accessToken = request.cookies.get('access-token')?.value

    if (!accessToken) {
      return Response.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 백엔드 API 호출
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/newsletter/subscription/my`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('내 구독 목록 조회 실패:', error)
    return Response.json(
      { 
        success: false,
        error: '내 구독 목록을 조회하는데 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
