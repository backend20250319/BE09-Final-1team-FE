import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getNewsServiceUrl } from '@/lib/utils/config';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // 백엔드로 신고 요청 전달
    const backendUrl = getNewsServiceUrl(`/api/news/${id}/report`);
    
    const accessToken = cookies().get('access-token')?.value;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { error: '신고 처리에 실패했습니다.', details: errorText },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('신고 API 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
