import { NextResponse } from 'next/server'

// 임시 구독자 데이터 (실제로는 데이터베이스에서 관리)
let subscribers = [
  { email: 'test1@example.com', subscribedAt: '2024-01-15T10:30:00Z' },
  { email: 'test2@example.com', subscribedAt: '2024-01-14T15:45:00Z' },
  { email: 'test3@example.com', subscribedAt: '2024-01-13T09:20:00Z' },
]

export async function GET() {
  try {
    // 관리자 권한 확인 (실제 구현에서는 세션/토큰 확인)
    // const isAdmin = await checkAdminPermission(req)
    // if (!isAdmin) {
    //   return NextResponse.json({ message: '관리자 권한이 필요합니다.' }, { status: 403 })
    // }

    return NextResponse.json({
      subscribers: subscribers,
      totalCount: subscribers.length,
      message: '구독자 목록을 성공적으로 가져왔습니다.'
    }, { status: 200 })
    
  } catch (error) {
    console.error('구독자 목록 조회 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' }, 
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const { email } = await req.json()

    // 이메일 유효성 검사
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: '유효하지 않은 이메일 주소입니다.' }, 
        { status: 400 }
      )
    }

    // 이메일 형식 검사 (간단한 정규식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: '올바른 이메일 형식이 아닙니다.' }, 
        { status: 400 }
      )
    }

    // 중복 구독 체크
    const existingSubscriber = subscribers.find(sub => sub.email === email)
    if (existingSubscriber) {
      return NextResponse.json(
        { message: '이미 구독 중인 이메일 주소입니다.' }, 
        { status: 409 }
      )
    }

    // 새 구독자 추가
    const newSubscriber = {
      email: email,
      subscribedAt: new Date().toISOString()
    }
    subscribers.push(newSubscriber)
    
    console.log('💌 새로운 뉴스레터 구독:', email)
    console.log('📅 구독 시간:', new Date().toLocaleString('ko-KR'))
    console.log('📊 총 구독자 수:', subscribers.length)
    
    // 실제 구현 시 추가할 수 있는 기능들:
    // 1. 데이터베이스에 이메일 저장
    // 2. 구독 확인 이메일 발송
    // 3. 구독자 통계 업데이트

    return NextResponse.json(
      { 
        message: '구독이 성공적으로 완료되었습니다!',
        email: email,
        subscribedAt: newSubscriber.subscribedAt,
        totalSubscribers: subscribers.length
      }, 
      { status: 200 }
    )
    
  } catch (error) {
    console.error('구독 API 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, 
      { status: 500 }
    )
  }
} 