
import { Mail } from "lucide-react";

export default function NewsletterHeader() {
  return (
    <div className="mb-6 animate-slide-in">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
        <Mail className="h-8 w-8 mr-3 text-purple-500 animate-pulse-slow" />
        뉴스레터
      </h1>
      <p className="text-gray-600">관심 있는 주제의 뉴스레터를 구독하고 최신 정보를 받아보세요</p>
    </div>
  );
}
