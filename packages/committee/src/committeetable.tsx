import { useState, useEffect, Fragment } from "react";
import { type GroupDescriptor, useValueStore, useFieldValue, useFieldArrayValue, SelectOrAddField } from "@repo/form-engine";
import { getAuthorRecord, MTMTIdFinder } from "@repo/mtmt-tools";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, Input, Spinner } from "@repo/ui";
import { GripVertical, Trash, Search, UserPlus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCommitteeDnd, makeItemId, type CommitteeDragSource } from "./dndprovider";
import { CommitteeFieldKey, EMPTY_ROW, appendCommitteeRow, writeCommitteeRow, type RowData } from "./roles";

// ─── Sortable Row ────────────────────────────────────────────────────────────

const SortableRow = ({
    id,
    row,
    index,
    prefix,
    onEdit,
    onDelete,
    canDelete,
    colWidths
}: {
    id: string;
    row: RowData;
    index: number;
    prefix: string;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    canDelete: boolean;
    colWidths: string[];
}) => {
    const source: CommitteeDragSource = { kind: "row", prefix, index };
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        data: { committeeSource: source },
        animateLayoutChanges: () => false
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1
    };

    const displayName = row.name;

    return (
        <tr ref={setNodeRef} style={style} className="group border-b border-border hover:bg-background cursor-pointer" onClick={() => onEdit(index)}>
            <td
                className="px-1 py-1.5 w-8 cursor-grab active:cursor-grabbing touch-none"
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                aria-label="Sor mozgatása"
            >
                <span className="flex items-center justify-center text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                </span>
            </td>
            <td className="px-2 py-1.5 text-sm" style={{ width: colWidths[0] === "*" ? "auto" : colWidths[0] ? `${colWidths[0]}pt` : undefined }}>
                {displayName}
            </td>
            <td className="px-2 py-1.5 text-sm" style={{ width: colWidths[1] === "*" ? "auto" : colWidths[1] ? `${colWidths[1]}pt` : undefined }}>
                {row.degree}
            </td>
            <td className="px-2 py-1.5 text-sm" style={{ width: colWidths[2] === "*" ? "auto" : colWidths[2] ? `${colWidths[2]}pt` : undefined }}>
                {row.discipline}
            </td>
            <td className="px-2 py-1.5 text-sm" style={{ width: colWidths[3] === "*" ? "auto" : colWidths[3] ? `${colWidths[3]}pt` : undefined }}>
                {row.workplace}
            </td>
            <td className="px-1 py-1.5 w-8">
                {canDelete && (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(index);
                        }}
                        title="Sor törlése"
                    >
                        <Trash className="w-3.5 h-3.5" />
                    </Button>
                )}
            </td>
        </tr>
    );
};

// ─── Edit Dialog ─────────────────────────────────────────────────────────────

export const EditRowDialog = ({
    open,
    onOpenChange,
    row,
    onSave,
    degreeOptions
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    row: RowData;
    onSave: (row: RowData) => void;
    degreeOptions: string[];
}) => {
    const [editData, setEditData] = useState<RowData>(row);
    const [loading, setLoading] = useState(false);

    // Reset when dialog opens with new row
    useEffect(() => {
        if (open) setEditData(row);
    }, [open, row]);

    const handleMtmtLookup = async () => {
        if (!editData.mtmtId) return;
        setLoading(true);
        try {
            const data = await getAuthorRecord(editData.mtmtId);
            setEditData({
                ...editData,
                name: data.name,
                degree: data.degree,
                discipline: data.disciplines?.join(", ") ?? "",
                workplace: data.affiliations?.join(", ") ?? ""
            });
        } catch (err) {
            console.error("Error fetching MTMT user data:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Adatok szerkesztése</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2 min-w-0">
                    <div className="flex items-center gap-2">
                        <label className="w-40 text-sm font-medium text-right shrink-0">MTMT azonosító</label>
                        <Input
                            value={editData.mtmtId}
                            onChange={(e) => setEditData({ ...editData, mtmtId: e.target.value })}
                            placeholder="pl. 10012345"
                            className="flex-1"
                        />
                        <Button variant="outline" size="icon" onClick={handleMtmtLookup} disabled={loading || !editData.mtmtId} title="Keresés az MTMT-ben">
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="w-40 text-sm font-medium text-right shrink-0">Név</label>
                        <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="flex-1" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="w-40 text-sm font-medium text-right shrink-0">Tudományos fokozat</label>
                        <SelectOrAddField
                            className="flex-1 min-w-0"
                            value={editData.degree}
                            type="fokozat"
                            choices={degreeOptions.includes(editData.degree) || editData.degree === "" ? degreeOptions : [...degreeOptions, editData.degree]}
                            onChange={(v) => setEditData({ ...editData, degree: v })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="w-40 text-sm font-medium text-right shrink-0">Szakterület</label>
                        <Input value={editData.discipline} onChange={(e) => setEditData({ ...editData, discipline: e.target.value })} className="flex-1" />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="w-40 text-sm font-medium text-right shrink-0">Munkahely</label>
                        <Input value={editData.workplace} onChange={(e) => setEditData({ ...editData, workplace: e.target.value })} className="flex-1" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Mégse</Button>
                    </DialogClose>
                    <Button
                        onClick={() => {
                            onSave(editData);
                            onOpenChange(false);
                        }}
                    >
                        Mentés
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ─── Add from MTMT dialog (wraps MTMTIdFinder + getAuthorRecord) ─────────────

const AddFromMTMTDialog = ({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (row: RowData) => void }) => {
    const [isOpen, setIsOpen] = useState(open);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setIsOpen(open);
    }, [open]);
    const handleSelect = async (id: string) => {
        setIsOpen(false);
        setLoading(true);
        try {
            const data = await getAuthorRecord(id);
            onAdd({
                mtmtId: id,
                name: data.name,
                degree: data.degree,
                discipline: data.disciplines?.join(", ") ?? "",
                workplace: data.affiliations?.join(", ") ?? ""
            });
        } catch {
            onAdd({ mtmtId: id, name: "", degree: "", discipline: "", workplace: "" });
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <>
            <MTMTIdFinder isOpen={isOpen} onClose={onClose} onSelect={handleSelect} />
            <Dialog open={loading}>
                <DialogTitle className="hidden">MTMT adatok betöltése</DialogTitle>
                <DialogContent className="sm:max-w-xs" showCloseButton={false}>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <Spinner className="w-8 h-8" />
                        <p className="text-sm text-muted-foreground">MTMT adatok betöltése...</p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

// ─── Main CommitteeTable component (used as customComponent on each group) ───

export const CommitteeTable = ({ group, keyPrefix }: { group: GroupDescriptor; keyPrefix: string; index: number }) => {
    const dndCtx = useCommitteeDnd();
    const store = useValueStore();
    const length = parseInt(useFieldValue(`${keyPrefix}|_length`)) || 0;

    // Subscribe to field data changes (fixed set of fields - no conditional hooks)
    const mtmtIds = useFieldArrayValue(`${keyPrefix}|${CommitteeFieldKey.mtmtId}`);
    const names = useFieldArrayValue(`${keyPrefix}|${CommitteeFieldKey.name}`);
    const degrees = useFieldArrayValue(`${keyPrefix}|${CommitteeFieldKey.degree}`);
    const disciplines = useFieldArrayValue(`${keyPrefix}|${CommitteeFieldKey.discipline}`);
    const workplaces = useFieldArrayValue(`${keyPrefix}|${CommitteeFieldKey.workplace}`);

    // Register with cross-group DnD context
    useEffect(() => {
        dndCtx?.registerGroup(keyPrefix, group);
        return () => dndCtx?.unregisterGroup(keyPrefix);
    }, [dndCtx, keyPrefix, group]);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(0);
    const [addFromMTMTDialogOpen, setAddFromMTMTDialogOpen] = useState(false);
    const [addManualDialogOpen, setAddManualDialogOpen] = useState(false);

    // Build rows from atom data
    const rows: RowData[] = [];
    for (let i = 0; i < length; i++) {
        rows.push({
            mtmtId: mtmtIds[i] ?? "",
            name: names[i] ?? "",
            degree: degrees[i] ?? "",
            discipline: disciplines[i] ?? "",
            workplace: workplaces[i] ?? ""
        });
    }

    // Build sortable IDs
    const itemIds = rows.map((_, i) => makeItemId(keyPrefix, i));

    const { setNodeRef, isOver } = useDroppable({ id: keyPrefix });

    // Cross-group insertion indicator
    const insertionIndex =
        dndCtx?.crossGroupOver?.targetPrefix === keyPrefix && dndCtx?.activeSourcePrefix !== keyPrefix ? dndCtx.crossGroupOver.targetIndex : null;

    const handleEdit = (index: number) => {
        setEditIndex(index);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = (row: RowData) => {
        writeCommitteeRow(store, keyPrefix, editIndex, row);
    };

    const handleDelete = (index: number) => {
        store.deleteFromFormArray(group, keyPrefix, index);
    };

    const handleAdd = (row: RowData) => {
        appendCommitteeRow(store, group, keyPrefix, row);
    };

    const editRow = editIndex < rows.length ? rows[editIndex] : EMPTY_ROW;

    const degreeOptions = (group.fields.find((f) => f.key === CommitteeFieldKey.degree)?.attribs?.options as string[] | undefined) ?? [];
    const colWidths = group.fields.filter((f) => !f.attribs?.noPrint).map((f) => f.attribs?.colWidth ?? "");

    return (
        <div ref={setNodeRef} className={`transition-colors ${isOver && length === 0 ? "bg-primary/10 rounded" : ""}`}>
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                <table className="form-table w-full text-left border-collapse">
                    <thead>
                        <tr className="text-sm">
                            <td className="px-1 py-1 w-8"></td>
                            <td className="px-2 py-1" style={{ width: colWidths[0] === "*" ? "auto" : colWidths[0] ? `${colWidths[0]}pt` : undefined }}>
                                Név
                            </td>
                            <td className="px-2 py-1" style={{ width: colWidths[1] === "*" ? "auto" : colWidths[1] ? `${colWidths[1]}pt` : undefined }}>
                                Fokozat
                            </td>
                            <td className="px-2 py-1" style={{ width: colWidths[2] === "*" ? "auto" : colWidths[2] ? `${colWidths[2]}pt` : undefined }}>
                                Szakterület
                            </td>
                            <td className="px-2 py-1" style={{ width: colWidths[3] === "*" ? "auto" : colWidths[3] ? `${colWidths[3]}pt` : undefined }}>
                                Munkahely
                            </td>
                            <td className="px-1 py-1 w-8"></td>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <Fragment key={itemIds[i]}>
                                {insertionIndex === i && (
                                    <tr>
                                        <td colSpan={6} className="p-0">
                                            <div className="h-0.5 bg-primary mx-2 my-0.5 rounded-full" />
                                        </td>
                                    </tr>
                                )}
                                <SortableRow
                                    id={itemIds[i]}
                                    row={row}
                                    index={i}
                                    prefix={keyPrefix}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    canDelete={true}
                                    colWidths={colWidths}
                                />
                            </Fragment>
                        ))}
                        {insertionIndex !== null && insertionIndex >= length && (
                            <tr>
                                <td colSpan={6} className="p-0">
                                    <div className="h-0.5 bg-primary mx-2 my-0.5 rounded-full" />
                                </td>
                            </tr>
                        )}
                        {length === 0 && insertionIndex === null && (
                            <tr>
                                <td colSpan={6} className="text-center text-sm text-muted-foreground py-3 italic">
                                    Üres lista.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </SortableContext>

            <div className="flex items-center">
                {group.arrayMax && length < group.arrayMax && <div className="text-sm text-muted-foreground">Még {group.arrayMax - length} fő hiányzik.</div>}
                {group.arrayMax && length > group.arrayMax && (
                    <div className="text-sm text-muted-foreground">Túl sok tag van, legfeljebb {group.arrayMax} fő megengedett.</div>
                )}
                {length < (group.arrayMax ?? Infinity) && (
                    <div className="flex-1 mt-1 flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setAddManualDialogOpen(true)}>
                            <UserPlus /> Kézi hozzáadás
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setAddFromMTMTDialogOpen(true)}>
                            <UserPlus /> Hozzáadás MTMT-ből
                        </Button>
                    </div>
                )}
            </div>

            <EditRowDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} row={editRow} onSave={handleSaveEdit} degreeOptions={degreeOptions} />

            <EditRowDialog
                open={addManualDialogOpen}
                onOpenChange={setAddManualDialogOpen}
                row={EMPTY_ROW}
                onSave={(row) => {
                    handleAdd(row);
                    setAddManualDialogOpen(false);
                }}
                degreeOptions={degreeOptions}
            />

            <AddFromMTMTDialog open={addFromMTMTDialogOpen} onClose={() => setAddFromMTMTDialogOpen(false)} onAdd={handleAdd} />
        </div>
    );
};
