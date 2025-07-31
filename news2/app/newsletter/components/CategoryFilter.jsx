
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export default function CategoryFilter({ categories, selectedCategory, setSelectedCategory, isLoaded, newsletters, filteredNewsletters }) {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">카테고리별 필터:</span>
      </div>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category, index) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap hover-lift ${
              isLoaded ? 'animate-slide-in' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {category}
          </Button>
        ))}
      </div>
      <div className="mt-2 text-sm text-gray-500">
        {selectedCategory === "전체" 
          ? `전체 ${newsletters.length}개의 뉴스레터`
          : `${selectedCategory} 카테고리 ${filteredNewsletters.length}개의 뉴스레터`
        }
      </div>
    </div>
  );
}
