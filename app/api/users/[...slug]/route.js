import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/utils/config';

// 이 부분만 각 서비스에 맞게 변경
const backendServicePath = 'users';

async function handler(request, { params }) {
  // 1. 요청 경로 조합
  // ex: /api/users/mypage -> ['mypage'] -> "mypage"
  // ex: /api/users/admin/1 -> ['admin', '1'] -> "admin/1"
  const path = params.slug ? params.slug.join('/') : ''; 

  // 2. 백엔드 API URL 생성
  // BACKEND_URL 환경변수 사용 (개발/배포 모두)
  const backendBaseUrl = process.env.BACKEND_URL;
  if (!backendBaseUrl) {
    console.error('❌ BACKEND_URL 환경변수가 설정되지 않았습니다.');
    return NextResponse.json({ 
      success: false,
      error: '서버 설정 오류',
      message: '백엔드 서버 URL이 설정되지 않았습니다.' 
    }, { status: 500 });
  }
  const backendUrl = `${backendBaseUrl}/api/${backendServicePath}/${path}`;

  // 3. 쿼리 파라미터가 있다면 그대로 전달
  const { search } = new URL(request.url);
  const urlWithQuery = `${backendUrl}${search}`;
  
  const accessToken = cookies().get('access-token')?.value;

  const headers = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    console.log(`📡 Users API 호출: ${urlWithQuery}`);
    
    const backendResponse = await fetch(urlWithQuery, {
      method: request.method,
      headers: headers,
      // GET, HEAD 요청에는 body가 없으므로 조건부로 추가
      body: (request.method !== 'GET' && request.method !== 'HEAD') ? request.body : undefined,
      // duplex: 'half'는 Next.js 13 이상에서 스트리밍 body를 전송할 때 필요
      // @ts-ignore
      duplex: 'half' 
    });

    console.log(`📡 Users API 응답: ${backendResponse.status} ${backendResponse.statusText}`);
    
    // 백엔드 응답을 그대로 전달하되, 에러 상태인 경우 로깅
    if (!backendResponse.ok) {
      console.error(`❌ Users API 에러: ${backendResponse.status} ${backendResponse.statusText}`);
    }

    return backendResponse;

  } catch (error) {
    console.error(`❌ Users API Proxy Error (${backendServicePath}/${path}):`, error);
    
    // 네트워크 에러인 경우 503으로 처리
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch') || error.message.includes('ENOTFOUND')) {
      return NextResponse.json({ 
        success: false,
        error: '백엔드 서버에 연결할 수 없습니다.',
        message: '서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
        details: `연결 실패: ${error.message}`
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Internal Server Error',
      message: error.message 
    }, { status: 500 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };