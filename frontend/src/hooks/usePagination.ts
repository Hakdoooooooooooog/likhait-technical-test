import { useMemo, useState } from "react";
import { paginate, PaginationResult } from "../utils/paginationUtils";

export function usePagination<T>(
  items: T[],
  pageSize: number = 10,
  initialPage: number = 1
): PaginationResult<T> & {
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  goToPage: (page: number) => void;
} {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const pagination = useMemo(() => {
    return paginate(items, currentPage, pageSize);
  }, [items, currentPage, pageSize]);

  return {
    ...pagination,
    setCurrentPage,
    goToPage: (page: number) => setCurrentPage(page),
  };
}
