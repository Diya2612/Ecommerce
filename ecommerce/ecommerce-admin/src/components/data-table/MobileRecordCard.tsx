import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface MobileRecordField {
    label: string;
    value: React.ReactNode;
}

export interface MobileRecordCardProps {
    title: string;
    subtitle?: string;
    primaryValue?: React.ReactNode;
    imageUrl?: string | null;
    badges?: React.ReactNode;
    fields?: MobileRecordField[];
    onClick?: () => void;
}

const MobileRecordCard: React.FC<MobileRecordCardProps> = ({
    title,
    subtitle,
    primaryValue,
    imageUrl,
    badges,
    fields = [],
    onClick,
}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            className={`
        bg-white rounded-2xl border border-gray-100
        p-3 sm:p-4
        shadow-[0_2px_10px_rgba(0,0,0,0.05)]
        flex flex-col gap-3
        transition-transform active:scale-[0.99]
        ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
      `}
        >
            {/* HEADER */}
            <div className="flex items-start gap-3">
                {/* IMAGE */}
                {imageUrl && (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--sidebar-bg)] line-clamp-2 break-words">
                                {title}
                            </p>

                            {subtitle && (
                                <p className="mt-1 text-xs text-[var(--text-lightgrey)] break-words">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {/* EXPAND BUTTON */}
                        {fields.length > 0 && (
                            <button
                                type="button"
                                aria-expanded={expanded}
                                aria-label={expanded ? "Collapse details" : "Expand details"}
                                onClick={() => setExpanded((prev) => !prev)}
                                className="
                  p-2 rounded-lg
                  text-gray-400 hover:text-gray-600
                  hover:bg-gray-100
                  transition-colors
                  shrink-0
                "
                            >
                                <ChevronDown
                                    size={18}
                                    className={`transition-transform ${expanded ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                        )}
                    </div>

                    {/* PRIMARY VALUE + BADGES */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        {primaryValue && (
                            <div className="text-sm font-semibold text-[var(--sidebar-bg)]">
                                {primaryValue}
                            </div>
                        )}
                        {badges}
                    </div>
                </div>
            </div>

            {/* EXPANDED DETAILS */}
            {expanded && fields.length > 0 && (
                <div className="pt-2 border-t border-gray-50 text-xs text-gray-600 space-y-2">
                    {fields.map((field) => (
                        <div
                            key={field.label}
                            className="flex items-start justify-between gap-4"
                        >
                            <span className="font-medium text-[var(--text-lightgrey)] shrink-0">
                                {field.label}
                            </span>
                            <span className="text-right break-words">
                                {field.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export { MobileRecordCard };
