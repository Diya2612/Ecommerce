import React from "react";
import { Plus } from "lucide-react";
import type { To } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { buttonVariantClass } from './utils/styling';

export interface ActionButtonsProps {
    onImport?: any;
    onExport?: any;
    onAddPrimary?: () => void;
    importTo?: To;
    exportTo?: To;
    primaryTo?: To;
    primaryLabel?: string;
    totalItems?: number;
    templateUrl?: string;
    moduleName?: string;
    importFields?: any[];
    exportColumns?: any[];
    allowUpdate?: boolean;
    supportsDateRange?: boolean;
    selectedItems?: any[];
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    onAddPrimary,
    primaryTo,
    primaryLabel = "Add New",
}) => {
    const navigate = useNavigate();
    const primaryButtonClass = buttonVariantClass('primary');

    const handlePrimaryClick = () => {
        if (primaryTo) {
            navigate(primaryTo);
        } else if (onAddPrimary) {
            onAddPrimary();
        }
    };

    return (
        <div 
            className="flex w-full md:w-auto items-center gap-1.5 sm:gap-3 flex-nowrap overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {(primaryTo || onAddPrimary) && (
                <button
                    type="button"
                    onClick={handlePrimaryClick}
                    className={primaryButtonClass}
                >
                    <Plus size={14} className="text-white shrink-0 sm:w-4 sm:h-4" />
                    <span className="truncate whitespace-nowrap">
                        <span className="hidden xs:inline">{primaryLabel.split(' ')[0]} </span>
                        {primaryLabel.split(' ').slice(1).join(' ') || primaryLabel}
                    </span>
                </button>
            )}
        </div>
    );
};

export { ActionButtons };
