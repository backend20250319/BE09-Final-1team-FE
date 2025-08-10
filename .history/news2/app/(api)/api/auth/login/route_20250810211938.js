import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    // 필수 필드 검증
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '이메일과 비밀번호를 입력해주세요.' }, 
        { status: 400 }
      )
    }

    // 백엔드 서버로 요청 전달
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082'
    
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ 로그인 성공:', { email, role: data.data?.user?.role })
      return NextResponse.json(data, { status: response.status })
    } else {
      console.log('⚠️ 로그인 실패:', data.message)
      return NextResponse.json(data, { status: response.status })
    }
    
  } catch (error) {
    console.error('로그인 API 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, 
      { status: 500 }
    )
  }
} 