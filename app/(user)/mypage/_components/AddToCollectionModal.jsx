/**
 * 컬렉션에 뉴스 추가 모달 컴포넌트 (DB 스키마에 맞춘 최종본)
 */
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
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const AddToCollectionModal = ({ isOpen, onClose, newsId, newsTitle }) => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNewCollectionName("");
      setError(null);
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

  const handleAddToCollection = async (collectionId, collectionName) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    try {
      const response = await fetch(`/api/news/collections/${collectionId}/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newsId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '컬렉션에 뉴스를 추가하는데 실패했습니다.');
      }
      toast.success(`'${newsTitle}' 뉴스를 '${collectionName}' 컬렉션에 추가했습니다.`);
      onClose();
    } catch (err) {
      toast.error(err.message);
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
      toast.success(`'${newCollection.storageName}' 컬렉션이 생성되었습니다.`);
      setCollections(prev => [newCollection, ...prev]);
      setNewCollectionName("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>컬렉션에 추가</DialogTitle>
            <DialogDescription>"{newsTitle}" 뉴스를 추가할 컬렉션을 선택하거나, 추가할 컬렉션이 없으면 새 컬렉션을 만들어서 기사를 추가하세요.</DialogDescription>
          </DialogHeader>
          <div className="my-4 max-h-48 overflow-y-auto">
            {isLoading ? (
                <p>로딩 중...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : collections.length > 0 ? (
                <div className="space-y-2">
                  {collections.map((collection) => (
                      <button
                          key={collection.storageId}
                          onClick={() => handleAddToCollection(collection.storageId, collection.storageName)}
                          className="w-full text-left p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        {collection.storageName}
                      </button>
                  ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-4">생성된 컬렉션이 없습니다.</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">새 컬렉션 만들기</p>
            <div className="flex space-x-2">
              <Input
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="새 컬렉션 이름"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
              />
              <Button onClick={handleCreateCollection}>만들기</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
};

export default AddToCollectionModal;