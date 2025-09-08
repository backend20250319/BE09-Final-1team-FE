"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookMarked,
  Trash2,
  Newspaper,
  CalendarDays,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/auth";

const useCollections = () => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch("/api/news/collections");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "컬렉션 목록을 불러오는데 실패했습니다.");
      }
      const data = await response.json();
      setCollections(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCollections([]);
      if (err.message !== "세션이 만료되었습니다. 다시 로그인해주세요.") {
        toast.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    isLoading,
    error,
    setCollections,
    refetch: fetchCollections,
  };
};

const CreateCollectionModal = ({ isOpen, onClose, onCollectionCreated }) => {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("컬렉션 이름을 입력해주세요.");
      return;
    }
    setIsCreating(true);
    try {
      const response = await authenticatedFetch("/api/news/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageName: name }),
      });

      if (response.ok) {
        toast.success(`'${name}' 컬렉션이 생성되었습니다.`);
        onCollectionCreated();
        onClose();
        setName("");
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "컬렉션 생성에 실패했습니다.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">새 컬렉션 만들기</h2>
        <Input
          placeholder="컬렉션 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isCreating}>
            취소
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "생성 중..." : "만들기"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Components ---
const CollectionCard = ({ collection, onDelete }) => {
  const formattedDate = new Date(collection.createdAt).toLocaleDateString();

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl group flex flex-col">
      <Link
        href={`/mypage/collections/${collection.storageId}`}
        className="block"
      >
        <div className="relative w-full h-40 bg-gradient-to-br from-indigo-500 to-purple-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <BookMarked className="w-16 h-16 text-white opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
          <div className="absolute bottom-0 left-0 p-4 w-full">
            <h3 className="text-xl font-bold text-white break-words line-clamp-2 leading-tight group-hover:text-yellow-300 transition-colors">
              {collection.storageName}
            </h3>
          </div>
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-gray-500" />
              <span>기사 {collection.newsCount}개</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gray-500" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 hover:border-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                이 컬렉션을 삭제하면 되돌릴 수 없습니다. 컬렉션 안의 스크랩은
                삭제되지 않습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(collection.storageId)}
                className="bg-red-600 hover:bg-red-700"
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};

const MyCollectionsTab = () => {
  const { collections, isLoading, error, setCollections, refetch } =
    useCollections();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  const handleDelete = async (collectionId) => {
    try {
      const response = await authenticatedFetch(
        `/api/news/collections/${collectionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("컬렉션이 삭제되었습니다.");
        setCollections((prev) =>
          prev.filter((c) => c.storageId !== collectionId)
        );
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "컬렉션 삭제에 실패했습니다.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredCollections = collections.filter((c) =>
    c.storageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <CreateCollectionModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCollectionCreated={refetch}
      />

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="내 컬렉션 검색"
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="w-full md:w-auto flex-shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />새 컬렉션 만들기
        </Button>
      </div>

      {isLoading && <div className="text-center">컬렉션을 불러오는 중...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}

      {!isLoading &&
        !error &&
        (filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCollections.map((collection) => (
              <CollectionCard
                key={collection.storageId}
                collection={collection}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-20">
            <p>
              {searchQuery
                ? "검색된 컬렉션이 없습니다."
                : "생성된 컬렉션이 없습니다."}
            </p>
          </div>
        ))}
    </div>
  );
};

export default MyCollectionsTab;
