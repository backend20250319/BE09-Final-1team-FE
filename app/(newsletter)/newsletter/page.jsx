import { newsletterService } from '@/lib/newsletterService'
import NewsletterPageClient from './NewsletterPageClient'

// SEO를 위한 메타데이터
export const metadata = {
  title: '뉴스레터 - 최신 정보를 받아보세요',
  description: '관심 있는 주제의 뉴스레터를 구독하고 최신 정보를 받아보세요. 정치, 경제, 사회, IT/과학 등 다양한 카테고리의 뉴스레터를 제공합니다.',
  keywords: '뉴스레터, 구독, 뉴스, 정보, 이메일',
  openGraph: {
    title: '뉴스레터 - 최신 정보를 받아보세요',
    description: '관심 있는 주제의 뉴스레터를 구독하고 최신 정보를 받아보세요.',
    type: 'website',
  },
}

export default async function NewsletterPage() {
  // 서버에서 초기 뉴스레터 데이터 가져오기 (SSR)
  let initialNewsletters = null
  
  try {
    initialNewsletters = await newsletterService.getNewsletters()
  } catch (error) {
    console.error('❌ 서버에서 뉴스레터 데이터 로딩 실패:', error)
    // 서버에서 실패해도 클라이언트에서 재시도할 수 있도록 null 전달
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* 초기 데이터와 함께 클라이언트 컴포넌트로 전달 */}
      <NewsletterPageClient initialNewsletters={initialNewsletters} />
    </div>
  )
} 