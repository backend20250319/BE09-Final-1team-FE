// 카테고리별 트렌드 키워드 조회 API (쿼리 파라미터 방식)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') || 8;
    
    if (!category) {
      return Response.json(
        { success: false, error: '카테고리가 필요합니다.' },
        { status: 400 }
      )
    }

    // 백엔드 API 호출
    const response = await fetch(`http://localhost:8085/api/newsletter/category/${category}/trending-keywords?limit=${limit}`, {
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
    console.error('트렌드 키워드 조회 실패:', error)
    return Response.json(
      { 
        success: false,
        error: '트렌드 키워드를 불러오는데 실패했습니다.',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
