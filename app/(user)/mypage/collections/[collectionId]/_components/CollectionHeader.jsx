// 컬렉션 상세 페이지의 헤더 (제목, 정보, 검색창) 컴포넌트
import React from 'react';
import {
  Newspaper,
  CalendarDays,
  Pencil,
  Check,
  XCircle,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CollectionHeader = ({
  collectionInfo,
  pageInfo,
  isEditing,
  setIsEditing,
  editedName,
  setEditedName,
  handleUpdateCollectionName,
  inputQuery,
  setInputQuery,
}) => {
  return (
    <header className="mb-6 pb-4 border-b">
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        <div className="flex-grow">
          {!isEditing ? (
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                {collectionInfo.storageName}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditing(true);
                  setEditedName(collectionInfo.storageName);
                }}
              >
                <Pencil className="w-6 h-6" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1 text-4xl font-extrabold"
              />
              <Button size="icon" onClick={handleUpdateCollectionName}>
                <Check className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditing(false);
                  setEditedName(collectionInfo.storageName);
                }}
              >
                <XCircle className="w-6 h-6" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-6 mt-4 text-base text-gray-500">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              <span>
                기사 {pageInfo ? pageInfo.totalElements : 0}개
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              <span>
                생성일 :{' '}
                {new Date(collectionInfo.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="relative w-full md:w-72 mt-4 md:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="기사 검색"
            className="pl-10"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
};

export default CollectionHeader;
