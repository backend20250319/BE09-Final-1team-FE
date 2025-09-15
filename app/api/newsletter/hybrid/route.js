import { NextResponse } from 'next/server';
import { getNewsletterServiceUrl } from '@/lib/utils/config';
import { cookies } from 'next/headers';

/**
 * Hybrid Newsletter API - 토큰 유무에 따라 자동 전환
 * 
 * 토큰이 있으면: 개인화된 뉴스레터
 * 토큰이 없으면: 공개 뉴스레터
 */
export async function GET(request) {
  try {
    console.log('🔄 Hybrid Newsletter API 호출');
    
    // 쿠키에서 액세스 토큰 가져오기
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 5;
    const personalized = searchParams.get('personalized') === 'true';
    
    console.log('📊 Hybrid API 요청 파라미터:', {
      hasToken: !!accessToken,
      category,
      limit,
      personalized
    });
    
    // 토큰 유무에 따라 다른 백엔드 API 호출
    let backendUrl;
    let requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieStore.toString() || ''
      }
    };
    
    if (accessToken) {
      // 토큰이 있으면 개인화된 API 호출
      backendUrl = getNewsletterServiceUrl('/api/newsletter/hybrid');
      requestOptions.headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      // 토큰이 없으면 공개 API 호출
      backendUrl = getNewsletterServiceUrl('/api/newsletter/public');
    }
    
    const queryParams = new URLSearchParams({
      ...(category && { category }),
      limit: limit.toString(),
      ...(personalized && { personalized: 'true' })
    });
    
    const backendResponse = await fetch(`${backendUrl}?${queryParams}`, requestOptions);

    const backendData = await backendResponse.json().catch(() => ({
      success: false,
      error: '백엔드 응답 파싱 실패'
    }));
    
    console.log('📊 백엔드 Hybrid API 응답:', {
      status: backendResponse.status,
      success: backendData.success,
      hasToken: !!accessToken,
      dataType: backendData.data ? 'personalized' : 'public'
    });

    if (!backendResponse.ok || !backendData.success) {
      // 백엔드 API가 없을 때 fallback 데이터 제공
      console.warn('⚠️ 백엔드 Hybrid API 실패, fallback 데이터 제공');
      
      const fallbackData = await generateFallbackHybridData({
        hasToken: !!accessToken,
        category,
        limit,
        personalized
      });
      
      return NextResponse.json({
        success: true,
        data: fallbackData,
        metadata: {
          generatedAt: new Date().toISOString(),
          version: "1.0",
          source: "BFF_HYBRID_FALLBACK",
          note: "백엔드 API가 없어 fallback 데이터를 제공합니다"
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: backendData.data,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0",
        source: "BFF_HYBRID",
        tokenBased: !!accessToken
      }
    });

  } catch (error) {
    console.error('❌ Hybrid Newsletter API 오류:', error);
    
    // 에러 발생 시에도 fallback 데이터 제공
    const fallbackData = await generateFallbackHybridData({
      hasToken: false,
      category: null,
      limit: 5,
      personalized: false
    });
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0",
        source: "BFF_HYBRID_ERROR_FALLBACK",
        error: error.message
      }
    });
  }
}

/**
 * Fallback Hybrid 데이터 생성
 */
async function generateFallbackHybridData({ hasToken, category, limit, personalized }) {
  const isPersonalized = hasToken && personalized;
  
  // 기본 카테고리들
  const categories = category ? [category] : ['정치', '경제', '사회', 'IT/과학', '세계'];
  
  // 뉴스레터 데이터 생성
  const newsletters = categories.map((cat, index) => ({
    id: `newsletter_${cat}_${index + 1}`,
    title: `${cat} 뉴스레터`,
    description: isPersonalized ? 
      `당신을 위한 맞춤 ${cat} 뉴스` : 
      `${cat} 분야의 주요 뉴스를 제공합니다`,
    category: cat,
    frequency: 'daily',
    subscribers: Math.floor(Math.random() * 10000) + 1000,
    lastSent: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    tags: [cat, '뉴스', isPersonalized ? '맞춤형' : '일반'],
    isSubscribed: isPersonalized,
    personalized: isPersonalized,
    articles: Array.from({ length: limit }, (_, i) => ({
      id: `${cat}_article_${i + 1}`,
      title: isPersonalized ? 
        `당신의 관심사에 맞는 ${cat} 뉴스 ${i + 1}` :
        `${cat} 관련 주요 뉴스 ${i + 1}`,
      summary: isPersonalized ?
        `당신의 읽기 패턴을 분석한 맞춤 ${cat} 뉴스입니다.` :
        `${cat} 분야의 중요한 소식입니다.`,
      url: `#${cat}_${i + 1}`,
      publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
      source: '뉴스피어',
      imageUrl: null,
      personalized: isPersonalized
    }))
  }));
  
  return {
    newsletters,
    userAuthenticated: hasToken,
    personalized: isPersonalized,
    message: isPersonalized ? 
      '🎯 맞춤형 뉴스레터를 제공합니다' : 
      '📰 일반 뉴스레터를 제공합니다',
    upgradePrompt: !hasToken ? 
      '🔐 로그인하시면 맞춤형 뉴스를 받아보실 수 있어요!' :
      !personalized ?
      '🎯 관심 카테고리를 구독하면 더 많은 맞춤 뉴스를 받아보실 수 있어요!' :
      null,
    capabilities: {
      level: isPersonalized ? 'PERSONALIZED' : hasToken ? 'AUTHENTICATED_BASIC' : 'PUBLIC',
      features: isPersonalized ? 
        ['완전 개인화', 'AI 추천', '맞춤 통계'] :
        hasToken ?
        ['확장 뉴스', '구독 관리', '개인화 준비'] :
        ['기본 뉴스', '트렌딩 키워드', '인기 카테고리']
    }
  };
}
