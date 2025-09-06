// 카테고리별로 기사를 필터링하는 컴포넌트
import React from 'react';
import { Button } from '@/components/ui/button';

const categories = [
  "전체",
  "정치",
  "경제",
  "사회",
  "생활",
  "세계",
  "IT/과학",
  "자동차/교통",
  "여행/음식",
  "예술",
];

const CategoryFilters = ({ selectedCategory, onCategoryChange, onAddScraps }) => {
  return (
    <div className="my-6">
      <div className="flex justify-between items-center gap-2">
        <div className="w-full overflow-x-auto">
          <div className="flex space-x-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => onCategoryChange(cat)}
                className="whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={onAddScraps} className="flex-shrink-0">
          기사 추가하기
        </Button>
      </div>
    </div>
  );
};

export default CategoryFilters;
