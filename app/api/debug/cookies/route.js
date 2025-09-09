import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    return NextResponse.json({
      success: true,
      cookies: allCookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value?.substring(0, 50) + (cookie.value?.length > 50 ? '...' : ''),
        hasValue: !!cookie.value,
        length: cookie.value?.length || 0
      })),
      count: allCookies.length
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
