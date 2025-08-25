// 카테고리별 기사 조회 API (쿼리 파라미터 방식)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') || 5;
    
    if (!category) {
      return Response.json(
        { success: false, error: '카테고리가 필요합니다.' },
        { status: 400 }
      )
    }

    // 백엔드 API 호출
    const response = await fetch(`http://localhost:8085/api/newsletter/category/${category}/articles?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('카테고리별 기사 조회 실패:', error)
    return Response.json(
      { 
        success: false,
        error: '카테고리별 기사를 불러오는데 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
