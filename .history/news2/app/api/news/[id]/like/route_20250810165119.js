import { NextResponse } from 'next/server'

/**
 * POST /api/news/[id]/like
 * 뉴스 기사 좋아요를 토글합니다
 */
export async function POST(request, { params }) {
  try {
    const { id } = params
    
    // 여기에 좋아요 토글 로직을 구현할 수 있습니다
    // 현재는 더미 응답을 반환합니다
    
    return NextResponse.json({
      message: '좋아요가 성공적으로 처리되었습니다.',
      newsId: id,
      success: true
    })
    
  } catch (error) {
    console.error('뉴스 좋아요 오류:', error)
    return NextResponse.json(
      { error: '좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
