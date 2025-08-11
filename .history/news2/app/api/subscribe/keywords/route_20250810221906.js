import { NextResponse } from 'next/server'

// 임시 저장소 (실제로는 데이터베이스 사용)
let keywordSubscriptions = []

/**
 * POST /api/subscribe/keywords
 * 키워드 구독을 추가합니다
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { keyword, userId, email } = body

    if (!keyword || !keyword.trim()) {
      return NextResponse.json(
        { error: '키워드를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!userId && !email) {
      return NextResponse.json(
        { error: '사용자 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // 중복 구독 확인
    const existingSubscription = keywordSubscriptions.find(sub => 
      sub.keyword.toLowerCase() === keyword.toLowerCase() && 
      (sub.userId === userId || sub.email === email)
    )

    if (existingSubscription) {
      return NextResponse.json(
        { error: '이미 구독 중인 키워드입니다.' },
        { status: 409 }
      )
    }

    // 새 구독 추가
    const newSubscription = {
      id: Date.now().toString(),
      keyword: keyword.trim(),
      userId: userId || null,
      email: email || null,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    keywordSubscriptions.push(newSubscription)

    return NextResponse.json({
      message: '키워드 구독이 완료되었습니다.',
      subscription: newSubscription
    }, { status: 201 })

  } catch (error) {
    console.error('키워드 구독 API 오류:', error)
    return NextResponse.json(
      { error: '키워드 구독 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/subscribe/keywords
 * 사용자의 키워드 구독 목록을 조회합니다
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    if (!userId && !email) {
      return NextResponse.json(
        { error: '사용자 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // 사용자의 구독 목록 필터링
    const userSubscriptions = keywordSubscriptions.filter(sub => 
      (userId && sub.userId === userId) || (email && sub.email === email)
    )

    return NextResponse.json({
      subscriptions: userSubscriptions,
      totalCount: userSubscriptions.length
    })

  } catch (error) {
    console.error('키워드 구독 조회 API 오류:', error)
    return NextResponse.json(
      { error: '키워드 구독 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/subscribe/keywords
 * 키워드 구독을 취소합니다
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('id')
    const keyword = searchParams.get('keyword')
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    if (!subscriptionId && !keyword) {
      return NextResponse.json(
        { error: '구독 ID 또는 키워드가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!userId && !email) {
      return NextResponse.json(
        { error: '사용자 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // 구독 찾기 및 삭제
    const initialLength = keywordSubscriptions.length
    
    keywordSubscriptions = keywordSubscriptions.filter(sub => {
      if (subscriptionId && sub.id === subscriptionId) {
        return !((userId && sub.userId === userId) || (email && sub.email === email))
      }
      if (keyword && sub.keyword.toLowerCase() === keyword.toLowerCase()) {
        return !((userId && sub.userId === userId) || (email && sub.email === email))
      }
      return true
    })

    if (keywordSubscriptions.length === initialLength) {
      return NextResponse.json(
        { error: '구독을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: '키워드 구독이 취소되었습니다.'
    })

  } catch (error) {
    console.error('키워드 구독 취소 API 오류:', error)
    return NextResponse.json(
      { error: '키워드 구독 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
