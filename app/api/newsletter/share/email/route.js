import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/utils/config";

// /api/newsletter/share/email - 이메일 공유
export async function POST(request) {
  try {
    const accessToken = cookies().get("access-token")?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const { newsletterId, recipientEmail, personalizedData, shareUrl } = await request.json();
    
    // 백엔드 API로 이메일 공유 요청
    const backendUrl = getApiUrl('/api/newsletter/share/email');
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        newsletterId,
        recipientEmail,
        personalizedData,
        shareUrl
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      message: '이메일로 공유되었습니다',
      data: result
    });
  } catch (error) {
    console.error('이메일 공유 실패:', error);
    return NextResponse.json({ error: '이메일 공유 실패' }, { status: 500 });
  }
}
