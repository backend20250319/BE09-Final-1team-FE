// 컬렉션 상세 페이지의 페이지네이션 컴포넌트
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const CollectionPagination = ({ pageInfo, setCurrentPage }) => {
  if (!pageInfo || pageInfo.totalPages <= 1) {
    return null;
  }

  const { totalPages, first, last, number: currentPage } = pageInfo;

  return (
    <div className="mt-12 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage((p) => Math.max(0, p - 1));
              }}
              aria-disabled={first}
              className={first ? "pointer-events-none opacity-50" : ""}
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
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
              }}
              aria-disabled={last}
              className={last ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default CollectionPagination;
