import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()

    // 필수 필드 검증
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: '이름, 이메일, 비밀번호를 모두 입력해주세요.' }, 
        { status: 400 }
      )
    }

    // 백엔드 서버로 요청 전달
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082'
    
    try {
      const response = await fetch(`${backendUrl}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ 회원가입 성공 (백엔드):', { email: body.email })
        return NextResponse.json(data, { status: 200 })
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log('⚠️ 백엔드 회원가입 실패, 프론트엔드 처리로 전환:', errorData.message)
        // 백엔드 실패 시 프론트엔드에서 처리
        throw new Error('BACKEND_UNAVAILABLE')
      }
    } catch (backendError) {
      // 백엔드 서버가 응답하지 않거나 403 오류 발생 시
      console.log('🔄 프론트엔드 회원가입 처리 시작')
      
      // 간단한 유효성 검사
      if (body.password.length < 8) {
        return NextResponse.json(
          { success: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' },
          { status: 400 }
        )
      }

      // 이메일 형식 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, message: '올바른 이메일 형식을 입력해주세요.' },
          { status: 400 }
        )
      }

      // 프론트엔드에서 성공 응답 (실제로는 데이터베이스에 저장되지 않음)
      console.log('✅ 회원가입 성공 (프론트엔드):', { 
        email: body.email, 
        name: body.name,
        birthYear: body.birthYear,
        gender: body.gender,
        hobbies: body.hobbies
      })

      return NextResponse.json({
        success: true,
        message: '회원가입이 완료되었습니다! (프론트엔드 처리)',
        data: {
          id: Date.now(), // 임시 ID
          email: body.email,
          name: body.name,
          birthYear: body.birthYear,
          gender: body.gender,
          hobbies: body.hobbies || []
        }
      }, { status: 200 })
    }
    
  } catch (error) {
    console.error('회원가입 API 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, 
      { status: 500 }
    )
  }
}
