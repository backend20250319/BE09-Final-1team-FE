import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '전체';

    // RSS 피드 생성
    const rssFeed = generateRSSFeed(category);

    return new NextResponse(rssFeed, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 1시간 캐시
      },
    });

  } catch (error) {
    console.error('RSS 피드 생성 에러:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'RSS 피드를 생성할 수 없습니다.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function generateRSSFeed(category) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
  const currentDate = new Date().toUTCString();
  
  // 실제 구현에서는 데이터베이스에서 뉴스 데이터를 가져와야 함
  const sampleNews = [
    {
      title: `${category} 관련 주요 뉴스 1`,
      description: '이것은 샘플 뉴스 설명입니다.',
      link: `${baseUrl}/news/1`,
      pubDate: new Date().toUTCString(),
      guid: 'news-1'
    },
    {
      title: `${category} 관련 주요 뉴스 2`,
      description: '이것은 또 다른 샘플 뉴스 설명입니다.',
      link: `${baseUrl}/news/2`,
      pubDate: new Date(Date.now() - 3600000).toUTCString(), // 1시간 전
      guid: 'news-2'
    }
  ];

  const rssItems = sampleNews.map(news => `
    <item>
      <title><![CDATA[${news.title}]]></title>
      <description><![CDATA[${news.description}]]></description>
      <link>${news.link}</link>
      <guid isPermaLink="false">${news.guid}</guid>
      <pubDate>${news.pubDate}</pubDate>
    </item>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NewSphere ${category} 뉴스레터</title>
    <description>${category} 카테고리의 최신 뉴스를 RSS로 받아보세요</description>
    <link>${baseUrl}</link>
    <language>ko-KR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/api/newsletters/rss?category=${encodeURIComponent(category)}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/placeholder-logo.png</url>
      <title>NewSphere ${category} 뉴스레터</title>
      <link>${baseUrl}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;
}
