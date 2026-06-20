import { useState, useMemo } from 'react';

export const usePagination = (data = [], itemsPerPage = 10) => {
    const safeData = Array.isArray(data) ? data : [];
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(safeData.length / itemsPerPage);

    // Ensure currentPage is within bounds if data length changes (e.g. searching)
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    } else if (currentPage <= 0 && totalPages > 0) {
        setCurrentPage(1);
    }

    const currentData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return safeData.slice(start, end);
    }, [currentPage, itemsPerPage, safeData]);

    const next = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const prev = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const jump = (page) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    };

    return { next, prev, jump, currentData, currentPage, totalPages, itemsPerPage };
};
