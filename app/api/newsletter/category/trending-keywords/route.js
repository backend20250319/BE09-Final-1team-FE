import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { getApiUrl } from "@/lib/utils/config";

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

    // 백엔드 API 경로들을 순차적으로 시도
    const possiblePaths = [
      `/api/newsletter/category/${backendCategory}/trending-keywords`,
      `/api/trending/category/${backendCategory}/keywords`,
      `/api/newsletter/trending-keywords/${backendCategory}`,
      `/api/trending/trending-keywords/category/${backendCategory}`
    ];

    // 헤더 설정 (인증은 선택사항)
    const headers = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let response = null;
    let successfulUrl = null;

    // 각 경로를 순차적으로 시도
    for (const path of possiblePaths) {
      const backendUrl = getApiUrl(path);
      const urlWithQuery = `${backendUrl}?limit=${limit}`;
      
      console.log(`트렌딩 키워드 API 시도: ${urlWithQuery}`);
      
      try {
        response = await fetch(urlWithQuery, {
          method: 'GET',
          headers,
        });
        
        if (response.ok) {
          successfulUrl = urlWithQuery;
          console.log(`✅ 트렌딩 키워드 API 성공: ${urlWithQuery}`);
          break;
        } else {
          console.log(`❌ 트렌딩 키워드 API 실패 (${response.status}): ${urlWithQuery}`);
        }
      } catch (error) {
        console.log(`❌ 트렌딩 키워드 API 에러: ${urlWithQuery} - ${error.message}`);
      }
    }

    if (!response || !response.ok) {
      console.warn(`모든 트렌딩 키워드 API 경로 실패 - 카테고리: ${category}`);
      
      // 기본 빈 데이터 반환 (에러 대신)
      return NextResponse.json({
        success: true,
        data: [],
        metadata: {
          category: category,
          limit: parseInt(limit),
          error: 'trending_keywords_unavailable',
          fallback: true,
          attempted_paths: possiblePaths
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
        authenticated: !!accessToken,
        successful_url: successfulUrl
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