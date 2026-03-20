import type { FormData } from "@/forms";
import { useAtomValue } from "jotai";

export const LinkDataDisplay = ({
    label,
    fieldKey,
    className = "",
    formData,
    index
}: {
    label: string;
    fieldKey: string;
    className?: string;
    formData: FormData;
    index: number;
}) => {
    const value = useAtomValue(formData[fieldKey]);

    const fieldName = `${fieldKey}-${index}`;

    const baseClass = "flex items-center space-x-2";
    const labelClass = "text-end w-1/4 leading-[0.95em]";
    return (
        <div className={`${baseClass} ${className}`}>
            <label className={`block mb-1 font-medium ${labelClass}`} htmlFor={fieldName}>
                {label}
            </label>
            {value[index] && (
                <a id={fieldName} className="py-1 px-2 mb-1 flex-3" href={value[index]} target="_blank" rel="noopener noreferrer">
                    {value[index]}
                </a>
            )}
            {!value[index] && <div className="py-1 px-2 mb-1 flex-3 text-gray-500 italic">Nincs megadva</div>}
        </div>
    );
};
