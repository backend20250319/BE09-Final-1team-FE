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
  Pencil,
  X,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/auth/auth";

// --- Hooks ---
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
      if (!err.message.includes("인증")) {
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

// --- Modals ---
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
      if (err.message.includes("이미 존재하는 컬렉션 이름입니다")) {
        toast.error("이미 존재하는 컬렉션 이름입니다.");
      } else {
        toast.error(err.message || "컬렉션 생성 중 오류가 발생했습니다.");
      }
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">새 컬렉션 만들기</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Input
          placeholder="컬렉션 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            취소
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "생성 중" : "만들기"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const EditCollectionModal = ({
  isOpen,
  onClose,
  collection,
  onCollectionUpdated,
}) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (collection) {
      setName(collection.storageName);
    }
  }, [collection]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("컬렉션 이름은 비워둘 수 없습니다.");
      return;
    }
    setIsSaving(true);
    try {
      const response = await authenticatedFetch(
        `/api/news/collections/${collection.storageId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newName: name }),
        }
      );

      if (response.ok) {
        toast.success("컬렉션 이름이 변경되었습니다.");
        onCollectionUpdated();
        onClose();
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
    } finally {
      setIsSaving(false);
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">컬렉션 이름 변경</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "저장 중" : "저장"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Components ---

const colorPalettes = [
  ["#ff9a9e", "#fecfef"],
  ["#a1c4fd", "#c2e9fb"],
  ["#d4fc79", "#96e6a1"],
  ["#f6d365", "#fda085"],
  ["#fbc2eb", "#a6c1ee"],
  ["#84fab0", "#8fd3f4"],
  ["#ffecd2", "#fcb69f"],
  ["#a8edea", "#fed6e3"],
  ["#e0c3fc", "#8ec5fc"],
  ["#f093fb", "#f5576c"],
  ["#fa709a", "#fee140"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#667eea", "#764ba2"],
];

const generateGradientFromPalette = (text, offset = 0) => {
  let hash = 0;
  if (!text || text.length === 0) text = "default";
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = (Math.abs(hash) + offset) % colorPalettes.length;
  const [color1, color2] = colorPalettes[index];
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

const CollectionCard = ({ collection, onEdit, onDelete }) => {
  const formattedDate = new Date(collection.createdAt).toLocaleDateString();

  return (
    <Card className="overflow-visible group border-none bg-transparent shadow-none">
      <Link
        href={`/mypage/collections/${collection.storageId}`}
        className="block cursor-pointer"
      >
        <div className="relative w-full aspect-video mb-3">
          <div
            className="absolute w-[95%] h-[95%] bottom-0 right-0 rounded-lg shadow-md transition-transform duration-300 group-hover:-translate-y-3 group-hover:-translate-x-2 group-hover:rotate-[-6deg]"
            style={{
              background: generateGradientFromPalette(
                collection.storageName,
                1
              ),
            }}
          />
          <div
            className="absolute w-[95%] h-[95%] bottom-0 right-0 rounded-lg shadow-md transition-transform duration-300 group-hover:-translate-y-3 group-hover:translate-x-2 group-hover:rotate-6"
            style={{
              background: generateGradientFromPalette(
                collection.storageName,
                2
              ),
            }}
          />
          <div
            className="absolute w-full h-full bottom-0 right-0 rounded-lg shadow-lg flex items-center justify-center"
            style={{
              background: generateGradientFromPalette(
                collection.storageName,
                0
              ),
            }}
          >
            <BookMarked className="w-12 h-12 text-white opacity-70" />
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-black bg-opacity-60 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            <Layers className="h-3 w-3" />
            <span>기사 {collection.newsCount}개</span>
          </div>
        </div>
      </Link>
      <CardContent className="p-0">
        <div className="flex items-start gap-3">
          <div className="flex-grow">
            <Link
              href={`/mypage/collections/${collection.storageId}`}
              className="block cursor-pointer"
            >
              <h3 className="font-bold text-base break-words line-clamp-2 leading-tight text-gray-800 group-hover:text-indigo-600 transition-colors">
                {collection.storageName}
              </h3>
            </Link>
            <div className="text-sm text-gray-500 mt-1">
              <span>{formattedDate}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(collection)}
            >
              <Pencil className="w-4 h-4 text-gray-500 hover:text-indigo-600 transition-colors" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600 transition-colors" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 컬렉션을 삭제하면 되돌릴 수 없습니다. 컬렉션 안의
                    스크랩은 삭제되지 않습니다.
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
        </div>
      </CardContent>
    </Card>
  );
};

const CollectionsTab = () => {
  const { collections, isLoading, error, refetch } =
    useCollections();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState(null);

  const handleOpenEditModal = (collection) => {
    setCollectionToEdit(collection);
    setEditModalOpen(true);
  };

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
        refetch(); // 삭제 후 전체 목록 다시 로드
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

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const paginatedCollections = filteredCollections.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div>
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCollectionCreated={refetch}
      />
      <EditCollectionModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        collection={collectionToEdit}
        onCollectionUpdated={refetch}
      />

      <Card>
        <CardHeader className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg flex-shrink-0">
                    <BookMarked className="h-6 w-6" />
                    </div>
                    <div>
                    <h2 className="text-lg font-bold text-gray-800">나만의 컬렉션 관리</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      스크랩한 기사들을 주제별로 모아 나만의 뉴스 컬렉션을 만들어 볼 수 있습니다.
                    </p>
                    </div>
                </div>
                <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="w-full md:w-auto mt-15 flex-shrink-0 bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" />새 컬렉션 만들기
                </Button>
            </div>
            <div className="relative mt-4">
                <Search className="absolute mt-2 left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="내 컬렉션 검색"
                    className="pl-10 w-full mt-4 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
            {isLoading && (
                <div className="text-center py-10"></div>
            )}
            {error && <div className="text-center text-red-500 py-10">{error}</div>}

            {!isLoading && !error && (
                <>
                {paginatedCollections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                    {paginatedCollections.map((collection) => (
                        <CollectionCard
                        key={collection.storageId}
                        collection={collection}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDelete}
                        />
                    ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-24 border-2 border-dashed rounded-xl bg-gray-50">
                    <BookMarked className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">
                        {searchQuery
                        ? "검색된 컬렉션이 없습니다."
                        : "아직 생성된 컬렉션이 없습니다."}
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                        새 컬렉션을 만들어 스크랩한 기사를 관리해보세요.
                    </p>
                    <Button onClick={() => setCreateModalOpen(true)} className="mt-6">
                        <Plus className="mr-2 h-4 w-4" />새 컬렉션 만들기
                    </Button>
                    </div>
                )}
                </>
            )}
        </CardContent>
        {totalPages > 1 && (
            <CardFooter className="justify-center pt-6 border-t">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage((p) => Math.max(0, p - 1));
                            }}
                            aria-disabled={currentPage === 0}
                            className={
                                currentPage === 0
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                        />
                        </PaginationItem>
                        {[...Array(totalPages).keys()].map((pageNumber) => (
                        <PaginationItem key={pageNumber}>
                            <PaginationLink
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNumber);
                            }}
                            isActive={currentPage === pageNumber}
                            >
                            {pageNumber + 1}
                            </PaginationLink>
                        </PaginationItem>
                        ))}
                        <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage((p) =>
                                Math.min(totalPages - 1, p + 1)
                                );
                            }}
                            aria-disabled={currentPage >= totalPages - 1}
                            className={
                                currentPage >= totalPages - 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                        />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default CollectionsTab;
