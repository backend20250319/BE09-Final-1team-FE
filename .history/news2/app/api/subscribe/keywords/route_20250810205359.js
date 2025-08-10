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

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // 백엔드가 없으면 프론트엔드에서 처리
      console.log('🔄 프론트엔드 키워드 구독 처리');
      
      // 로컬 스토리지에 저장 (실제로는 데이터베이스에 저장)
      const subscriptions = JSON.parse(localStorage.getItem('keywordSubscriptions') || '[]');
      const newSubscription = {
        id: Date.now().toString(),
        keyword,
        email,
        userId: userId || null,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      subscriptions.push(newSubscription);
      localStorage.setItem('keywordSubscriptions', JSON.stringify(subscriptions));
      
      return NextResponse.json({
        success: true,
        message: '키워드 구독이 완료되었습니다.',
        subscription: newSubscription
      });
    }
    
  } catch (error) {
    console.error('키워드 구독 오류:', error);
    return NextResponse.json(
      { error: '키워드 구독 중 오류가 발생했습니다.' },
      { status: 500 }
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

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // 백엔드가 없으면 프론트엔드에서 처리
      console.log('🔄 프론트엔드 키워드 구독 조회');
      
      const subscriptions = JSON.parse(localStorage.getItem('keywordSubscriptions') || '[]');
      const filteredSubscriptions = subscriptions.filter(sub => 
        (email && sub.email === email) || (userId && sub.userId === userId)
      );
      
      return NextResponse.json({
        subscriptions: filteredSubscriptions,
        count: filteredSubscriptions.length
      });
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

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // 백엔드가 없으면 프론트엔드에서 처리
      console.log('🔄 프론트엔드 키워드 구독 삭제');
      
      const subscriptions = JSON.parse(localStorage.getItem('keywordSubscriptions') || '[]');
      const updatedSubscriptions = subscriptions.filter(sub => {
        if (subscriptionId) return sub.id !== subscriptionId;
        if (keyword && email) return !(sub.keyword === keyword && sub.email === email);
        return true;
      });
      
      localStorage.setItem('keywordSubscriptions', JSON.stringify(updatedSubscriptions));
      
      return NextResponse.json({
        success: true,
        message: '키워드 구독이 삭제되었습니다.',
        deletedCount: subscriptions.length - updatedSubscriptions.length
      });
    }
    
  } catch (error) {
    console.error('키워드 구독 삭제 오류:', error);
    return NextResponse.json(
      { error: '키워드 구독 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
