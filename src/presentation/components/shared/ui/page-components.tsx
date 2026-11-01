/**
 * Composants de layout réutilisables pour les pages de liste
 * Moomen Pro — Design System B2B
 */
import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomSelect } from "./CustomSelect";

// ─────────────────────────────────────────────────────────────
// PageHeader — titre + bouton d'action principal
// ─────────────────────────────────────────────────────────────
interface PageHeaderProps {
    title: string;
    description?: string;
    subtitle?: string; // Alias pour description
    icon?: React.ReactNode;
    action?: React.ReactNode;
    count?: number;
    children?: React.ReactNode; // Pour les actions passées en enfants
}

export function PageHeader({ title, description, subtitle, icon, action, count, children }: PageHeaderProps) {
    const desc = subtitle || description;
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff4a0a, #8f2b05)' }}>
                        <span className="text-white">{icon}</span>
                    </div>
                )}
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-[17px] font-black text-gray-900">{title}</h1>
                        {count !== undefined && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                                {count}
                            </span>
                        )}
                    </div>
                    {desc && (
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    )}
                </div>
            </div>
            {(action || children) && (
                <div className="flex items-center gap-2 flex-shrink-0">
                    {action}
                    {children}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// FilterCard — Card de filtres premium
// ─────────────────────────────────────────────────────────────
interface FilterCardProps {
    children: React.ReactNode;
    className?: string;
}

export function FilterCard({ children, className }: FilterCardProps) {
    return (
        <div className={cn(
            "bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3.5 mb-4 flex flex-wrap items-end gap-3",
            "ring-1 ring-gray-100/80",
            className
        )}>
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// FilterField — Champ dans un FilterCard
// ─────────────────────────────────────────────────────────────
interface FilterFieldProps {
    label?: string;
    children: React.ReactNode;
    className?: string;
    required?: boolean;
}

export function FilterField({ label, children, className, required }: FilterFieldProps) {
    return (
        <div className={cn("flex flex-col gap-1 min-w-[160px]", className)}>
            {label && (
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// TableCard — wrapper card pour les tableaux
// ─────────────────────────────────────────────────────────────
interface TableCardProps {
    title?: string;
    count?: number;
    actions?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function TableCard({ title, count, actions, children, footer, className }: TableCardProps) {
    return (
        <div className={cn("bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden", className)}>
            {title && (
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[13px] font-black text-gray-800">{title}</h3>
                        {count !== undefined && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">{count}</span>
                        )}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className="overflow-x-auto">
                {children}
            </div>
            {footer && (
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40">
                    {footer}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SubHeader — en-tête de page standard (titre + badge + bouton)
// Utilisé dans toutes les pages index pour uniformiser l'affichage
// ─────────────────────────────────────────────────────────────
export interface SubHeaderProps {
    /** Titre principal de la page */
    title: string;
    /** Icône dans le badge coloré à gauche du titre */
    icon?: React.ReactNode;
    /** Nombre d'éléments dans le tableau (badge pastille) */
    count?: number;
    /** Description optionnelle sous le titre */
    description?: string;
    /** Nœud React du bouton d'action principal (ex: bouton "Ajouter") */
    action?: React.ReactNode;
    /** Classes CSS supplémentaires pour le conteneur */
    className?: string;
}

export function SubHeader({ title, icon, count, description, action, className }: SubHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 px-5 py-4 rounded-2xl",
                className
            )}
            style={{
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,74,10,0.14)',
                boxShadow: '0 4px 24px -6px rgba(143,43,5,0.10), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
        >
            {/* Left: icon + text */}
            <div className="flex items-center gap-3.5 min-w-0">
                {icon && (
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, #ff4a0a 0%, #8f2b05 100%)',
                            boxShadow: '0 4px 14px -3px rgba(255,74,10,0.45)',
                        }}
                    >
                        {icon}
                    </div>
                )}
                <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-[17px] font-black text-gray-900 leading-tight tracking-tight">{title}</h1>
                        {count !== undefined && (
                            <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black leading-none"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255,74,10,0.15), rgba(143,43,5,0.08))',
                                    color: '#8f2b05',
                                    border: '1px solid rgba(255,74,10,0.2)',
                                }}
                            >
                                {count}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate font-medium">{description}</p>
                    )}
                </div>
            </div>

            {/* Right: action button */}
            {action && (
                <div className="flex items-center gap-2 shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SubHeaderButton — bouton d'action standard pour les SubHeader
// ─────────────────────────────────────────────────────────────
export interface SubHeaderButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
    label?: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'default';
    disabled?: boolean;
    className?: string;
}

export function SubHeaderButton({ onClick, children, label, icon, variant = 'primary', disabled, className }: SubHeaderButtonProps) {
    const styles: Record<string, React.CSSProperties> = {
        primary: { background: 'linear-gradient(135deg, #ff4a0a, #8f2b05)' },
        default: { background: 'linear-gradient(135deg, #ff4a0a, #8f2b05)' },
        secondary: { background: '#f3f4f6', color: '#374151' },
        danger: { background: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
    };

    const isSecondary = variant === 'secondary';
    const activeStyle = !isSecondary ? (styles[variant] || styles.primary) : undefined;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150",
                "hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-sm hover:shadow",
                isSecondary
                    ? "text-gray-700 border border-gray-200 hover:bg-gray-100"
                    : "text-white",
                className
            )}
            style={activeStyle}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            {label || children}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────
// PageLayout — Carte unifiée : header + filtres + tableau
// Fusionne SubHeader + FilterCard + TableCard en un seul bloc
// ─────────────────────────────────────────────────────────────
export interface PageLayoutProps {
    /** Titre de la page */
    title: string;
    /** Icône du titre */
    icon?: React.ReactNode;
    /** Nombre d'éléments */
    count?: number;
    /** Description sous le titre */
    description?: string;
    /** Bouton d'action principal (ex: "Nouveau Pays") */
    action?: React.ReactNode;
    /** Zone de filtres (inputs, selects…) */
    filters?: React.ReactNode;
    /** Contenu principal (tableau, liste…) */
    children: React.ReactNode;
    /** Footer (pagination…) */
    footer?: React.ReactNode;
    className?: string;
}

export function PageLayout({
    title, icon, count, description, action, filters, children, footer, className
}: PageLayoutProps) {
    return (
        <div
            className={cn("rounded-2xl overflow-hidden animate-fade-in-up", className)}
            style={{
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,74,10,0.12)',
                boxShadow: '0 8px 32px -8px rgba(143,43,5,0.10), 0 2px 8px -2px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)',
            }}
        >
            {/* ── Header row ── */}
            <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,74,10,0.06) 0%, rgba(143,43,5,0.03) 100%)',
                    borderBottom: '1px solid rgba(255,74,10,0.10)',
                }}
            >
                <div className="flex items-center gap-3.5 min-w-0">
                    {icon && (
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, #ff4a0a 0%, #8f2b05 100%)',
                                boxShadow: '0 4px 12px -3px rgba(255,74,10,0.4)',
                            }}
                        >
                            {icon}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-[16px] font-black text-gray-900 leading-tight tracking-tight">{title}</h1>
                            {count !== undefined && (
                                <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black leading-none"
                                    style={{
                                        background: 'rgba(255,74,10,0.12)',
                                        color: '#8f2b05',
                                        border: '1px solid rgba(255,74,10,0.2)',
                                    }}
                                >
                                    {count}
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="text-xs text-gray-400 mt-0.5 font-medium truncate">{description}</p>
                        )}
                    </div>
                </div>
                {action && (
                    <div className="flex items-center gap-2 shrink-0">
                        {action}
                    </div>
                )}
            </div>

            {/* ── Filters row ── */}
            {filters && (
                <div
                    className="px-5 py-3.5 flex flex-wrap items-end gap-3"
                    style={{ borderBottom: '1px solid rgba(255,74,10,0.07)', background: 'rgba(255,249,245,0.6)' }}
                >
                    {filters}
                </div>
            )}

            {/* ── Table content ── */}
            <div className="overflow-x-auto">
                {children}
            </div>

            {/* ── Footer (pagination) ── */}
            {footer && (
                <div
                    className="px-4 py-3"
                    style={{ borderTop: '1px solid rgba(255,74,10,0.08)', background: 'rgba(255,249,245,0.5)' }}
                >
                    {footer}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// PrimaryButton
// ─────────────────────────────────────────────────────────────
interface PrimaryButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
    className?: string;
}

export function PrimaryButton({ children, onClick, disabled, type = "button", className = "" }: PrimaryButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1f2a37] hover:bg-[#2b3949] disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm",
                className
            )}
        >
            {children}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────
// SearchBar — barre de recherche + filtre optionnel
// ─────────────────────────────────────────────────────────────
interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    children?: React.ReactNode; // filtres supplémentaires
    onRefresh?: () => void;
    isLoading?: boolean;
    variant?: "default" | "dark";
}

export function SearchBar({ value, onChange, placeholder = "Rechercher...", children, onRefresh, isLoading, variant = "default" }: SearchBarProps) {
    const isDark = variant === "dark";
    
    return (
        <div className={cn(
            "rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 mb-6 border transition-all",
            isDark ? "bg-[#0F1D2F] border-white/5 shadow-2xl" : "bg-white border-slate-200"
        )}>
            <div className="relative flex-1 min-w-[200px]">
                <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isDark ? "text-slate-400" : "text-slate-600")} />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "w-full pl-9 pr-4 py-2 text-sm border rounded-lg transition-all outline-none focus:ring-2",
                        isDark 
                            ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-[#ff4a0a]/40 focus:border-[#ff4a0a] focus:bg-white/10"
                            : "bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:ring-[#ff4a0a]/20 focus:border-[#ff4a0a] focus:bg-white"
                    )}
                />
            </div>
            {children}
            {onRefresh && (
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className={cn(
                        "p-2 rounded-lg border transition-colors disabled:opacity-50",
                        isDark 
                            ? "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                    title="Actualiser"
                >
                    <RefreshCw className={cn("w-4 h-4", isLoading ? "animate-spin" : "")} />
                </button>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// AdvancedFilters — Groupe de filtres standard (Période, Statut, etc)
// ─────────────────────────────────────────────────────────────
interface AdvancedFiltersProps {
    period: string;
    onPeriodChange: (val: string) => void;
    status?: string;
    onStatusChange?: (val: string) => void;
    startDate?: string;
    onStartDateChange?: (val: string) => void;
    endDate?: string;
    onEndDateChange?: (val: string) => void;
    statusOptions?: { label: string; value: string }[];
    variant?: "default" | "dark";
}

export function AdvancedFilters({
    period,
    onPeriodChange,
    status,
    onStatusChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    statusOptions = [
        { label: "Tous les statuts", value: "all" },
        { label: "Actifs", value: "active" },
        { label: "Inactifs", value: "inactive" },
    ],
    variant = "default"
}: AdvancedFiltersProps) {
    const isDark = variant === "dark";
    const selectBase = cn(
        "h-9 px-3 text-xs font-bold border rounded-lg outline-none focus:ring-2 transition-all",
        isDark 
            ? "bg-white/5 border-white/10 text-white focus:ring-[#ff4a0a]/40 focus:border-[#ff4a0a]" 
            : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-[#ff4a0a]/20 focus:border-[#ff4a0a]"
    );
    
    return (
        <div className="flex flex-wrap items-center gap-3">
            {onStatusChange && (
                <CustomSelect
                    options={statusOptions}
                    value={status}
                    onChange={(opt: any) => onStatusChange(opt?.value || "all")}
                    containerClassName="w-[180px] mb-0"
                    isSearchable={false}
                />
            )}

            <CustomSelect
                options={[
                    { value: "all", label: "Toutes dates" },
                    { value: "today", label: "Aujourd'hui" },
                    { value: "month", label: "Ce mois" },
                    { value: "year", label: "Cette année" },
                    { value: "period", label: "Période personnalisée" }
                ]}
                value={period}
                onChange={(opt: any) => onPeriodChange(opt?.value || "all")}
                containerClassName="w-[200px] mb-0"
                isSearchable={false}
            />

            {period === 'period' && onStartDateChange && onEndDateChange && (
                <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="h-9 px-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none"
                    />
                    <span className="text-slate-400 font-bold text-xs">à</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="h-9 px-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none"
                    />
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// DataTable wrapper — conteneur tableau pro
// ─────────────────────────────────────────────────────────────
interface DataTableProps {
    title?: string;
    titleIcon?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    headers?: string[];
    loading?: boolean;
    isEmpty?: boolean;
    emptyMessage?: string;
    actions?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function DataTable({ title, titleIcon, children, footer, headers, loading, isEmpty, emptyMessage, actions, className, style }: DataTableProps) {
    return (
        <div className={cn("bg-white border border-slate-200 rounded-xl overflow-hidden", className)} style={style}>
            {title && (
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {titleIcon && <span className="text-[#ff4a0a]">{titleIcon}</span>}
                        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
                    </div>
                    {actions && <div className="flex items-center gap-3">{actions}</div>}
                </div>
            )}
            <div className="overflow-x-auto min-h-[100px]">
                {headers ? (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1f2a37] border-b border-[#2b3949]">
                            <tr>
                                {headers.map((h, i) => (
                                    <th key={i} className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-white border-r border-white/10 last:border-r-0">
                                        {h}
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-white text-right w-[180px]">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <TableSkeletonRows cols={headers.length + 1} />
                            ) : isEmpty ? (
                                <EmptyState cols={headers.length + 1} message={emptyMessage} />
                            ) : (
                                children
                            )}
                        </tbody>
                    </table>
                ) : (
                    children
                )}
            </div>
            {footer && (
                <div className="px-4 border-t border-slate-100 bg-slate-50/30">
                    {footer}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// TableSkeletonRows — lignes squelettes durante chargement
// ─────────────────────────────────────────────────────────────
interface TableSkeletonProps {
    cols: number;
    rows?: number;
}

export function TableSkeletonRows({ cols, rows = 6 }: TableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 animate-pulse">
                    {Array.from({ length: cols }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                            <div className={cn("h-4 bg-slate-100 rounded", j === 0 ? "w-3/4" : j === cols - 1 ? "w-1/2 mx-auto" : "w-full")} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

// ─────────────────────────────────────────────────────────────
// EmptyState — état vide
// ─────────────────────────────────────────────────────────────
interface EmptyStateProps {
    message?: string;
    icon?: React.ReactNode;
    cols: number;
}

export function EmptyState({ message = "Aucun résultat trouvé", icon, cols }: EmptyStateProps) {
    return (
        <tr>
            <td colSpan={cols} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-3 text-slate-600">
                    {icon && <div className="opacity-30">{icon}</div>}
                    <p className="text-sm font-medium">{message}</p>
                </div>
            </td>
        </tr>
    );
}

// ─────────────────────────────────────────────────────────────
// ActionButtons — boutons d'actions du tableau (voir/éditer/supprimer)
// ─────────────────────────────────────────────────────────────
interface ActionButtonProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onCheck?: () => void;
    onHistory?: () => void;
    onRenew?: () => void;
    children?: React.ReactNode;
}

export function ActionButtons({ onView, onEdit, onDelete, onCheck, onHistory, onRenew, children }: ActionButtonProps) {
    const btnBase = "inline-flex items-center justify-center w-9 h-9 rounded-md transition-all duration-200 bg-slate-100 hover:bg-slate-200";
    
    return (
        <div className="flex items-center justify-end gap-2">
            {onHistory && (
                <button onClick={onHistory} title="Historique" className={btnBase}>
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            )}
            {onRenew && (
                <button onClick={onRenew} title="Renouveler" className={cn(btnBase, "text-orange-600")}>
                    <RefreshCw className="w-4 h-4" />
                </button>
            )}
            {onCheck && (
                <button onClick={onCheck} title="Valider / Terminer" className={cn(btnBase, "text-emerald-600")}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </button>
            )}
            {onView && (
                <button onClick={onView} title="Voir le détail" className={btnBase}>
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
            )}
            {onEdit && (
                <button onClick={onEdit} title="Modifier" className={cn(btnBase, "text-blue-600")}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
            )}
            {onDelete && (
                <button onClick={onDelete} title="Supprimer" className={cn(btnBase, "text-red-600")}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────
type StatusVariant = "active" | "inactive" | "pending" | "success" | "error" | "warning" | "info";

interface StatusBadgeProps {
    status: boolean | StatusVariant;
    label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
    const isActive = status === true || status === "active" || status === "success";
    const isWarning = status === "warning" || status === "pending";
    const isError = status === false || status === "inactive" || status === "error";

    const cls = isError
        ? "bg-red-50 text-red-600"
        : isWarning
            ? "bg-amber-50 text-amber-600"
            : "bg-green-50 text-green-700";

    const dot = isError
        ? "bg-red-400"
        : isWarning
            ? "bg-amber-400"
            : "bg-green-500";

    const defaultLabel = isError ? "Inactif" : isWarning ? "En attente" : "Actif";

    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium", cls)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
            {label || defaultLabel}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────
// KpiCard — pattern Moomen Pro
// ─────────────────────────────────────────────────────────────
interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    accent?: string;
    trend?: string;
    className?: string;
}

export function KpiCard({ title, value, subtitle, icon, accent = "#ff4a0a", trend, className = "" }: KpiCardProps) {
    return (
        <div className={cn("bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-3 hover:border-violet-200 transition-all duration-300 group", className)}>
            <div className="flex items-start justify-between">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">{title}</p>
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border border-white/10"
                    style={{ backgroundColor: accent }}
                >
                    {icon}
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter italic">{value}</p>
                <div className="flex items-center justify-between">
                    {subtitle && <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic opacity-85">{subtitle}</p>}
                    {trend && (
                        <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black">
                            <ArrowUpRight size={10} strokeWidth={3} />
                            {trend}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ArrowUpRight({ size, strokeWidth, className }: { size?: number, strokeWidth?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────
// TableCell helper component (TD)
// ─────────────────────────────────────────────────────────────
interface TDProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    variant?: "base" | "muted" | "mono" | "bold" | "action";
}

const TD_VARIANTS = {
    base: "px-6 py-4 text-[14px] text-slate-900 border-b border-slate-100 font-medium whitespace-nowrap",
    muted: "px-6 py-4 text-[13px] text-slate-700 border-b border-slate-100 whitespace-nowrap",
    mono: "px-6 py-4 text-xs font-mono text-blue-600 font-bold border-b border-slate-100",
    bold: "px-6 py-4 text-[14px] font-semibold text-slate-950 border-b border-slate-100 whitespace-nowrap",
    action: "px-6 py-4 border-b border-slate-100 text-right w-[180px]",
} as const;

export function TD({ children, variant = "base", className = "", ...props }: TDProps) {
    return (
        <td
            className={cn(TD_VARIANTS[variant], className)}
            {...props}
        >
            {children}
        </td>
    );
}

// Keep static strings for backward compatibility (used in className={TD.bold})
TD.base = TD_VARIANTS.base;
TD.muted = TD_VARIANTS.muted;
TD.mono = TD_VARIANTS.mono;
TD.bold = TD_VARIANTS.bold;
TD.action = TD_VARIANTS.action;
