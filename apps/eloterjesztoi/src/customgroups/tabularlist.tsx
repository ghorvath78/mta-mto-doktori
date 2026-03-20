import { store } from "@repo/form-engine";
import type { FormData, GroupDescriptor } from "@repo/form-engine";
import { useAtomValue } from "jotai";
import type { JSX } from "react";

const convertCellContent = (content: string): string | JSX.Element => {
    if (content.startsWith("http")) {
        return (
            <a href={content} target="_blank" rel="noopener noreferrer" className="formlink">
                link
            </a>
        );
    }
    return content;
};

export const TabularList = ({ group, formData }: { group: GroupDescriptor; formData: FormData; keyPrefix: string; index: number }) => {
    const length = parseInt(useAtomValue(formData[group.lengthSource ?? ""] || [0])[0] || "0");
    const colNames = ((group.attribs?.colNames as string | undefined) ?? "").split("|");
    const colWidths = ((group.attribs?.colWidths as string | undefined) ?? "").split(",").map((w) => w.trim());

    const tableData = Array.from({ length }).map((_, i) => colNames.map((col) => store.get(formData[`${group.valueSource}|${col}`])[i] ?? ""));

    if (length === 0) {
        return <div className="italic text-gray-500">Nincs ilyen tevékenység megadva</div>;
    }

    const extraInfo = (group.attribs?.extraInfo as string | undefined) ?? "";
    const extraLabel = group.attribs?.extraLabel as string | undefined;
    const info = extraInfo && formData[extraInfo] ? (store.get(formData[extraInfo])[0] ?? "") : "";

    return (
        <>
            <table className="form-table">
                <thead>
                    <tr>
                        {colNames.map((name, i) => (
                            <th key={i} style={{ width: colWidths[i] === "*" ? "auto" : `${colWidths[i]}pt` }} className={i === 0 ? "form-table-fcol" : ""}>
                                {name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: length }).map((_, i) => (
                        <tr key={i}>
                            {colNames.map((_, j) => (
                                <td key={j} style={{ width: colWidths[j] === "*" ? "auto" : `${colWidths[j]}pt` }} className={j === 0 ? "form-table-fcol" : ""}>
                                    {convertCellContent(tableData[i][j])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {extraLabel && (
                <>
                    <div className="mt-2 flex space-x-2">
                        <div className="font-semibold">{extraLabel ?? "További információ"}:</div>
                        <div>{info ? convertCellContent(info) : "Nincs megadva"}</div>
                    </div>
                </>
            )}
        </>
    );
};
