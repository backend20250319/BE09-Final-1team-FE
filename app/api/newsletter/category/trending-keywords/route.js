import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { getApiUrl } from "@/lib/config";

// 인증 기반 API (개인화된 트렌딩 키워드)
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') || '8';
    const personalized = searchParams.get('personalized') === 'true';

    console.log(`트렌딩 키워드 조회 요청:`, { category, limit, personalized, hasAuth: !!accessToken });

    if (!category) {
      return NextResponse.json(
        { error: '카테고리 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 카테고리 매핑 (프론트엔드 → 백엔드)
    const categoryMapping = {
      '정치': 'POLITICS',
      '경제': 'ECONOMY', 
      '사회': 'SOCIETY',
      '생활': 'LIFE',
      '세계': 'INTERNATIONAL',
      'IT/과학': 'IT_SCIENCE',
      '자동차/교통': 'VEHICLE',
      '여행/음식': 'TRAVEL_FOOD',
      '예술': 'ART'
    };

    const backendCategory = categoryMapping[category] || category.toUpperCase();

    // 백엔드 실제 API URL 사용
    const backendUrl = getApiUrl(`/api/trending/trending-keywords/category/${backendCategory}`);
    const urlWithQuery = `${backendUrl}?limit=${limit}&hours=24`;

    // 헤더 설정 (인증은 선택사항)
    const headers = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(urlWithQuery, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`백엔드 API 에러: ${response.status} ${response.statusText}`);
      
      // 기본 빈 데이터 반환 (에러 대신)
      return NextResponse.json({
        success: true,
        data: [],
        metadata: {
          category: category,
          limit: parseInt(limit),
          error: 'trending_keywords_unavailable',
          fallback: true
        }
      });
    }

    const data = await response.json();
    console.log(`트렌딩 키워드 조회 성공:`, { count: data.data?.length || 0 });

    return NextResponse.json({
      ...data,
      metadata: {
        ...data.metadata,
        category: category,
        limit: parseInt(limit),
        personalized: personalized && !!accessToken,
        authenticated: !!accessToken
      }
    });

  } catch (error) {
    console.error('트렌딩 키워드 조회 실패:', error);
    
    // 에러 시에도 기본 데이터 반환
    return NextResponse.json({
      success: true,
      data: [],
      metadata: {
        error: 'server_error',
        fallback: true
      }
    });
  }
}