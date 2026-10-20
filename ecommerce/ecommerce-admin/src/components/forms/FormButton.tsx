import React from "react";

interface FormButtonProps {
    isLoading?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
    type?: "button" | "submit" | "reset";
}

const FormButton: React.FC<FormButtonProps> = ({
    isLoading = false,
    disabled = false,
    children,
    className = "",
    type = "submit",
}) => {
    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            className={`
                w-full flex items-center justify-center gap-2
                bg-[#0E042F] text-white py-3 rounded-xl shadow-lg
                transition active:scale-95
                ${disabled || isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#1a0f3e]"}
                ${className}
            `}
        >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
                children
            )}
        </button>
    );
};

export { FormButton };
