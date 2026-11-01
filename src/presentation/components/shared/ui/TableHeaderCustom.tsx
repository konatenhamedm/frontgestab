import { useTranslation } from "react-i18next";
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";


/** Clé de catalogue dérivée d'un en-tête français. Les en-têtes sont passés en
 *  tableaux de chaînes depuis chaque page : les traduire ici évite de câbler
 *  les 85 fichiers qui utilisent ce composant. Doit rester aligné sur la
 *  génération des clés `th.*` dans les fichiers de traduction. */
const cleEntete = (texte: string) =>
  'th.' + texte.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

interface TableHeaderCustomProps {
  items: string[];
  afficheAction?: boolean;
  actionWidth?: string;
  selectable?: boolean;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  onSelectAll?: (checked: boolean) => void;
  hideSelectAllCheckbox?: boolean;
}

export const TableHeaderCustom: React.FC<TableHeaderCustomProps> = ({
  items,
  afficheAction = true,
  actionWidth = "150px",
  selectable = false,
  isAllSelected = false,
  isIndeterminate = false,
  onSelectAll,
  hideSelectAllCheckbox = false,
}) => {
  const { t } = useTranslation();
  return (
    <TableHeader>
      <TableRow className="bg-[#1f2a37] hover:bg-[#1f2a37] border-b border-[#2b3949]">
        {selectable && (
          <TableHead className="w-12 px-4 py-4 text-center">
            {!hideSelectAllCheckbox && (
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-emerald-500"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={(e) => onSelectAll?.(e.target.checked)}
              />
            )}
          </TableHead>
        )}
        {(items || []).map((title, index) => (
          <TableHead
            key={index}
            className="px-6 py-4 text-[12px] font-bold text-white uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0"
          >
            {t(cleEntete(title), title)}
          </TableHead>
        ))}
        {afficheAction && (
          <TableHead
            className="px-6 py-4 text-[12px] font-bold text-white uppercase tracking-wider text-right w-1 whitespace-nowrap"
          >
            {t("table.actions", "Actions")}
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
};