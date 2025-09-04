import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/config";

// 뉴스레터 서비스용 백엔드 경로 (백엔드는 단수형 'newsletter' 사용)
const backendServicePath = "newsletter";

async function handler(request, { params }) {
  // 1. 요청 경로 조합
  const path = params.slug ? params.slug.join("/") : "";

  // 2. 백엔드 API URL 생성
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
    console.log(`🔄 Newsletter API 프록시: ${request.method} ${urlWithQuery}`);

    const backendResponse = await fetch(urlWithQuery, {
      method: request.method,
      headers: headers,
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? request.body
          : undefined,
      // @ts-ignore
      duplex: "half",
    });

    console.log(
      `📡 Newsletter API 응답: ${backendResponse.status} ${backendResponse.statusText}`
    );
    return backendResponse;
  } catch (error) {
    console.error(
      `❌ Newsletter API Proxy Error (${backendServicePath}/${path}):`,
      error
    );
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
