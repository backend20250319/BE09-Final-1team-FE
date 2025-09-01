"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Archive, Trash2, ListVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

const CollectionsTab = () => {
  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("로그인이 필요합니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/news/collections", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "컬렉션을 불러오는 데 실패했습니다.");
      }
      const data = await response.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) {
      toast.error("컬렉션 이름을 입력해주세요.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch("/api/news/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storageName: newCollectionName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "컬렉션 생성에 실패했습니다.");
      }

      const newCollection = await response.json();
      setCollections((prev) => [newCollection, ...prev]);
      setNewCollectionName("");
      toast.success(`'${newCollection.storageName}' 컬렉션이 생성되었습니다.`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch(`/api/news/collections/${collectionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "컬렉션 삭제에 실패했습니다.");
      }

      setCollections((prev) => prev.filter((collection) => collection.storageId !== collectionId));
      toast.success("컬렉션이 삭제되었습니다.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">나의 컬렉션</h2>
        <form onSubmit={handleCreateCollection} className="flex w-full md:w-auto gap-2">
          <Input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="새 컬렉션 이름"
            className="flex-grow"
          />
          <Button type="submit">
            <Archive className="mr-2 h-4 w-4" /> 만들기
          </Button>
        </form>
      </div>

      {isLoading && <div className="text-center"></div>}
      {error && !isLoading && <div className="text-center text-red-500">{error}</div>}

      {!isLoading && !error && (
        <>
          {collections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {collections.map((collection) => (
                <Card key={collection.storageId} className="group overflow-hidden">
                  <Link href={`/mypage/collections/${collection.storageId}`} passHref>
                    <div className="relative">
                      <div className="aspect-video w-full overflow-hidden">
                        <Image
                          src={collection.thumbnailUrl || "/placeholder.svg"}
                          alt={collection.storageName}
                          width={400}
                          height={225}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                      <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 m-2 rounded-md flex items-center gap-1">
                        <ListVideo className="h-4 w-4" />
                        <span>{collection.newsCount || 0}</span>
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg break-words pr-2">
                        {collection.storageName}
                      </h3>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <Trash2 className="h-4 w-4 text-gray-500 group-hover:text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                            <AlertDialogDescription>
                              '{collection.storageName}' 컬렉션을 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCollection(collection.storageId)}>
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Archive className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">생성된 컬렉션이 없습니다.</h3>
              <p className="mt-1 text-sm text-gray-500">새 컬렉션을 만들어 뉴스를 관리해보세요.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CollectionsTab;