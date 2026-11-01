// components/ui/Pagination.tsx — Ateliya Premium Pagination "Cool Edition"
"use client";

import React, { useState } from "react";
import { 
    ChevronLeft, 
    ChevronRight, 
    ChevronsLeft, 
    ChevronsRight,
    ArrowRight
} from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalItems?: number;
    itemsPerPage?: number;
    totalPages?: number;
    pageSizeOptions?: (number | { label: string; value: number })[];
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (limit: number) => void;
    className?: string;
    style?: React.CSSProperties;
    itemLabel?: string;
}

export const Pagination = ({
    currentPage,
    totalItems = 0,
    itemsPerPage = 50,
    totalPages: propTotalPages,
    pageSizeOptions = [10, 30, 50, 100],
    onPageChange,
    onItemsPerPageChange,
    className = "",
    style,
    itemLabel = "résultats",
}: PaginationProps) => {
    const totalPages = propTotalPages ?? Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const [jumpPage, setJumpPage] = useState("");

    const startItem = totalItems === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalItems <= 0 && !propTotalPages) return null;

    const getPageNumbers = (): (number | "...")[] => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages: (number | "...")[] = [1];
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);

        if (currentPage <= 3) { start = 2; end = 5; }
        if (currentPage >= totalPages - 2) { start = totalPages - 4; end = totalPages - 1; }

        if (start > 2) pages.push("...");
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
        return pages;
    };

    const handleJump = (e: React.FormEvent) => {
        e.preventDefault();
        const p = parseInt(jumpPage, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
            onPageChange(p);
            setJumpPage("");
        }
    };

    return (
        <div className={`flex flex-col md:flex-row items-center justify-between gap-3 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs ${className}`} style={style}>
            
            {/* Left: Info & Items per page */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Affichage</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-none">
                        <span className="text-slate-900 dark:text-slate-100 font-bold">{startItem}–{endItem}</span>
                        <span className="text-slate-400 mx-1">sur</span>
                        <span className="text-slate-900 dark:text-slate-100 font-bold">{totalItems}</span>
                        <span className="ml-1 text-slate-500">{itemLabel}</span>
                    </p>
                </div>

                {onItemsPerPageChange && (
                    <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-500">Afficher :</span>
                        <select 
                            value={itemsPerPage}
                            onChange={(e) => {
                                const newLimit = parseInt(e.target.value, 10);
                                onItemsPerPageChange(newLimit);
                                onPageChange(1);
                            }}
                            className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 outline-none cursor-pointer transition-colors"
                        >
                            {pageSizeOptions.map((opt) => {
                                const val = typeof opt === 'number' ? opt : opt.value;
                                const label = typeof opt === 'object' && opt.label 
                                    ? opt.label 
                                    : (val >= 99999 ? "Tous" : `${val} / page`);
                                return (
                                    <option key={val} value={val}>{label}</option>
                                );
                            })}
                        </select>
                    </div>
                )}
            </div>

            {/* Center: Navigation Numbers */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <PaginBtn 
                    onClick={() => onPageChange(1)} 
                    disabled={currentPage === 1} 
                    icon={<ChevronsLeft className="w-4 h-4" />} 
                    title="Première page"
                />
                <PaginBtn 
                    onClick={() => onPageChange(currentPage - 1)} 
                    disabled={currentPage === 1} 
                    icon={<ChevronLeft className="w-4 h-4" />} 
                    title="Précédent"
                />

                <div className="flex items-center gap-1 px-1">
                    {getPageNumbers().map((page, i) =>
                        page === "..." ? (
                            <span key={`dots-${i}`} className="w-7 h-7 flex items-center justify-center text-slate-400 text-xs">
                                ···
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page as number)}
                                className={`
                                    w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150
                                    ${currentPage === page
                                        ? "bg-teal-700 text-white shadow-xs scale-105"
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-teal-800"
                                    }
                                `}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                <PaginBtn 
                    onClick={() => onPageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages} 
                    icon={<ChevronRight className="w-4 h-4" />} 
                    title="Suivant"
                />
                <PaginBtn 
                    onClick={() => onPageChange(totalPages)} 
                    disabled={currentPage === totalPages} 
                    icon={<ChevronsRight className="w-4 h-4" />} 
                    title="Dernière page"
                />
            </div>

            {/* Right: Go to page */}
            {totalPages > 1 && (
                <form onSubmit={handleJump} className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Page</span>
                    <input 
                        type="text" 
                        value={jumpPage}
                        onChange={(e) => setJumpPage(e.target.value)}
                        placeholder={`1-${totalPages}`}
                        className="w-12 h-7 text-xs font-bold text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-teal-600 dark:focus:border-teal-400 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!jumpPage}
                        className="w-7 h-7 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-600 dark:text-slate-300 hover:text-teal-700 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </form>
            )}
        </div>
    );
};

interface PaginBtnProps {
    onClick: () => void;
    disabled: boolean;
    icon: React.ReactNode;
    title: string;
}

const PaginBtn = ({ onClick, disabled, icon, title }: PaginBtnProps) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="w-7 h-7 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-teal-700 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
    >
        {icon}
    </button>
);