"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CollectionHeader from "./_components/CollectionHeader";
import CategoryFilters from "./_components/CategoryFilters";
import NewsGrid from "./_components/NewsGrid";
import CollectionPagination from "./_components/CollectionPagination";
import ShareModal from "./_components/ShareModal";
import AddScrapsToCollectionModal from "./_components/AddScrapsToCollectionModal";
import AddToCollectionModal from "../../_components/AddToCollectionModal";
import { authenticatedFetch } from "@/lib/auth/auth";

const CollectionDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.collectionId;

  const [collectionInfo, setCollectionInfo] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [inputQuery, setInputQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [selectedNewsForShare, setSelectedNewsForShare] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  const [isAddScrapsModalOpen, setAddScrapsModalOpen] = useState(false);
  const [isAddToCollectionModalOpen, setAddToCollectionModalOpen] =
    useState(false);
  const [modalNewsItems, setModalNewsItems] = useState([]);

  const fetchData = useCallback(async () => {
    if (!collectionId) return;

    if (currentPage === 0) {
      setIsLoading(true);
    }
    setIsNewsLoading(true);

    try {
      const infoPromise = authenticatedFetch(
        `/api/news/collections/${collectionId}`
      );

      const urlParams = new URLSearchParams({
        page: String(currentPage),
        size: "12",
      });
      if (searchQuery) urlParams.append("query", searchQuery);
      if (selectedCategory && selectedCategory !== "전체")
        urlParams.append("category", selectedCategory);
      const newsPromise = authenticatedFetch(
        `/api/news/collections/${collectionId}/news?${urlParams.toString()}`
      );

      const [infoResponse, newsResponse] = await Promise.all([
        infoPromise,
        newsPromise,
      ]);

      if (!infoResponse.ok) {
        const errorText = await infoResponse.text();
        throw new Error(errorText || "컬렉션 정보를 불러오는데 실패했습니다.");
      }
      const infoData = await infoResponse.json();
      setCollectionInfo(infoData);
      if (!isEditing) {
        setEditedName(infoData.storageName);
      }

      if (!newsResponse.ok) {
        const errorText = await newsResponse.text();
        throw new Error(
          errorText || "컬렉션의 기사 목록을 불러오는데 실패했습니다."
        );
      }
      const newsData = await newsResponse.json();
      setNewsList(newsData.content || []);
      setPageInfo(newsData);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("인증")) {
        toast.error("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
        setTimeout(() => router.push("/auth"), 2000);
      } else {
        toast.error(err.message);
      }
    } finally {
      setIsLoading(false);
      setIsNewsLoading(false);
    }
  }, [collectionId, currentPage, selectedCategory, searchQuery, router, isEditing]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== inputQuery) {
        setSearchQuery(inputQuery);
        setCurrentPage(0);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputQuery, searchQuery]);

  const handleUpdateCollectionName = async () => {
    if (!editedName.trim()) {
      toast.error("컬렉션 이름은 비워둘 수 없습니다.");
      return;
    }
    try {
      const response = await authenticatedFetch(
        `/api/news/collections/${collectionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newName: editedName }),
        }
      );

      if (response.ok) {
        const updatedCollection = await response.json();
        setCollectionInfo(updatedCollection);
        toast.success("컬렉션 이름이 변경되었습니다.");
        setIsEditing(false);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "이름 변경에 실패했습니다.");
      }
    } catch (err) {
      if (err.message.includes("이미 존재하는 컬렉션 이름입니다")) {
        toast.error("이미 존재하는 컬렉션 이름입니다.");
      } else {
        toast.error(err.message || "이름 변경 중 오류가 발생했습니다.");
      }
    }
  };

  const handleRemoveArticle = async (newsId) => {
    try {
      const response = await authenticatedFetch(
        `/api/news/collections/${collectionId}/news/${newsId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("컬렉션에서 기사를 삭제했습니다.");
        fetchData();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "기사 삭제에 실패했습니다.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setInputQuery("");
    setSearchQuery("");
    setCurrentPage(0);
  };

  const handleOpenShareModal = (news) => {
    setSelectedNewsForShare(news);
    setShareModalOpen(true);
  };

  const openAddScrapsModal = () => setAddScrapsModalOpen(true);
  const closeAddScrapsModal = () => setAddScrapsModalOpen(false);

  const openAddToCollectionModal = (items) => {
    setModalNewsItems(items);
    setAddToCollectionModalOpen(true);
  };
  const closeAddToCollectionModal = () => {
    setAddToCollectionModalOpen(false);
    setModalNewsItems([]);
  };

  const handleAddSuccess = () => {
    setCurrentPage(0);
    setSelectedCategory("전체");
    setSearchQuery("");
    setInputQuery("");
    fetchData();
  };

  return (
    <>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        newsData={selectedNewsForShare}
      />
      <AddScrapsToCollectionModal
        isOpen={isAddScrapsModalOpen}
        onClose={closeAddScrapsModal}
        collectionId={collectionId}
        onSuccess={handleAddSuccess}
      />
      {isAddToCollectionModalOpen && (
        <AddToCollectionModal
          isOpen={isAddToCollectionModalOpen}
          onClose={closeAddToCollectionModal}
          newsItems={modalNewsItems}
          onSuccess={closeAddToCollectionModal}
        />
      )}

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <Link
              href="/mypage"
              className="inline-flex items-center text-base text-gray-600 hover:text-blue-600 transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              마이페이지로 돌아가기
            </Link>
          </div>

          {isLoading && (
            <div className="text-center py-20 text-lg font-semibold"></div>
          )}
          {error && (
            <div className="text-center py-20 text-red-600">{error}</div>
          )}

          {!isLoading && !error && collectionInfo && (
            <>
              <CollectionHeader
                collectionInfo={collectionInfo}
                pageInfo={pageInfo}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editedName={editedName}
                setEditedName={setEditedName}
                handleUpdateCollectionName={handleUpdateCollectionName}
                inputQuery={inputQuery}
                setInputQuery={setInputQuery}
              />

              <CategoryFilters
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                onAddScraps={openAddScrapsModal}
              />

              <main>
                <NewsGrid
                  isNewsLoading={isNewsLoading}
                  newsList={newsList}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  onRemove={handleRemoveArticle}
                  onShare={handleOpenShareModal}
                  onAddToCollection={openAddToCollectionModal}
                />
              </main>

              <CollectionPagination
                pageInfo={pageInfo}
                setCurrentPage={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CollectionDetailPage;
