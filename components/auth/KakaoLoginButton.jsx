'use client';
import Image from "next/image";

const kakaoApiUrl = process.env.NEXT_PUBLIC_API_URL;
const KakaoLoginButton = () => {
  //env 파일에서 환경변수 가져오기
  const handleLogin = () => {
    window.location.href = `${kakaoApiUrl}/api/auth/oauth2/kakao`;
  }

  return (
    <button onClick={handleLogin} className="w-full h-full">
      <Image
        src="/images/kakao_login_medium_wide.png"
        alt="카카오 로그인"
        width={600}
        height={90}
        className="w-full h-auto"
      />
    </button>
  );
};

export default KakaoLoginButton;