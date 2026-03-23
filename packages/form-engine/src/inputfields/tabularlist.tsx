import { store } from "@repo/form-engine";
import type { FormData, GroupDescriptor } from "@repo/form-engine";
import { useAtomValue } from "jotai";

export const TabularList = ({ group, formData }: { group: GroupDescriptor; formData: FormData; keyPrefix: string; index: number }) => {
    const length = parseInt(useAtomValue(formData[group.lengthSource ?? ""] || [0])[0] || "0");
    const colNames = group.fields.map((f) => f.label ?? f.key);
    const colWidths = group.fields.map((f) => f.attribs?.colWidth ?? "");
    const colIsLink = group.fields.map((f) => f.type === "link");

    const tableData = Array.from({ length }).map((_, i) =>
        group.fields.map((f) => f.key).map((col) => store.get(formData[`${group.valueSource}|${col}`])[i] ?? "")
    );

    if (length === 0) {
        return <div className="italic text-gray-500">Nincs ilyen tevékenység megadva</div>;
    }

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
                                    {!colIsLink[j] ? (
                                        tableData[i][j]
                                    ) : (
                                        <a href={tableData[i][j]} target="_blank" rel="noopener noreferrer" className="formlink">
                                            link
                                        </a>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};
