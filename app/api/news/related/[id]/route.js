import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/utils/config';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        error: 'News ID is required' 
      }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '전체';
    const limit = searchParams.get('limit') || '4';

    console.log('🔍 Related News API Debug:', {
      newsId: id,
      category,
      limit,
      originalUrl: request.url
    });

    // 게이트웨이를 통해 관련 뉴스 조회
    const backendUrl = getApiUrl(`/api/news/related/${id}?category=${encodeURIComponent(category)}&limit=${limit}`);
    
    const accessToken = cookies().get('access-token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('📡 Backend Related News API 호출:', {
      url: backendUrl,
      hasAuth: !!accessToken
    });

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: headers,
    });

    console.log('📡 Backend Related News API 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      ok: backendResponse.ok
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend Related News API 실패:', { 
        status: backendResponse.status, 
        statusText: backendResponse.statusText,
        errorText,
        url: backendUrl
      });
      
      // 404나 다른 에러 시 빈 배열 반환
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const data = await backendResponse.json();
    console.log('✅ Backend Related News 응답:', data);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = {
      success: true,
      data: data.content || data.data || data || []
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ Related News API 오류:', error);
    
    // 에러 시 빈 배열 반환
    return NextResponse.json({
      success: true,
      data: []
    });
  }
}
