import { useState, useCallback, useRef, useEffect, createContext, useContext } from "react";
import { useAtomValue, atom } from "jotai";
import {
    type GroupDescriptor,
    type FormData,
    store,
    getAuthorRecord,
    deleteFromFormArray,
    appendToFormArray,
    SelectOrAddField,
    MTMTIdFinder
} from "@repo/form-engine";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, Input } from "@repo/ui";
import { GripVertical, Trash, Search, UserPlus } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    DragOverlay,
    useDroppable
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ───────────────────────────────────────────────────────────────────

type RowData = {
    mtmtId: string;
    name: string;
    degree: string;
    discipline: string;
    workplace: string;
};

type DndItemId = string; // format: "groupKeyPrefix::index"

// ─── DnD Context shared across all CommitteeTable instances on the page ──────

type CommitteeDndContextValue = {
    registerGroup: (keyPrefix: string, group: GroupDescriptor, formData: FormData) => void;
    unregisterGroup: (keyPrefix: string) => void;
    getGroups: () => Map<string, { group: GroupDescriptor; formData: FormData }>;
};

const CommitteeDndReactContext = createContext<CommitteeDndContextValue | null>(null);

/**
 * Wraps the page to provide a shared DndContext for cross-group drag & drop.
 */
export const CommitteeDndProvider = ({ children }: { children: React.ReactNode }) => {
    const groupsRef = useRef(new Map<string, { group: GroupDescriptor; formData: FormData }>());
    const [activeId, setActiveId] = useState<DndItemId | null>(null);
    const [activeRowData, setActiveRowData] = useState<RowData | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const registerGroup = useCallback((keyPrefix: string, group: GroupDescriptor, formData: FormData) => {
        groupsRef.current.set(keyPrefix, { group, formData });
    }, []);

    const unregisterGroup = useCallback((keyPrefix: string) => {
        groupsRef.current.delete(keyPrefix);
    }, []);

    const getGroups = useCallback(() => groupsRef.current, []);

    const readRow = useCallback((keyPrefix: string, index: number, formData: FormData): RowData => {
        const get = (field: string) => {
            const a = formData[`${keyPrefix}|${field}`];
            return a ? (store.get(a)[index] ?? "") : "";
        };
        return {
            mtmtId: get("MTMT azonosító"),
            name: get("Név"),
            degree: get("Tudományos fokozat"),
            discipline: get("Szakterület"),
            workplace: get("Munkahely")
        };
    }, []);

    const removeRow = useCallback((keyPrefix: string, index: number, group: GroupDescriptor, formData: FormData) => {
        // Remove element at index from all field arrays and decrement length
        const lengthKey = `${keyPrefix}|_length`;
        const lengthAtom = formData[lengthKey];
        if (!lengthAtom) return;
        const length = parseInt(store.get(lengthAtom)[0]);
        for (const field of group.fields) {
            const key = `${keyPrefix}|${field.key}`;
            const fieldAtom = formData[key];
            if (fieldAtom) {
                const arr = [...store.get(fieldAtom)];
                arr.splice(index, 1);
                store.set(fieldAtom, arr);
            }
        }
        store.set(lengthAtom, [String(length - 1)]);
    }, []);

    const insertRow = useCallback((keyPrefix: string, index: number, group: GroupDescriptor, formData: FormData, row: RowData) => {
        const lengthKey = `${keyPrefix}|_length`;
        const lengthAtom = formData[lengthKey];
        if (!lengthAtom) return;
        const length = parseInt(store.get(lengthAtom)[0]);

        const fieldMap: Record<string, string> = {
            "MTMT azonosító": row.mtmtId,
            Név: row.name,
            "Tudományos fokozat": row.degree,
            Szakterület: row.discipline,
            Munkahely: row.workplace
        };

        for (const field of group.fields) {
            const key = `${keyPrefix}|${field.key}`;
            const fieldAtom = formData[key];
            if (fieldAtom) {
                const arr = [...store.get(fieldAtom)];
                arr.splice(index, 0, fieldMap[field.key] ?? "");
                store.set(fieldAtom, arr);
            }
        }
        store.set(lengthAtom, [String(length + 1)]);
    }, []);

    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const id = event.active.id as string;
            setActiveId(id);
            const [prefix, idxStr] = parseItemId(id);
            const entry = groupsRef.current.get(prefix);
            if (entry) {
                setActiveRowData(readRow(prefix, parseInt(idxStr), entry.formData));
            }
        },
        [readRow]
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setActiveId(null);
            setActiveRowData(null);

            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const [sourcePrefix, sourceIdxStr] = parseItemId(active.id as string);
            const sourceIdx = parseInt(sourceIdxStr);
            const sourceEntry = groupsRef.current.get(sourcePrefix);
            if (!sourceEntry) return;

            // Determine target - "over" can be an item or a droppable container
            let targetPrefix: string;
            let targetIdx: number;

            const overId = over.id as string;
            if (overId.includes("::")) {
                // Dropped over another item
                [targetPrefix] = parseItemId(overId);
                targetIdx = parseInt(parseItemId(overId)[1]);
            } else {
                // Dropped over a container (group droppable)
                targetPrefix = overId;
                const targetEntry = groupsRef.current.get(targetPrefix);
                if (!targetEntry) return;
                const lengthAtom = targetEntry.formData[`${targetPrefix}|_length`];
                targetIdx = lengthAtom ? parseInt(store.get(lengthAtom)[0]) : 0;
            }

            const targetEntry = groupsRef.current.get(targetPrefix);
            if (!targetEntry) return;

            const rowData = readRow(sourcePrefix, sourceIdx, sourceEntry.formData);

            if (sourcePrefix === targetPrefix) {
                // Same group: reorder
                if (sourceIdx === targetIdx) return;
                removeRow(sourcePrefix, sourceIdx, sourceEntry.group, sourceEntry.formData);
                const adjustedIdx = targetIdx > sourceIdx ? targetIdx - 1 : targetIdx;
                insertRow(targetPrefix, adjustedIdx, targetEntry.group, targetEntry.formData, rowData);
            } else {
                // Cross-group: remove from source, insert into target
                removeRow(sourcePrefix, sourceIdx, sourceEntry.group, sourceEntry.formData);
                insertRow(targetPrefix, targetIdx, targetEntry.group, targetEntry.formData, rowData);
            }
        },
        [readRow, removeRow, insertRow]
    );

    const ctxValue: CommitteeDndContextValue = { registerGroup, unregisterGroup, getGroups };

    return (
        <CommitteeDndReactContext.Provider value={ctxValue}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                {children}
                <DragOverlay>
                    {activeId && activeRowData && (
                        <div className="bg-background border rounded shadow-lg px-3 py-2 text-sm flex items-center gap-2 opacity-90">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{activeRowData.name}</span>
                            {activeRowData.mtmtId && <span className="text-muted-foreground">[{activeRowData.mtmtId}]</span>}
                            <span className="text-muted-foreground">— {activeRowData.degree}</span>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </CommitteeDndReactContext.Provider>
    );
};

// ─── Helper to parse item IDs ────────────────────────────────────────────────

function parseItemId(id: string): [string, string] {
    const lastSep = id.lastIndexOf("::");
    return [id.substring(0, lastSep), id.substring(lastSep + 2)];
}

function makeItemId(keyPrefix: string, index: number): DndItemId {
    return `${keyPrefix}::${index}`;
}

// ─── Sortable Row ────────────────────────────────────────────────────────────

const SortableRow = ({
    id,
    row,
    index,
    onEdit,
    onDelete,
    canDelete
}: {
    id: string;
    row: RowData;
    index: number;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    canDelete: boolean;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1
    };

    const displayName = row.name ? (row.mtmtId ? `${row.name} [${row.mtmtId}]` : row.name) : row.mtmtId ? `[${row.mtmtId}]` : "";

    return (
        <tr ref={setNodeRef} style={style} className="group border-b border-border hover:bg-muted/50 cursor-pointer" onClick={() => onEdit(index)}>
            <td className="px-1 py-1.5 w-8">
                <button
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Sor mozgatása"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
            </td>
            <td className="px-2 py-1.5 text-sm">{displayName}</td>
            <td className="px-2 py-1.5 text-sm">{row.degree}</td>
            <td className="px-2 py-1.5 text-sm">{row.discipline}</td>
            <td className="px-2 py-1.5 text-sm">{row.workplace}</td>
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

const EditRowDialog = ({
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
                degree: data.degrees?.join(", ") ?? "",
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
    const handleSelect = async (id: string) => {
        try {
            const data = await getAuthorRecord(id);
            onAdd({
                mtmtId: id,
                name: data.name,
                degree: data.degrees?.join(", ") ?? "",
                discipline: data.disciplines?.join(", ") ?? "",
                workplace: data.affiliations?.join(", ") ?? ""
            });
        } catch {
            onAdd({ mtmtId: id, name: "", degree: "", discipline: "", workplace: "" });
        } finally {
            onClose();
        }
    };

    return <MTMTIdFinder isOpen={open} onClose={onClose} onSelect={handleSelect} />;
};

// ─── Main CommitteeTable component (used as customComponent on each group) ───

const lengthFallback = atom(["0"]);

export const CommitteeTable = ({ group, formData, keyPrefix }: { group: GroupDescriptor; formData: FormData; keyPrefix: string; index: number }) => {
    const dndCtx = useContext(CommitteeDndReactContext);
    const lengthAtom = formData[`${keyPrefix}|_length`] ?? lengthFallback;
    const arrayLength = useAtomValue(lengthAtom);
    const length = parseInt(arrayLength[0]) || 0;

    // Subscribe to field data changes (fixed set of atoms - no conditional hooks)
    const mtmtIds = useAtomValue(formData[`${keyPrefix}|MTMT azonosító`] ?? lengthFallback);
    const names = useAtomValue(formData[`${keyPrefix}|Név`] ?? lengthFallback);
    const degrees = useAtomValue(formData[`${keyPrefix}|Tudományos fokozat`] ?? lengthFallback);
    const disciplines = useAtomValue(formData[`${keyPrefix}|Szakterület`] ?? lengthFallback);
    const workplaces = useAtomValue(formData[`${keyPrefix}|Munkahely`] ?? lengthFallback);

    // Register with cross-group DnD context
    useEffect(() => {
        dndCtx?.registerGroup(keyPrefix, group, formData);
        return () => dndCtx?.unregisterGroup(keyPrefix);
    }, [dndCtx, keyPrefix, group, formData]);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(0);
    const [addFromMTMTDialogOpen, setAddFromMTMTDialogOpen] = useState(false);
    const [addManualDialogOpen, setAddManualDialogOpen] = useState(false);

    const emptyRow: RowData = { mtmtId: "", name: "", degree: "", discipline: "", workplace: "" };

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

    const handleEdit = (index: number) => {
        setEditIndex(index);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = (row: RowData) => {
        const set = (field: string, value: string) => {
            const a = formData[`${keyPrefix}|${field}`];
            if (a) {
                const arr = [...store.get(a)];
                arr[editIndex] = value;
                store.set(a, arr);
            }
        };
        set("MTMT azonosító", row.mtmtId);
        set("Név", row.name);
        set("Tudományos fokozat", row.degree);
        set("Szakterület", row.discipline);
        set("Munkahely", row.workplace);
    };

    const handleDelete = (index: number) => {
        deleteFromFormArray(group, formData, keyPrefix, index);
    };

    const handleAdd = (row: RowData) => {
        // Append an empty row first
        appendToFormArray(group, formData, keyPrefix);
        // Then fill it with data
        const newIdx = length; // after append, this is the new last index
        const set = (field: string, value: string) => {
            const a = formData[`${keyPrefix}|${field}`];
            if (a) {
                const arr = [...store.get(a)];
                arr[newIdx] = value;
                store.set(a, arr);
            }
        };
        set("MTMT azonosító", row.mtmtId);
        set("Név", row.name);
        set("Tudományos fokozat", row.degree);
        set("Szakterület", row.discipline);
        set("Munkahely", row.workplace);
    };

    const editRow = editIndex < rows.length ? rows[editIndex] : { mtmtId: "", name: "", degree: "", discipline: "", workplace: "" };

    const degreeOptions = (group.fields.find((f) => f.key === "Tudományos fokozat")?.attribs?.options as string[] | undefined) ?? [];

    return (
        <div ref={setNodeRef} className={`transition-colors ${isOver ? "bg-primary/10 rounded" : ""}`}>
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-border text-xs text-muted-foreground uppercase tracking-wider">
                            <th className="px-1 py-1 w-8"></th>
                            <th className="px-2 py-1">Név</th>
                            <th className="px-2 py-1">Tud. fokozat</th>
                            <th className="px-2 py-1">Szakterület</th>
                            <th className="px-2 py-1">Munkahely</th>
                            <th className="px-1 py-1 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <SortableRow key={itemIds[i]} id={itemIds[i]} row={row} index={i} onEdit={handleEdit} onDelete={handleDelete} canDelete={true} />
                        ))}
                        {length === 0 && (
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
                        <Button variant="outline" size="sm" onClick={() => setAddFromMTMTDialogOpen(true)}>
                            <UserPlus /> Hozzáadás MTMT-ből
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setAddManualDialogOpen(true)}>
                            <UserPlus /> Kézi hozzáadás
                        </Button>
                    </div>
                )}
            </div>

            <EditRowDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} row={editRow} onSave={handleSaveEdit} degreeOptions={degreeOptions} />

            <EditRowDialog
                open={addManualDialogOpen}
                onOpenChange={setAddManualDialogOpen}
                row={emptyRow}
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
