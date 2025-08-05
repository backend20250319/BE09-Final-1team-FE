import { NextResponse } from 'next/server'

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

    // TODO: 실제 구현에서는 여기에 데이터베이스 저장 로직을 추가합니다
    // 예시: MySQL, PostgreSQL, MongoDB, Supabase 등
    
    // 현재는 콘솔에 로그를 출력하고 성공 응답을 반환합니다
    console.log('💌 새로운 뉴스레터 구독:', email)
    console.log('📅 구독 시간:', new Date().toLocaleString('ko-KR'))
    
    // 실제 구현 시 추가할 수 있는 기능들:
    // 1. 데이터베이스에 이메일 저장
    // 2. 중복 구독 체크
    // 3. 구독 확인 이메일 발송
    // 4. 구독자 통계 업데이트

    return NextResponse.json(
      { 
        message: '구독이 성공적으로 완료되었습니다!',
        email: email,
        subscribedAt: new Date().toISOString()
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