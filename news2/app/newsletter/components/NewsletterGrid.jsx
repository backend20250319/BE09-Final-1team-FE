
import NewsletterCard from "./NewsletterCard";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsletterGrid({ filteredNewsletters, isLoaded, subscribedNewsletters, handleSubscribe, selectedCategory, setSelectedCategory }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredNewsletters.map((newsletter, index) => (
        <NewsletterCard 
          key={newsletter.id}
          newsletter={newsletter} 
          isLoaded={isLoaded} 
          index={index} 
          subscribedNewsletters={subscribedNewsletters} 
          handleSubscribe={handleSubscribe} 
        />
      ))}
      
      {filteredNewsletters.length === 0 && (
        <div className="col-span-2 text-center py-12">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedCategory} 카테고리의 뉴스레터가 없습니다
          </h3>
          <p className="text-gray-500 mb-4">
            다른 카테고리를 선택하거나 나중에 다시 확인해보세요.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSelectedCategory("전체")}
            className="hover-lift"
          >
            전체 뉴스레터 보기
          </Button>
        </div>
      )}
    </div>
  );
}
