import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/utils/config";

// 이 부분만 각 서비스에 맞게 변경하면 됩니다.
const backendServicePath = "auth";

async function handler(request, { params }) {
  // 1. 요청 경로 조합
  // ex: /api/auth/mypage -> ['mypage'] -> "mypage"
  // ex: /api/auth/admin/1 -> ['admin', '1'] -> "admin/1"
  const path = params.slug ? params.slug.join("/") : "";

  // 2. 백엔드 API URL 생성
  // ex: http://localhost:8000/api/auth/mypage
  const backendUrl = getApiUrl(`/api/${backendServicePath}/${path}`);

  // 3. 쿼리 파라미터가 있다면 그대로 전달
  const { search } = new URL(request.url);
  const urlWithQuery = `${backendUrl}${search}`;

  const accessToken = cookies().get("access-token")?.value;

  const headers = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const backendResponse = await fetch(urlWithQuery, {
      method: request.method,
      headers: headers,
      // GET, HEAD 요청에는 body가 없으므로 조건부로 추가
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
      // duplex: 'half'는 Next.js 13 이상에서 스트리밍 body를 전송할 때 필요
      // @ts-ignore
      duplex: "half",
    });

    // 백엔드 서버가 503을 반환하는 경우 처리
    if (backendResponse.status === 503) {
      console.error(`백엔드 서버 에러 (${backendServicePath}/${path}): 503 Service Unavailable`);
      return NextResponse.json(
        { error: "백엔드 서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요." },
        { status: 503 }
      );
    }

    return backendResponse;
  } catch (error) {
    console.error(`API Proxy Error (${backendServicePath}/${path}):`, error);
    
    // 네트워크 에러인 경우
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch')) {
      return NextResponse.json(
        { error: "백엔드 서버에 연결할 수 없습니다. 서버 상태를 확인해주세요." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};
