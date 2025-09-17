'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

const googleApiUrl = process.env.NEXT_PUBLIC_API_URL;
const GoogleLoginButton = () => {
  const handleLogin = () => {
    window.location.href = `${googleApiUrl}/api/auth/oauth2/google`;
  };

  return (
    // 기존 <button> 태그 대신 Button 컴포넌트를 사용합니다.
    <Button
      onClick={handleLogin}
      variant="outline" // 흰색 배경과 테두리를 가진 'outline' variant 사용
      className="w-full h-11" // 기존 버튼들과 높이 통일
    >
      {/* 자식 요소로 아이콘과 텍스트를 전달합니다. */}
      <Image
        src="/images/google_logo.png"
        alt="구글 로고"
        width={18}
        height={18}
      />
      <span className="text-black/85 text-[15px] font-bold">
        Google로 로그인
      </span>
    </Button>
  );
};

export default GoogleLoginButton;