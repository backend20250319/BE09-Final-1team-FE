import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/utils/config';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const period = searchParams.get('period') || '24h';
    const category = searchParams.get('category');

    console.log('🔍 Trending Keywords API Debug:', {
      limit,
      period,
      category,
      originalUrl: request.url
    });

    // 게이트웨이를 통해 트렌딩 키워드 조회
    let backendUrl = getApiUrl(`/api/news/trending-keywords?limit=${limit}&period=${period}`);
    if (category) {
      backendUrl += `&category=${encodeURIComponent(category)}`;
    }

    console.log('📡 Backend Trending Keywords API 호출:', {
      url: backendUrl
    });

    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Backend Trending Keywords API 응답:', {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      ok: backendResponse.ok
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Backend Trending Keywords API 실패:', { 
        status: backendResponse.status, 
        statusText: backendResponse.statusText,
        errorText,
        url: backendUrl
      });
      
      // 에러 시 기본 키워드 반환
      return NextResponse.json({
        success: true,
        data: [
          "인공지능", "경제정책", "환경보호", "디지털전환", 
          "스타트업", "블록체인", "메타버스", "ESG"
        ]
      });
    }

    const data = await backendResponse.json();
    console.log('✅ Backend Trending Keywords 응답:', data);

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const transformedData = {
      success: true,
      data: data.content || data.data || data || []
    };

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('❌ Trending Keywords API 오류:', error);
    
    // 에러 시 기본 키워드 반환
    return NextResponse.json({
      success: true,
      data: [
        "인공지능", "경제정책", "환경보호", "디지털전환", 
        "스타트업", "블록체인", "메타버스", "ESG"
      ]
    });
  }
}
