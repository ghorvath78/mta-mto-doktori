import { useFieldValue, useValueStore } from "../hooks";
import type { FieldDescriptor, GroupDescriptor } from "../types";

export const TabularList = ({ group, keyPrefix }: { group: GroupDescriptor; keyPrefix: string; index: number }) => {
    const store = useValueStore();
    const valueSource = group.valueSource ?? keyPrefix;
    const lengthSource = group.lengthSource ?? `${keyPrefix}|_length`;
    const length = parseInt(useFieldValue(lengthSource)) || 0;
    const colNames = group.fields.map((f: FieldDescriptor) => f.label ?? f.key);
    const colWidths = group.fields.map((f: FieldDescriptor) => f.attribs?.colWidth ?? "");
    const colIsLink = group.fields.map((f: FieldDescriptor) => f.type === "link");

    const tableData = Array.from({ length }).map((_, i) => group.fields.map((f: FieldDescriptor) => store.getField(`${valueSource}[[${i}]]|${f.key}`)));

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
                                    ) : tableData[i][j] ? (
                                        <a href={tableData[i][j]} target="_blank" rel="noopener noreferrer" className="formlink">
                                            link
                                        </a>
                                    ) : (
                                        "-"
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
