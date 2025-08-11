import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()

    // 필수 필드 검증
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: '이름, 이메일, 비밀번호는 필수입니다.' }, 
        { status: 400 }
      )
    }

    // 백엔드 서버로 요청 전달
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8082'
    
    const response = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ 회원가입 성공:', { email: body.email })
      return NextResponse.json(data, { status: response.status })
    } else {
      console.log('⚠️ 회원가입 실패:', data.message)
      return NextResponse.json(data, { status: response.status })
    }
    
  } catch (error) {
    console.error('회원가입 API 오류:', error)
    return NextResponse.json(
      { success: false, message: '백엔드 서버에 연결할 수 없습니다.' }, 
      { status: 503 }
    )
  }
} 