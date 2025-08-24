// 뉴스레터 구독 API
export async function POST(request) {
  try {
    const body = await request.json()
    const { email, frequency, preferredCategories } = body
    const authHeader = request.headers.get('authorization')

    if (!email || !preferredCategories) {
      return Response.json(
        { success: false, error: '이메일과 선호 카테고리가 필요합니다.' },
        { status: 400 }
      )
    }

    // 백엔드 API 호출
    const response = await fetch('http://localhost:8085/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
      body: JSON.stringify({
        email,
        frequency: frequency || 'DAILY',
        preferredCategories
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('뉴스레터 구독 실패:', error)
    return Response.json(
      { 
        success: false,
        error: '뉴스레터 구독에 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
