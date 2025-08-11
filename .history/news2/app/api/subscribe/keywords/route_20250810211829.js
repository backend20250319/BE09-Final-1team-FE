import { NextResponse } from "next/server";

// 환경변수에서 백엔드 URL 가져오기
const NEWS_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8082";

/**
 * POST /api/subscribe/keywords
 * 키워드 구독을 추가합니다
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { keyword, email, userId } = body;

    if (!keyword || !email) {
      return NextResponse.json(
        { error: '키워드와 이메일은 필수입니다.' },
        { status: 400 }
      );
    }

    // 백엔드 서버로 요청 전달
    const response = await fetch(`${NEWS_API_BASE}/subscribe/keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword,
        email,
        userId: userId || null,
        createdAt: new Date().toISOString()
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(data, { status: response.status });
    }
    
  } catch (error) {
    console.error('키워드 구독 오류:', error);
    return NextResponse.json(
      { success: false, message: '백엔드 서버에 연결할 수 없습니다.' },
      { status: 503 }
    );
  }
}

/**
 * GET /api/subscribe/keywords
 * 사용자의 키워드 구독 목록을 조회합니다
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    if (!email && !userId) {
      return NextResponse.json(
        { error: '이메일 또는 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 백엔드 서버로 요청 전달
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (userId) params.append('userId', userId);

    const response = await fetch(`${NEWS_API_BASE}/subscribe/keywords?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(data, { status: response.status });
    }
    
  } catch (error) {
    console.error('키워드 구독 조회 오류:', error);
    return NextResponse.json(
      { error: '키워드 구독 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscribe/keywords
 * 키워드 구독을 삭제합니다
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');
    const keyword = searchParams.get('keyword');
    const email = searchParams.get('email');

    if (!subscriptionId && !keyword) {
      return NextResponse.json(
        { error: '구독 ID 또는 키워드가 필요합니다.' },
        { status: 400 }
      );
    }

    // 백엔드 서버로 요청 전달
    const params = new URLSearchParams();
    if (subscriptionId) params.append('id', subscriptionId);
    if (keyword) params.append('keyword', keyword);
    if (email) params.append('email', email);

    const response = await fetch(`${NEWS_API_BASE}/subscribe/keywords?${params}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data, { status: response.status });
    } else {
      return NextResponse.json(data, { status: response.status });
    }
    
  } catch (error) {
    console.error('키워드 구독 삭제 오류:', error);
    return NextResponse.json(
      { error: '키워드 구독 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
