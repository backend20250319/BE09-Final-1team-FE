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
  // ex: http://localhost:8000/api/users/mypage
  const backendUrl = getApiUrl(`/api/${backendServicePath}/${path}`);

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
    const backendResponse = await fetch(urlWithQuery, {
      method: request.method,
      headers: headers,
      // GET, HEAD 요청에는 body가 없으므로 조건부로 추가
      body: (request.method !== 'GET' && request.method !== 'HEAD') ? request.body : undefined,
      // duplex: 'half'는 Next.js 13 이상에서 스트리밍 body를 전송할 때 필요
      // @ts-ignore
      duplex: 'half' 
    });

    return backendResponse;

  } catch (error) {
    console.error(`API Proxy Error (${backendServicePath}/${path}):`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };