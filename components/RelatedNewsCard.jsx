import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";

const RelatedNewsCard = ({ news }) => {
  return (
      <Link href={`/news/${news.newsId}`} className="block group">
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
          <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
            <img
                src={news.imageUrl}
                alt={news.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <CardHeader>
            <CardTitle className="text-lg font-bold leading-tight group-hover:text-indigo-700 line-clamp-2">
              {news.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1 line-clamp-1">
              {news.press}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-gray-600 line-clamp-3">
              {news.content}
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-gray-400">
              {new Date(news.publishedAt).toLocaleDateString('ko-KR')}
            </p>
          </CardFooter>
        </Card>
      </Link>
  );
};

export default RelatedNewsCard;