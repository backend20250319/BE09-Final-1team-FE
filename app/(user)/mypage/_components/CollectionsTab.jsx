/**
 * 사용자 정의 뉴스 컬렉션 탭 컴포넌트 (DB 스키마에 맞춘 최종본)
 */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import Link from 'next/link';

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
      const response = await fetch('/api/news/collections', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '컬렉션을 불러오는 데 실패했습니다.');
      }
      const data = await response.json();
      setCollections(data || []);
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
      setCollections(prev => [newCollection, ...prev]);
      setNewCollectionName("");
      toast.success(`'${newCollection.storageName}' 컬렉션이 생성되었습니다.`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">나의 컬렉션</h2>
        <form onSubmit={handleCreateCollection} className="mb-6 flex gap-2">
          <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="새 컬렉션 이름"
              className="flex-grow p-2 border rounded-md"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            만들기
          </button>
        </form>

        {isLoading && <p>로딩 중...</p>}
        {error && !isLoading && <p className="text-red-500">{error}</p>}

        {!isLoading && !error && (
            <div className="space-y-2">
              {collections.length > 0 ? (
                  collections.map((collection) => (
                    <Link key={collection.storageId} href={`/mypage/collections/${collection.storageId}`} passHref>
                        <div className="p-3 bg-gray-50 rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-100">
                            <span className="font-semibold">{collection.storageName}</span>
                            <span className="text-sm text-gray-500">{collection.newsCount || 0}개</span>
                        </div>
                    </Link>
                  ))
              ) : (
                  <p>아직 생성된 컬렉션이 없습니다. 새 컬렉션을 만들어보세요!</p>
              )}
            </div>
        )}
      </div>
  );
};

export default CollectionsTab;