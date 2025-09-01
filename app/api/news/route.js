import { NextResponse } from 'next/server';
import { getNewsServiceUrl } from '@/lib/config';
import { cookies } from 'next/headers';

// JWT 토큰 디코딩 함수
function decodeJWT(token) {
  try {
    if (!token || typeof token !== 'string') {
      console.log('❌ JWT 디코딩: 토큰이 유효하지 않음:', typeof token);
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ JWT 디코딩: 토큰 형식이 잘못됨 (parts:', parts.length, ')');
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );

    const decoded = JSON.parse(jsonPayload);
    console.log('✅ JWT 디코딩 성공:', {
      sub: decoded.sub,
      userId: decoded.userId,
      id: decoded.id,
      role: decoded.role,
      userRole: decoded.userRole,
      exp: decoded.exp,
      iat: decoded.iat,
    });

    return decoded;
  } catch (error) {
    console.error('❌ JWT 디코딩 실패:', error.message);
    return null;
  }
}

// Mock 데이터 생성 함수
function generateMockNews(page, size, category) {
  const mockNews = [];
  const categories = [
    'POLITICS',
    'ECONOMY',
    'SOCIETY',
    'LIFE',
    'INTERNATIONAL',
    'IT_SCIENCE',
    'VEHICLE',
    'TRAVEL_FOOD',
    'ART',
  ];
  const sources = [
    '조선일보',
    '중앙일보',
    '동아일보',
    '한겨레',
    '경향신문',
    '서울신문',
    '국민일보',
    '세계일보',
  ];

  for (let i = 0; i < size; i++) {
    const newsId = (page - 1) * size + i + 1;
    const randomCategory =
      category && category !== '전체'
        ? category
        : categories[Math.floor(Math.random() * categories.length)];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];

    mockNews.push({
      newsId: newsId,
      title: `[${randomCategory}] ${randomSource} 뉴스 제목 ${newsId} - ${Math.random()
        .toString(36)
        .substring(7)}`,
      content: `이것은 ${randomCategory} 카테고리의 ${randomSource}에서 발행된 뉴스 내용입니다. 뉴스 ID는 ${newsId}이며, 이는 Mock 데이터입니다.`,
      press: randomSource,
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      categoryName: randomCategory,
      imageUrl: `/placeholder.jpg`,
      viewCount: Math.floor(Math.random() * 10000) + 100,
    });
  }

  return mockNews;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '21');
    let category = searchParams.get('category');

    // 로그인 여부 확인 (쿠키에서 토큰 또는 세션 확인)
    const cookieStore = await cookies();

    // 모든 쿠키 확인
    console.log('🍪 전체 쿠키 목록:', {
      token: cookieStore.get('token')?.value ? '존재' : '없음',
      authToken: cookieStore.get('authToken')?.value ? '존재' : '없음',
      accessToken: cookieStore.get('accessToken')?.value ? '존재' : '없음',
    });

    const token =
      cookieStore.get('token')?.value ||
      cookieStore.get('authToken')?.value ||
      cookieStore.get('accessToken')?.value;
    const isLoggedIn = !!token;

    console.log('🔍 토큰 확인:', {
      tokenExists: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token ? token.substring(0, 20) + '...' : null,
      isLoggedIn,
    });

    // 로그인 여부에 따라 기본 URL 설정
    let backendUrl;
    if (isLoggedIn) {
      backendUrl = `${getNewsServiceUrl('api/news/feed')}?page=${page}&size=${size}`;
    } else {
      backendUrl = `${getNewsServiceUrl('api/news')}?page=${page}&size=${size}`;
    }

    // 카테고리가 있으면 기본 뉴스 API로 변경하고 카테고리 파라미터 추가
    if (category && category !== '전체') {
      backendUrl = `${getNewsServiceUrl(
        'api/news',
      )}?page=${page}&size=${size}&category=${category}`;
    }

    try {
      // 헤더 구성 (로그인 시 인증 정보 포함)
      const headers = {
        'Content-Type': 'application/json',
      };

      // 로그인된 사용자인 경우 인증 헤더 추가
      if (isLoggedIn && token) {
        console.log('🔑 로그인 사용자 - JWT 디코딩 시작');

        // JWT 토큰에서 사용자 정보 추출
        const decoded = decodeJWT(token);

        if (decoded) {
          // 숫자 ID를 우선적으로 추출 (sub는 이메일이므로 제외)
          const userId = decoded.userId || decoded.id;
          const userRole = decoded.role || decoded.userRole;

          console.log('🔍 추출된 사용자 정보:', {
            userId,
            userRole,
            userIdType: typeof userId,
            availableFields: Object.keys(decoded),
            fullDecoded: decoded,
          });

          // Authorization 헤더 추가
          headers['Authorization'] = `Bearer ${token}`;

          // 백엔드에서 요구하는 X-User-Id와 X-User-Role 헤더 추가 (뉴스 서비스용)
          if (userId && !isNaN(userId)) {
            headers['X-User-Id'] = userId.toString();
            console.log('✅ X-User-Id 헤더 추가:', userId);
          } else {
            console.warn('⚠️ User-ID를 찾을 수 없거나 숫자가 아님:', userId);
            // User-ID가 없으면 일반 뉴스로 폴백
            backendUrl = `${getNewsServiceUrl('api/news')}?page=${page}&size=${size}`;
          }

          if (userRole) {
            headers['X-User-Role'] = userRole;
            console.log('✅ X-User-Role 헤더 추가:', userRole);
          } else {
            console.warn('⚠️ Role을 찾을 수 없음');
          }

          console.log('🔑 최종 헤더:', {
            'Content-Type': headers['Content-Type'],
            Authorization: `Bearer ${token.substring(0, 20)}...`,
            'X-User-Id': headers['X-User-Id'],
            'X-User-Role': headers['X-User-Role'],
          });
        } else {
          console.warn('⚠️ JWT 디코딩 실패 - Authorization 헤더만 추가');
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else {
        console.log('🔓 비로그인 사용자 - 기본 헤더만 사용');
      }

      console.log('🌐 백엔드 호출:', backendUrl);

      // 실제 백엔드 API 호출 시도
      const response = await fetch(backendUrl, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error('❌ 백엔드 API 오류:', response.status, response.statusText);
        throw new Error(`백엔드 API 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 백엔드 뉴스 서비스에서 받은 데이터:', data);

      // 백엔드 응답 구조를 프론트엔드에 맞게 변환
      const transformedData = {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 1,
        currentPage: data.number, // Spring Boot는 0-based pagination 사용하지만 이미 올바른 값
        size: data.size || size,
        isMock: false,
      };

      console.log('🔄 변환된 데이터:', transformedData);

      return NextResponse.json(transformedData);
    } catch (backendError) {
      console.warn('⚠️ 백엔드 서버 연결 실패, Mock 데이터 사용:', backendError.message);

      // Mock 데이터 생성
      const mockContent = generateMockNews(page, size, category);
      const totalElements = 1000; // 총 뉴스 개수
      const totalPages = Math.ceil(totalElements / size);

      const mockData = {
        content: mockContent,
        totalElements: totalElements,
        totalPages: totalPages,
        currentPage: page,
        size: size,
        isMock: true,
      };

      console.log('🎭 Mock 데이터 생성 완료:', mockData);

      return NextResponse.json(mockData);
    }
  } catch (error) {
    console.error('❌ 뉴스 API 오류:', error);

    return NextResponse.json({ error: '뉴스를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
