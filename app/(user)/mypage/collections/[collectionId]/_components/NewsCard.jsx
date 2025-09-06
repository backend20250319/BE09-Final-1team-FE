// 개별 뉴스 기사를 표시하는 카드 컴포넌트
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BookOpen, Share, FolderPlus, Trash2 } from 'lucide-react';

const backendToFrontendCategory = {
  POLITICS: "정치",
  ECONOMY: "경제",
  SOCIETY: "사회",
  LIFE: "생활",
  INTERNATIONAL: "세계",
  IT_SCIENCE: "IT/과학",
  VEHICLE: "자동차/교통",
  TRAVEL_FOOD: "여행/음식",
  ART: "예술",
};

const NewsCard = ({ news, onRemove, onShare, onAddToCollection }) => {
  const press = news.press || "정보 없음";
  const rawCategory = news.categoryName;
  const category =
    backendToFrontendCategory[rawCategory] || rawCategory || "기타";
  const imageSrc = news.imageUrl || "/placeholder.svg";

  return (
    <Card className="overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md">
      <div className="relative w-full h-40">
        <Link href={`/news/${news.newsId}`} className="block w-full h-full">
          <Image
            src={imageSrc}
            alt={news.title}
            fill
            className="object-cover"
          />
        </Link>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
              <span>{press}</span>
              <Badge variant="secondary">{category}</Badge>
            </div>
          </div>
          <Link
            href={`/news/${news.newsId}`}
            className="font-semibold text-base hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2"
          >
            {news.title}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4">
          <Link href={`/news/${news.newsId}`} passHref legacyBehavior>
            <Button variant="outline" size="sm" as="a">
              <BookOpen className="mr-2 h-4 w-4" /> 읽기
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => onShare(news)}>
            <Share className="mr-2 h-4 w-4" /> 공유
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddToCollection([{ newsId: news.newsId, title: news.title }])}
          >
            <FolderPlus className="mr-2 h-4 w-4" /> 추가
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" /> 삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>컬렉션에서 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  이 기사를 컬렉션에서 삭제하시겠습니까? 스크랩 목록에는 그대로
                  유지됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(news.newsId)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
};

export default NewsCard;