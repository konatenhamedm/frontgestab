"use client";

import React from 'react';
import Select, { components as defaultComponents, Props as SelectProps } from 'react-select';
import { cn } from '@/lib/utils';

const CustomMenuList = (props: any) => {
    return (
        <defaultComponents.MenuList
            {...props}
            innerProps={{
                ...props.innerProps,
                'data-radix-scroll-lock-ignore': 'true',
                'data-react-remove-scroll-allow': 'true',
                onWheel: (e: any) => {
                    e.stopPropagation();
                    props.innerProps?.onWheel?.(e);
                },
                onTouchMove: (e: any) => {
                    e.stopPropagation();
                    props.innerProps?.onTouchMove?.(e);
                },
            }}
        />
    );
};

interface CustomSelectProps extends Omit<SelectProps<any>, 'value' | 'onChange'> {
    label?: string;
    error?: string;
    className?: string;
    containerClassName?: string;
    isClearable?: boolean;
    value?: any;
    onChange?: (newValue: any, actionMeta?: any) => void;
}

export const CustomSelect = ({
    label,
    error,
    className,
    containerClassName,
    options,
    value,
    onChange,
    placeholder = "Choisir...",
    isSearchable = true,
    isClearable = true,
    isDisabled = false,
    isLoading = false,
    instanceId: providedInstanceId,
    ...props
}: CustomSelectProps) => {
    const internalId = React.useId();
    const instanceId = providedInstanceId || internalId;

    const PRIMARY = '#ff4a0a';
    const PRIMARY_LIGHT = 'rgba(255, 74, 10, 0.08)';
    const PRIMARY_MID = 'rgba(255, 74, 10, 0.18)';
    const PRIMARY_RING = 'rgba(255, 74, 10, 0.15)';

    const selectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            minHeight: '42px',
            borderWidth: '1.5px',
            borderColor: error
                ? '#ef4444'
                : state.isFocused
                    ? PRIMARY
                    : state.menuIsOpen
                        ? PRIMARY
                        : '#cbd5e1',
            borderRadius: '0.75rem',
            fontSize: '13px',
            fontWeight: '600',
            backgroundColor: state.isDisabled ? '#f8fafc' : 'white',
            boxShadow: state.isFocused || state.menuIsOpen
                ? `0 0 0 3px ${PRIMARY_RING}`
                : error
                    ? '0 0 0 3px rgba(239, 68, 68, 0.12)'
                    : 'none',
            '&:hover': {
                borderColor: state.isFocused ? PRIMARY : PRIMARY_MID,
            },
            transition: 'all 0.2s ease',
            cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        }),
        valueContainer: (base: any) => ({
            ...base,
            padding: '0 12px',
            gap: '4px',
        }),
        placeholder: (base: any) => ({
            ...base,
            color: '#94a3b8',
            fontWeight: '500',
            margin: 0,
        }),
        singleValue: (base: any) => ({
            ...base,
            color: '#1e293b',
            fontWeight: '700',
            margin: 0,
        }),
        input: (base: any) => ({
            ...base,
            color: '#1e293b',
            fontWeight: '600',
            margin: 0,
            padding: 0,
        }),
        menu: (base: any) => ({
            ...base,
            zIndex: 9999,
            borderRadius: '0.875rem',
            border: `1.5px solid ${PRIMARY_MID}`,
            boxShadow: `0 10px 25px -5px rgba(255, 74, 10, 0.12), 0 4px 10px -2px rgba(0,0,0,0.06)`,
            padding: '4px',
            marginTop: '4px',
            overflow: 'hidden',
        }),
        menuList: (base: any) => ({
            ...base,
            padding: '4px',
        }),
        option: (base: any, state: any) => ({
            ...base,
            fontSize: '13px',
            padding: '9px 12px',
            borderRadius: '0.625rem',
            cursor: 'pointer',
            marginBottom: '2px',
            fontWeight: state.isSelected ? '700' : '500',
            backgroundColor: state.isSelected
                ? PRIMARY
                : state.isFocused
                    ? PRIMARY_LIGHT
                    : 'transparent',
            color: state.isSelected
                ? 'white'
                : state.isFocused
                    ? PRIMARY
                    : '#374151',
            '&:active': {
                backgroundColor: PRIMARY,
                color: 'white',
            },
            transition: 'all 0.15s ease',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (base: any, state: any) => ({
            ...base,
            color: state.isFocused || state.menuIsOpen ? PRIMARY : '#94a3b8',
            padding: '0 10px',
            transition: 'all 0.2s ease',
            transform: state.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            '&:hover': {
                color: PRIMARY,
            },
        }),
        clearIndicator: (base: any) => ({
            ...base,
            color: '#94a3b8',
            padding: '0 6px',
            '&:hover': {
                color: '#ef4444',
            },
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: PRIMARY_LIGHT,
            borderRadius: '6px',
            border: `1px solid ${PRIMARY_MID}`,
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: PRIMARY,
            fontWeight: '700',
            fontSize: '12px',
            padding: '2px 6px',
        }),
        multiValueRemove: (base: any) => ({
            ...base,
            color: PRIMARY,
            borderRadius: '0 6px 6px 0',
            '&:hover': {
                backgroundColor: PRIMARY,
                color: 'white',
            },
        }),
        menuPortal: (base: any) => ({ ...base, zIndex: 99999, pointerEvents: 'auto' }),
    };

    // Si la valeur courante ne correspond à aucune option actuelle (ex: filtre parent modifié,
    // établissement/centre change...), on n'affiche JAMAIS un identifiant brut fabriqué à la volée
    // (ex: "1298") — seul un objet qui porte déjà son propre libellé explicite peut s'afficher tel
    // quel ; sinon on retombe sur le placeholder plutôt que sur une valeur trompeuse/obsolète.
    const resolvedValue = props.isMulti
        ? (Array.isArray(value)
            ? value.map((v: any) => (typeof v === 'object' && v !== null && 'value' in v) ? v : options?.find((opt: any) => opt.value == v) || null).filter(Boolean)
            : [])
        : (options?.find((opt: any) => opt.value == value || (value && opt.value == (value as any).value))
            ?? (value !== null && value !== undefined && value !== "" && typeof value === 'object' && 'label' in value
                ? value
                : null));

    return (
        <div className={cn("w-full space-y-1.5", containerClassName)}>
            <style>{`
                .react-custom-select__input-container input,
                [class*="-Input"] input {
                    box-shadow: none !important;
                    border: none !important;
                    outline: none !important;
                    background: transparent !important;
                }
                [class*="-Input"] input:focus {
                    box-shadow: none !important;
                    border-color: transparent !important;
                    outline: none !important;
                }
                /* Fix: Radix Dialog sets pointer-events:none on body — override for react-select portal */
                .react-select__menu-portal,
                .react-select__menu-portal *,
                [class$="__menu-portal"],
                [class$="__menu-portal"] * {
                    pointer-events: auto !important;
                }
                .react-custom-select__menu-portal,
                .react-custom-select__menu-portal * {
                    pointer-events: auto !important;
                }
            `}</style>
            {label && (
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    {label}
                </label>
            )}
            <Select
                instanceId={instanceId}
                classNamePrefix="react-custom-select"
                styles={selectStyles}
                components={{
                    MenuList: CustomMenuList,
                    ...props.components,
                }}
                options={options}
                value={resolvedValue}
                onChange={onChange}
                placeholder={placeholder}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                isLoading={isLoading}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                menuPosition="fixed"
                closeMenuOnScroll={false}
                {...props}
            />
            {error && (
                <p className="text-[10px] font-bold text-red-500 ml-1 mt-0.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {error}
                </p>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// CustomSelectCompact — variante compacte pour les cellules de tableau / grilles
// Recherche intégrée (isSearchable), hauteur réduite, style discret.
// ─────────────────────────────────────────────────────────────────────────────

interface CustomSelectCompactProps {
    value?: any;
    onChange?: (val: any) => void;
    /** libelleComplet, optionnel, sert uniquement à la recherche (ex. abrégé affiché, nom complet cherchable). */
    options: { value: any; label: string; libelleComplet?: string }[];
    placeholder?: string;
    isDisabled?: boolean;
    isClearable?: boolean;
    /** Couleur principale — défaut : #ff4a0a */
    primaryColor?: string;
}

export const CustomSelectCompact = ({
    value,
    onChange,
    options,
    placeholder = 'Choisir...',
    isDisabled = false,
    isClearable = true,
    primaryColor = '#ff4a0a',
}: CustomSelectCompactProps) => {
    const instanceId = React.useId();

    const PRIMARY       = primaryColor;
    const PRIMARY_LIGHT = `${PRIMARY}14`; // ~8% opacity
    const PRIMARY_MID   = `${PRIMARY}2E`; // ~18% opacity
    const PRIMARY_RING  = `${PRIMARY}26`; // ~15% opacity

    const styles = {
        control: (base: any, state: any) => ({
            ...base,
            minHeight: '30px',
            height: '30px',
            borderWidth: '1px',
            // Bleu clair (sky-200) plutôt que gris : ce select n'est utilisé que dans la grille
            // des emplois du temps, dont toute la structure est désormais bleue.
            borderColor: state.isFocused ? PRIMARY : '#bae6fd',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            backgroundColor: state.isDisabled ? '#f0f9ff' : 'white',
            boxShadow: state.isFocused ? `0 0 0 2px ${PRIMARY_RING}` : 'none',
            '&:hover': { borderColor: PRIMARY_MID },
            transition: 'all 0.15s ease',
            cursor: state.isDisabled ? 'not-allowed' : 'pointer',
            flexWrap: 'nowrap',
        }),
        valueContainer: (base: any) => ({
            ...base,
            padding: '0 6px',
            flexWrap: 'nowrap',
            overflow: 'hidden',
        }),
        placeholder: (base: any) => ({
            ...base,
            color: '#94a3b8',
            fontWeight: '500',
            fontSize: '11px',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }),
        singleValue: (base: any) => ({
            ...base,
            color: '#1e293b',
            fontWeight: '700',
            fontSize: '11px',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        }),
        input: (base: any) => ({
            ...base,
            color: '#1e293b',
            fontWeight: '600',
            fontSize: '11px',
            margin: 0,
            padding: 0,
        }),
        indicatorsContainer: (base: any) => ({
            ...base,
            height: '30px',
        }),
        indicatorSeparator: () => ({ display: 'none' }),
        dropdownIndicator: (base: any, state: any) => ({
            ...base,
            color: state.isFocused ? PRIMARY : '#94a3b8',
            padding: '0 4px',
            transition: 'transform 0.15s ease',
            transform: state.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            '& svg': { width: '12px', height: '12px' },
        }),
        clearIndicator: (base: any) => ({
            ...base,
            color: '#94a3b8',
            padding: '0 3px',
            '& svg': { width: '12px', height: '12px' },
            '&:hover': { color: '#ef4444' },
        }),
        menu: (base: any) => ({
            ...base,
            zIndex: 9999,
            borderRadius: '10px',
            border: `1.5px solid ${PRIMARY_MID}`,
            boxShadow: `0 8px 20px -4px rgba(0,0,0,0.12)`,
            padding: '2px',
            marginTop: '2px',
            minWidth: '180px',
        }),
        menuList: (base: any) => ({
            ...base,
            padding: '2px',
            maxHeight: '200px',
        }),
        option: (base: any, state: any) => ({
            ...base,
            fontSize: '12px',
            padding: '7px 10px',
            borderRadius: '7px',
            cursor: 'pointer',
            marginBottom: '1px',
            fontWeight: state.isSelected ? '700' : '500',
            backgroundColor: state.isSelected
                ? PRIMARY
                : state.isFocused
                ? PRIMARY_LIGHT
                : 'transparent',
            color: state.isSelected
                ? 'white'
                : state.isFocused
                ? PRIMARY
                : '#374151',
            '&:active': { backgroundColor: PRIMARY, color: 'white' },
            transition: 'all 0.1s ease',
        }),
        menuPortal: (base: any) => ({ ...base, zIndex: 99999, pointerEvents: 'auto' }),
        noOptionsMessage: (base: any) => ({
            ...base,
            fontSize: '11px',
            color: '#94a3b8',
            padding: '6px 10px',
        }),
    };

    const resolvedValue =
        options.find((opt) => opt.value == value || opt.value == value?.value) ?? null;

    return (
        <>
            <style>{`
                .rsc-compact__input-container input {
                    box-shadow: none !important;
                    border: none !important;
                    outline: none !important;
                    background: transparent !important;
                }
                .rsc-compact__menu-portal,
                .rsc-compact__menu-portal * {
                    pointer-events: auto !important;
                }
            `}</style>
            <Select
                instanceId={instanceId}
                classNamePrefix="rsc-compact"
                styles={styles}
                components={{
                    MenuList: CustomMenuList,
                }}
                options={options}
                value={resolvedValue}
                onChange={onChange}
                placeholder={placeholder}
                isSearchable
                // La liste affiche l'abrégé : sans cela, on ne pourrait plus retrouver une
                // matière en tapant son nom complet.
                filterOption={(option: any, saisie: string) => {
                    if (!saisie) return true;
                    const terme = saisie.toLowerCase();
                    const complet = option.data?.libelleComplet || '';
                    return String(option.label).toLowerCase().includes(terme)
                        || String(complet).toLowerCase().includes(terme);
                }}
                isClearable={isClearable}
                isDisabled={isDisabled}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                menuPosition="fixed"
                closeMenuOnScroll={false}
            />
        </>
    );
};
