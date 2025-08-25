import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 임시로 더미 데이터 반환
    // 실제로는 데이터베이스에서 구독자 수를 가져와야 함
    const mockCount = 15420
    
    return NextResponse.json({ count: mockCount })
  } catch (error) {
    console.error('구독자 수 조회 실패:', error)
    return NextResponse.json(
      { error: '구독자 수를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
