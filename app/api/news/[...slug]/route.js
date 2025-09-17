import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getNewsServiceUrl } from '@/lib/utils/config';

async function handler(request, { params }) {
  // 1. 요청된 경로를 재구성
  const path = params.slug ? params.slug.join('/') : '';

  // 2. 백엔드 컨트롤러의 @RequestMapping에 맞는 전체 URL을 생성
  const backendUrl = getNewsServiceUrl(`/api/news/${path}`);

  // 3. 쿼리 파라미터를 그대로 전달합니다.
  const { search } = new URL(request.url);
  const urlWithQuery = `${backendUrl}${search}`;
  
  // 디버깅을 위한 로그
  console.log('🔍 News API Debug:', {
    originalUrl: request.url,
    params: params,
    path: path,
    backendUrl: backendUrl,
    urlWithQuery: urlWithQuery
  });
  
  const accessToken = cookies().get('access-token')?.value;

  const headers = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    // 4. 백엔드 서비스로 요청을 그대로 전달
    const backendResponse = await fetch(urlWithQuery, {
      method: request.method,
      headers: headers,
      body: (request.method !== 'GET' && request.method !== 'HEAD') ? request.body : undefined,
      // @ts-ignore
      duplex: 'half' 
    });

    // 5. 백엔드의 응답을 클라이언트로 그대로 반환
    return backendResponse;

  } catch (error) {
    console.error(`❌ API Proxy Error (to ${urlWithQuery}):`, error);
    
    // URL 생성 에러인 경우 특별 처리
    if (error.message.includes('Failed to construct URL')) {
      return NextResponse.json({ 
        error: 'Invalid URL configuration',
        message: error.message,
        details: { backendUrl, urlWithQuery }
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error.message 
    }, { status: 500 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };