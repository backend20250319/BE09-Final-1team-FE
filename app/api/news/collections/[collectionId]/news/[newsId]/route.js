import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/utils/config';

export async function DELETE(request, { params }) {
  try {
    const { collectionId, newsId } = params;
    
    if (!collectionId || !newsId) {
      return NextResponse.json({ 
        error: 'Collection ID and News ID are required' 
      }, { status: 400 });
    }

    console.log('🔍 Remove News from Collection API Debug:', {
      collectionId,
      newsId,
      originalUrl: request.url
    });

    // 게이트웨이를 통해 컬렉션에서 뉴스 삭제
    const backendUrl = getApiUrl(`/api/news/collections/${collectionId}/news/${newsId}`);
    
    const accessToken = cookies().get('access-token')?.value;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    console.log('📡 Backend Remove News from Collection API 호출:', {
      url: backendUrl,
      hasAuth: !!accessToken
    });

    const backendResponse = await fetch(backendUrl, {
      method: 'DELETE',
      headers: headers,
    });

    console.log('📡 Backend Remove News from Collection API 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      ok: backendResponse.ok
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend Remove News from Collection API 실패:', { 
        status: backendResponse.status, 
        statusText: backendResponse.statusText,
        errorText,
        url: backendUrl
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorText || `Backend API error (${backendResponse.status})`,
          status: backendResponse.status 
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ Backend Remove News from Collection 응답:', data);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = {
      success: true,
      data: data
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ Remove News from Collection API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal Server Error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
