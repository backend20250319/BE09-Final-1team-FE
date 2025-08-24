import {NextResponse} from 'next/server';

export async function POST(request) {
  const { email } = await request.json();

  // 여기서 이메일 구독 로직을 처리합니다.
  console.log('구독 요청 수신:', email);

  return NextResponse.json({ message: '구독이 완료되었습니다.' });
}

