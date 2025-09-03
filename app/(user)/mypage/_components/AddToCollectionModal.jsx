"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Search, Plus } from 'lucide-react';

const AddToCollectionModal = ({ isOpen, onClose, newsIds, onSuccess }) => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [addingToCollectionId, setAddingToCollectionId] = useState(null);
  const [collectionSearchQuery, setCollectionSearchQuery] = useState("");

  const itemCount = newsIds?.length || 0;
  const isSingleItemAdd = itemCount === 1;

  useEffect(() => {
    if (isOpen) {
      setNewCollectionName("");
      setError(null);
      setIsCreating(false);
      setAddingToCollectionId(null);
      setCollectionSearchQuery("");

      const fetchCollections = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("로그인이 필요합니다.");
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        try {
          const response = await fetch('/api/news/collections', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '컬렉션 목록을 불러오는데 실패했습니다.');
          }
          const data = await response.json();
          setCollections(data || []);
        } catch (err) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCollections();
    }
  }, [isOpen]);

  const handleAddToCollection = async (collectionId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    setAddingToCollectionId(collectionId);
    try {
      const responses = await Promise.all(
        newsIds.map(newsId =>
          fetch(`/api/news/collections/${collectionId}/news`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ newsId }),
          })
        )
      );

      let successfulCount = 0;
      let duplicateCount = 0;
      let otherFailureCount = 0;

      for (const res of responses) {
        if (res.ok) {
          successfulCount++;
        } else {
          const errorText = await res.text();
          const isDuplicate = res.status === 409 || (errorText && errorText.includes("이미"));

          if (isDuplicate) {
            duplicateCount++;
          } else {
            otherFailureCount++;
            console.error("Unhandled error while adding to collection:", errorText);
          }
        }
      }

      // --- 알림 메시지 로직 ---
      if (isSingleItemAdd) {
        if (successfulCount > 0) toast.success("기사를 컬렉션에 추가했습니다.");
        if (duplicateCount > 0) toast.info("이미 컬렉션에 추가된 기사입니다.");
        if (otherFailureCount > 0) toast.error("기사 추가에 실패했습니다.");
      } else {
        if (successfulCount > 0) toast.success(`${successfulCount}개의 기사를 컬렉션에 추가했습니다.`);
        if (duplicateCount > 0) toast.info(`${duplicateCount}개의 기사는 이미 컬렉션에 존재합니다.`);
        if (otherFailureCount > 0) toast.error(`${otherFailureCount}개의 기사 추가에 실패했습니다.`);
      }

      // --- 모달 닫기 로직 ---
      if (successfulCount > 0) {
        if (onSuccess) onSuccess();
        onClose();
      } else if (!isSingleItemAdd && duplicateCount === itemCount) {
        // 여러 개를 추가했는데 모든 기사가 중복일 경우에만 닫기
        onClose();
      }
      // 단일 추가이고 중복일 경우에는 모달을 닫지 않음

    } catch (err) {
      toast.error('요청 처리 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setAddingToCollectionId(null);
    }
  };

  const handleCreateCollection = async () => {
    const token = localStorage.getItem("accessToken");
    if (!newCollectionName.trim()) {
      toast.error("새 컬렉션의 이름을 입력해주세요.");
      return;
    }
    if (!token) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    setIsCreating(true);
    try {
      const response = await fetch('/api/news/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ storageName: newCollectionName }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '컬렉션 생성에 실패했습니다.');
      }
      const newCollection = await response.json();
      toast.success(`'${newCollectionName}' 컬렉션이 생성되었습니다.`);
      setCollections(prev => [newCollection, ...prev]);
      setNewCollectionName("");
      await handleAddToCollection(newCollection.storageId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredCollections = collections.filter(collection =>
    collection.storageName.toLowerCase().includes(collectionSearchQuery.toLowerCase())
  );

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>컬렉션에 추가</DialogTitle>
            <DialogDescription>
              {isSingleItemAdd ? "이 기사를 추가할 컬렉션을 선택하세요." : `선택한 ${itemCount}개의 기사를 추가할 컬렉션을 선택하세요.`}
            </DialogDescription>
          </DialogHeader>

          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="컬렉션 검색..."
              value={collectionSearchQuery}
              onChange={(e) => setCollectionSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-48 overflow-y-auto pr-2">
            {isLoading ? (
                <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : error ? (
                <p className="text-red-500 text-center">{error}</p>
            ) : filteredCollections.length > 0 ? (
                <div className="space-y-2">
                  {filteredCollections.map((collection) => (
                      <div
                          key={collection.storageId}
                          className="w-full text-left p-2 bg-gray-50 rounded-md flex items-center justify-between"
                      >
                        <span className="font-medium px-2">{collection.storageName}</span>
                        <Button 
                          size="sm"
                          onClick={() => handleAddToCollection(collection.storageId)}
                          disabled={addingToCollectionId !== null || isCreating}
                        >
                          {addingToCollectionId === collection.storageId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              추가
                            </>
                          )}
                        </Button>
                      </div>
                  ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-4">
                  {collectionSearchQuery ? "검색 결과가 없습니다." : "생성된 컬렉션이 없습니다."}
                </p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">새 컬렉션 만들기</p>
            <div className="flex space-x-2">
              <Input
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="새 컬렉션 이름"
                  onKeyDown={(e) => e.key === 'Enter' && !isCreating && handleCreateCollection()}
                  disabled={isCreating || addingToCollectionId !== null}
              />
              <Button onClick={handleCreateCollection} disabled={isCreating || addingToCollectionId !== null}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                만들기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
};

export default AddToCollectionModal;
