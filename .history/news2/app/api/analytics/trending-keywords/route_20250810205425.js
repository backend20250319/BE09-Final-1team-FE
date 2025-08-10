import { NextResponse } from "next/server";
import { newsArticles } from "../../../../lib/news-data";

/**
 * GET /api/analytics/trending-keywords
 * 트렌딩 키워드를 분석하여 반환합니다
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h'; // 24h, 7d, 30d
    const limit = parseInt(searchParams.get('limit')) || 10;

    // 뉴스 데이터에서 키워드 추출 및 분석
    const keywordStats = {};
    const now = new Date();
    
    newsArticles.forEach(article => {
      const articleDate = new Date(article.publishedAt);
      let includeArticle = false;
      
      // 기간별 필터링
      switch (period) {
        case '24h':
          includeArticle = (now - articleDate) <= 24 * 60 * 60 * 1000;
          break;
        case '7d':
          includeArticle = (now - articleDate) <= 7 * 24 * 60 * 60 * 1000;
          break;
        case '30d':
          includeArticle = (now - articleDate) <= 30 * 24 * 60 * 60 * 1000;
          break;
        default:
          includeArticle = true;
      }
      
      if (includeArticle) {
        // 제목에서 키워드 추출
        const titleWords = article.title
          .replace(/[^\w\s가-힣]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 1 && word.length < 10);
        
        titleWords.forEach(word => {
          if (!keywordStats[word]) {
            keywordStats[word] = {
              keyword: word,
              count: 0,
              articles: [],
              pressCount: new Set(),
              categories: new Set()
            };
          }
          keywordStats[word].count++;
          keywordStats[word].articles.push({
            id: article.id,
            title: article.title,
            press: article.source,
            publishedAt: article.publishedAt
          });
          keywordStats[word].pressCount.add(article.source);
          keywordStats[word].categories.add(article.category);
        });
        
        // 태그에서 키워드 추출
        if (article.tags) {
          article.tags.forEach(tag => {
            if (!keywordStats[tag]) {
              keywordStats[tag] = {
                keyword: tag,
                count: 0,
                articles: [],
                pressCount: new Set(),
                categories: new Set()
              };
            }
            keywordStats[tag].count++;
            keywordStats[tag].articles.push({
              id: article.id,
              title: article.title,
              press: article.source,
              publishedAt: article.publishedAt
            });
            keywordStats[tag].pressCount.add(article.source);
            keywordStats[tag].categories.add(article.category);
          });
        }
      }
    });

    // 키워드 통계 정리
    const trendingKeywords = Object.values(keywordStats)
      .map(stat => ({
        keyword: stat.keyword,
        count: stat.count,
        pressCount: stat.pressCount.size,
        categoryCount: stat.categories.size,
        pressList: Array.from(stat.pressCount),
        categories: Array.from(stat.categories),
        recentArticles: stat.articles
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 5)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    // 시간대별 분석
    const hourlyStats = {};
    const pressStats = {};
    const categoryStats = {};
    
    newsArticles.forEach(article => {
      const articleDate = new Date(article.publishedAt);
      const hour = articleDate.getHours();
      
      // 시간대별 통계
      hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
      
      // 언론사별 통계
      pressStats[article.source] = (pressStats[article.source] || 0) + 1;
      
      // 카테고리별 통계
      categoryStats[article.category] = (categoryStats[article.category] || 0) + 1;
    });

    const response = {
      period,
      totalKeywords: Object.keys(keywordStats).length,
      trendingKeywords,
      analytics: {
        hourlyDistribution: Object.entries(hourlyStats)
          .map(([hour, count]) => ({ hour: parseInt(hour), count }))
          .sort((a, b) => a.hour - b.hour),
        topPress: Object.entries(pressStats)
          .map(([press, count]) => ({ press, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        topCategories: Object.entries(categoryStats)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      }
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('트렌딩 키워드 분석 오류:', error);
    return NextResponse.json(
      { error: '트렌딩 키워드 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
