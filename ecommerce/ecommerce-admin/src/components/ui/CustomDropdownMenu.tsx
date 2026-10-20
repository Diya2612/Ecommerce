// src/components/ui/CustomDropdown.tsx
import React, { useState, useRef, useEffect } from "react";

interface DropdownMenuProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: "left" | "right";
}

const CustomDropdown: React.FC<DropdownMenuProps> = ({
    trigger,
    children,
    align = "right",
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div ref={ref} className="relative">
            {/* We stop propagation on clicks inside the dropdown content to prevent the parent's toggle from closing it */}
            <div onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
                {trigger}
            </div>

            {open && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`
                        absolute top-12 min-w-[220px] rounded-xl shadow-xl bg-white border border-gray-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-200
                        ${align === "right" ? "right-0" : "left-0"}
                    `}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;