'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useLazyImage } from '@/hooks/usePerformance';

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) return '방금 전';
  if (diffInHours < 24) return `${diffInHours}시간 전`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// 조회수 포맷팅 함수
const formatViews = (views) => {
  if (!views) return '0';
  if (views < 1000) return views.toString();
  if (views < 10000) return `${(views / 1000).toFixed(1)}K`;
  if (views < 1000000) return `${(views / 1000).toFixed(0)}K`;
  return `${(views / 1000000).toFixed(1)}M`;
};

// 카테고리 색상 매핑
const getCategoryColor = (category) => {
  const colors = {
    POLITICS: 'bg-red-100 text-red-800',
    ECONOMY: 'bg-green-100 text-green-800',
    SOCIETY: 'bg-blue-100 text-blue-800',
    LIFE: 'bg-purple-100 text-purple-800',
    INTERNATIONAL: 'bg-orange-100 text-orange-800',
    IT_SCIENCE: 'bg-indigo-100 text-indigo-800',
    VEHICLE: 'bg-gray-100 text-gray-800',
    TRAVEL_FOOD: 'bg-pink-100 text-pink-800',
    ART: 'bg-yellow-100 text-yellow-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

// 카테고리 한글명 매핑
const getCategoryName = (category) => {
  const names = {
    POLITICS: '정치',
    ECONOMY: '경제',
    SOCIETY: '사회',
    LIFE: '생활',
    INTERNATIONAL: '세계',
    IT_SCIENCE: 'IT/과학',
    VEHICLE: '자동차',
    TRAVEL_FOOD: '여행/음식',
    ART: '예술',
  };
  return names[category] || category;
};

const NewsCard = memo(
  ({
    newsId,
    title,
    content,
    category,
    source,
    sourceLogo,
    url,
    imageUrl,
    publishedAt,
    views,
    tags = [],
    reporter,
    dedupState,
    dedupStateDescription,
    className = '',
    compact = false,
    news, // news 객체도 받을 수 있도록 추가
  }) => {
    // news 객체가 전달된 경우 해당 속성들을 사용
    const actualNewsId = newsId || news?.newsId || news?.id;
    const actualTitle = title || news?.title;
    const actualContent = content || news?.content || news?.summary;
    const actualCategory = category || news?.category || news?.categoryName;
    const actualSource = source || news?.source || news?.press;
    const actualSourceLogo = sourceLogo || news?.sourceLogo;
    const actualUrl = url || news?.url;
    const actualImageUrl = imageUrl || news?.imageUrl || news?.image;
    const actualPublishedAt = publishedAt || news?.publishedAt;
    const actualViews = views || news?.views;
    const actualTags = tags.length > 0 ? tags : (news?.tags || []);
    const actualReporter = reporter || news?.reporter;
    const actualDedupState = dedupState || news?.dedupState;
    const actualDedupStateDescription = dedupStateDescription || news?.dedupStateDescription;

    // 디버깅을 위한 로그
    if (!actualNewsId) {
      console.warn('NewsCard: newsId가 없습니다.', { newsId, news });
    }
    // 이미지 지연 로딩
    const { imageSrc, isLoading: imageLoading } = useLazyImage(actualImageUrl, '/placeholder.svg');

    // 메모이제이션된 값들
    const formattedDate = useMemo(() => formatDate(actualPublishedAt), [actualPublishedAt]);
    const formattedViews = useMemo(() => formatViews(actualViews), [actualViews]);
    const categoryColor = useMemo(() => getCategoryColor(actualCategory), [actualCategory]);
    const categoryName = useMemo(() => getCategoryName(actualCategory), [actualCategory]);

    // 제목과 내용 길이 제한
    const truncatedTitle = useMemo(() => {
      if (compact) {
        return actualTitle.length > 50 ? actualTitle.substring(0, 50) + '...' : actualTitle;
      }
      return actualTitle.length > 80 ? actualTitle.substring(0, 80) + '...' : actualTitle;
    }, [actualTitle, compact]);

    const truncatedContent = useMemo(() => {
      if (!actualContent) return '';
      const maxLength = compact ? 60 : 120;
      return actualContent.length > maxLength ? actualContent.substring(0, maxLength) + '...' : actualContent;
    }, [actualContent, compact]);

    return (
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
        <Link href={`/news/${actualNewsId}`} className="block">
          <div className="relative">
            {/* 이미지 */}
            <div className={`relative overflow-hidden ${compact ? 'h-32' : 'h-48'}`}>
              <img
                src={imageSrc}
                alt={actualTitle}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                loading="lazy"
              />
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
              )}

              {/* 중복 상태 표시 */}
              {actualDedupState && actualDedupState !== 'NORMAL' && (
                <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                  {actualDedupStateDescription || actualDedupState}
                </Badge>
              )}
            </div>

            {/* 카테고리 배지 */}
            <Badge className={`absolute top-2 left-2 ${categoryColor}`}>{categoryName}</Badge>
          </div>

          <CardHeader className={`pb-2 ${compact ? 'p-3' : 'p-4'}`}>
            <CardTitle className={`line-clamp-2 ${compact ? 'text-sm' : 'text-lg'}`}>
              {truncatedTitle}
            </CardTitle>

            {!compact && truncatedContent && (
              <CardDescription className="line-clamp-2 text-sm text-gray-600">
                {truncatedContent}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className={`pt-0 ${compact ? 'p-3' : 'p-4'}`}>
            {/* 메타 정보 */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{formattedViews}</span>
              </div>
            </div>

            {/* 기자 정보 */}
            {actualReporter && (
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={actualReporter.avatar} alt={actualReporter.name} />
                  <AvatarFallback className="text-xs">{actualReporter.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-600">{actualReporter.name}</span>
              </div>
            )}

            {/* 출처 정보 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {actualSourceLogo && (
                  <img
                    src={actualSourceLogo}
                    alt={actualSource}
                    className="h-4 w-4 object-contain"
                    loading="lazy"
                  />
                )}
                <span className="text-xs text-gray-500">{actualSource}</span>
              </div>

              {actualUrl && <ExternalLink className="h-3 w-3 text-gray-400" />}
            </div>

            {/* 태그 */}
            {actualTags.length > 0 && !compact && (
              <div className="flex flex-wrap gap-1 mt-2">
                {actualTags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Link>
      </Card>
    );
  },
);

NewsCard.displayName = 'NewsCard';

export default NewsCard;
