import { useState, useCallback, useRef, useEffect, createContext, useContext, Fragment } from "react";
import { type GroupDescriptor, type FormStore, useValueStore, useFieldValue, useFieldArrayValue, SelectOrAddField } from "@repo/form-engine";
import { getAuthorRecord, MTMTIdFinder } from "@repo/mtmt-tools";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, Input, Spinner } from "@repo/ui";
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
    type DragOverEvent,
    DragOverlay,
    useDroppable
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getApplicantAuthorRecord, getCommonPubsWithApplicant } from "@/eloterjesztoiform";

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
    registerGroup: (keyPrefix: string, group: GroupDescriptor) => void;
    unregisterGroup: (keyPrefix: string) => void;
    getGroups: () => Map<string, GroupDescriptor>;
    crossGroupOver: { targetPrefix: string; targetIndex: number } | null;
    activeSourcePrefix: string | null;
};

const CommitteeDndReactContext = createContext<CommitteeDndContextValue | null>(null);

/** Inserts a row at an arbitrary index, shifting subsequent items up by one slot (the inverse of FormStore.deleteFromFormArray). */
function insertRowAt(store: FormStore, group: GroupDescriptor, keyPrefix: string, index: number, row: RowData) {
    const lengthKey = `${keyPrefix}|_length`;
    const length = parseInt(store.getField(lengthKey)) || 0;

    const fieldMap: Record<string, string> = {
        "MTMT azonosító": row.mtmtId,
        Név: row.name,
        "Tudományos fokozat": row.degree,
        Szakterület: row.discipline,
        Munkahely: row.workplace
    };

    const toNotifyKeys: string[] = [lengthKey];
    for (const field of group.fields) {
        for (let i = length; i > index; i--) {
            const key = `${keyPrefix}[[${i}]]|${field.key}`;
            const prevKey = `${keyPrefix}[[${i - 1}]]|${field.key}`;
            store.data[key] = store.data[prevKey];
            toNotifyKeys.push(key);
        }
        const targetKey = `${keyPrefix}[[${index}]]|${field.key}`;
        store.data[targetKey] = fieldMap[field.key] ?? "";
        toNotifyKeys.push(targetKey);
    }
    store.data[lengthKey] = String(length + 1);
    store.notifyListenersForKeys(toNotifyKeys);
}

/**
 * Wraps the page to provide a shared DndContext for cross-group drag & drop.
 */
export const CommitteeDndProvider = ({ children }: { children: React.ReactNode }) => {
    const store = useValueStore();
    const groupsRef = useRef(new Map<string, GroupDescriptor>());
    const [activeId, setActiveId] = useState<DndItemId | null>(null);
    const [activeRowData, setActiveRowData] = useState<RowData | null>(null);
    const [crossGroupOver, setCrossGroupOver] = useState<{ targetPrefix: string; targetIndex: number } | null>(null);
    const [activeSourcePrefix, setActiveSourcePrefix] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const registerGroup = useCallback((keyPrefix: string, group: GroupDescriptor) => {
        groupsRef.current.set(keyPrefix, group);
    }, []);

    const unregisterGroup = useCallback((keyPrefix: string) => {
        groupsRef.current.delete(keyPrefix);
    }, []);

    const getGroups = useCallback(() => groupsRef.current, []);

    const readRow = useCallback(
        (keyPrefix: string, index: number): RowData => {
            const get = (field: string) => store.getArrayItem(`${keyPrefix}|${field}`, index);
            return {
                mtmtId: get("MTMT azonosító"),
                name: get("Név"),
                degree: get("Tudományos fokozat"),
                discipline: get("Szakterület"),
                workplace: get("Munkahely")
            };
        },
        [store]
    );

    const removeRow = useCallback(
        (keyPrefix: string, index: number, group: GroupDescriptor) => {
            store.deleteFromFormArray(group, keyPrefix, index);
        },
        [store]
    );

    const insertRow = useCallback(
        (keyPrefix: string, index: number, group: GroupDescriptor, row: RowData) => {
            insertRowAt(store, group, keyPrefix, index, row);
        },
        [store]
    );

    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const id = event.active.id as string;
            setActiveId(id);
            const [prefix, idxStr] = parseItemId(id);
            setActiveSourcePrefix(prefix);
            const entry = groupsRef.current.get(prefix);
            if (entry) {
                setActiveRowData(readRow(prefix, parseInt(idxStr)));
            }
        },
        [readRow]
    );

    /** Resolve target prefix + index from an over element, using pointer-vs-center heuristic.
     *  When the primary `over` is a same-group item or container, we check if the pointer is
     *  physically inside a foreign group's container and prefer that group's items instead.
     *  This ensures first/last positions of foreign groups are reachable near group boundaries. */
    const resolveTarget = useCallback(
        (
            active: DragOverEvent["active"],
            over: NonNullable<DragOverEvent["over"]>,
            delta: { x: number; y: number },
            collisions: DragOverEvent["collisions"],
            sourcePrefix: string
        ): { targetPrefix: string; targetIdx: number } | null => {
            let effectiveOver = over;
            const overId = over.id as string;

            // Compute active element's current center
            const initialRect = active.rect.current.initial;
            const activeCenter = initialRect ? initialRect.top + initialRect.height / 2 + delta.y : null;

            // If primary hit belongs to the source group, check if the pointer is physically
            // inside a different group's container — if so, prefer that container.
            const overIsSourceItem = overId.includes("::") && parseItemId(overId)[0] === sourcePrefix;
            const overIsSourceContainer = overId === sourcePrefix;
            if ((overIsSourceItem || overIsSourceContainer) && collisions && activeCenter !== null) {
                for (const collision of collisions) {
                    const cid = collision.id as string;
                    if (!cid.includes("::") && cid !== sourcePrefix) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const containerRect = (collision as any).data?.droppableContainer?.rect?.current;
                        if (containerRect && activeCenter >= containerRect.top && activeCenter <= containerRect.top + containerRect.height) {
                            effectiveOver = { ...over, id: collision.id, rect: containerRect };
                            break;
                        }
                    }
                }
            }

            // If effectiveOver is a container (not an item), find the closest item in that group
            const effectiveId = effectiveOver.id as string;
            if (!effectiveId.includes("::") && collisions) {
                const containerPrefix = effectiveId;
                for (const collision of collisions) {
                    const cid = collision.id as string;
                    if (cid.includes("::")) {
                        const [itemPrefix] = parseItemId(cid);
                        if (itemPrefix !== containerPrefix) continue;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const rect = (collision as any).data?.droppableContainer?.rect?.current;
                        if (rect) {
                            effectiveOver = { ...effectiveOver, id: collision.id, rect };
                        }
                        break;
                    }
                }
            }

            const finalId = effectiveOver.id as string;
            if (finalId.includes("::")) {
                const [targetPrefix, idxStr] = parseItemId(finalId);
                let targetIdx = parseInt(idxStr);
                if (activeCenter !== null) {
                    const overCenter = effectiveOver.rect.top + effectiveOver.rect.height / 2;
                    if (activeCenter > overCenter) targetIdx += 1;
                }
                return { targetPrefix, targetIdx };
            } else {
                // Container hit with no item alternative (e.g., empty group)
                const targetPrefix = finalId;
                const targetEntry = groupsRef.current.get(targetPrefix);
                if (!targetEntry) return null;
                const targetIdx = parseInt(store.getField(`${targetPrefix}|_length`)) || 0;
                return { targetPrefix, targetIdx };
            }
        },
        [store]
    );

    const handleDragOver = useCallback(
        (event: DragOverEvent) => {
            const { active, over, delta, collisions } = event;
            if (!over) {
                setCrossGroupOver(null);
                return;
            }

            const [sourcePrefix] = parseItemId(active.id as string);
            const resolved = resolveTarget(active, over, delta, collisions, sourcePrefix);
            if (!resolved) {
                setCrossGroupOver(null);
                return;
            }

            if (sourcePrefix !== resolved.targetPrefix) {
                setCrossGroupOver({ targetPrefix: resolved.targetPrefix, targetIndex: resolved.targetIdx });
            } else {
                setCrossGroupOver(null);
            }
        },
        [resolveTarget]
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setActiveId(null);
            setActiveRowData(null);
            setCrossGroupOver(null);
            setActiveSourcePrefix(null);

            const { active, over, delta, collisions } = event;
            if (!over || active.id === over.id) return;

            const [sourcePrefix, sourceIdxStr] = parseItemId(active.id as string);
            const sourceIdx = parseInt(sourceIdxStr);
            const sourceEntry = groupsRef.current.get(sourcePrefix);
            if (!sourceEntry) return;

            const resolved = resolveTarget(active, over, delta, collisions, sourcePrefix);
            if (!resolved) return;
            const { targetPrefix, targetIdx } = resolved;

            const targetEntry = groupsRef.current.get(targetPrefix);
            if (!targetEntry) return;

            const rowData = readRow(sourcePrefix, sourceIdx);

            if (sourcePrefix === targetPrefix) {
                // Same group: reorder
                if (sourceIdx === targetIdx) return;
                removeRow(sourcePrefix, sourceIdx, sourceEntry);
                insertRow(targetPrefix, targetIdx, targetEntry, rowData);
            } else {
                // Cross-group: remove from source, insert into target
                removeRow(sourcePrefix, sourceIdx, sourceEntry);
                insertRow(targetPrefix, targetIdx, targetEntry, rowData);
            }
        },
        [readRow, removeRow, insertRow, resolveTarget]
    );

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
        setActiveRowData(null);
        setCrossGroupOver(null);
        setActiveSourcePrefix(null);
    }, []);

    const ctxValue: CommitteeDndContextValue = { registerGroup, unregisterGroup, getGroups, crossGroupOver, activeSourcePrefix };

    return (
        <CommitteeDndReactContext.Provider value={ctxValue}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                {children}
                <DragOverlay dropAnimation={null}>
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
    canDelete,
    colWidths
}: {
    id: string;
    row: RowData;
    index: number;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    canDelete: boolean;
    colWidths: string[];
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, animateLayoutChanges: () => false });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1
    };

    // const displayName = row.name ? (row.mtmtId ? `${row.name} [${row.mtmtId}]` : row.name) : row.mtmtId ? `[${row.mtmtId}]` : "";
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
    const dndCtx = useContext(CommitteeDndReactContext);
    const store = useValueStore();
    const length = parseInt(useFieldValue(`${keyPrefix}|_length`)) || 0;

    // Subscribe to field data changes (fixed set of fields - no conditional hooks)
    const mtmtIds = useFieldArrayValue(`${keyPrefix}|MTMT azonosító`);
    const names = useFieldArrayValue(`${keyPrefix}|Név`);
    const degrees = useFieldArrayValue(`${keyPrefix}|Tudományos fokozat`);
    const disciplines = useFieldArrayValue(`${keyPrefix}|Szakterület`);
    const workplaces = useFieldArrayValue(`${keyPrefix}|Munkahely`);

    // Register with cross-group DnD context
    useEffect(() => {
        dndCtx?.registerGroup(keyPrefix, group);
        return () => dndCtx?.unregisterGroup(keyPrefix);
    }, [dndCtx, keyPrefix, group]);

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

    // Cross-group insertion indicator
    const insertionIndex =
        dndCtx?.crossGroupOver?.targetPrefix === keyPrefix && dndCtx?.activeSourcePrefix !== keyPrefix ? dndCtx.crossGroupOver.targetIndex : null;

    const handleEdit = (index: number) => {
        setEditIndex(index);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = (row: RowData) => {
        const set = (field: string, value: string) => {
            store.setField(`${keyPrefix}[[${editIndex}]]|${field}`, value);
        };
        set("MTMT azonosító", row.mtmtId);
        set("Név", row.name);
        set("Tudományos fokozat", row.degree);
        set("Szakterület", row.discipline);
        set("Munkahely", row.workplace);
    };

    const handleDelete = (index: number) => {
        store.deleteFromFormArray(group, keyPrefix, index);
    };

    const handleAdd = (row: RowData) => {
        // Append an empty row first
        store.appendToFormArray(group, keyPrefix);
        // Then fill it with data
        const newIdx = length; // after append, this is the new last index
        const set = (field: string, value: string) => {
            store.setField(`${keyPrefix}[[${newIdx}]]|${field}`, value);
        };
        set("MTMT azonosító", row.mtmtId);
        set("Név", row.name);
        set("Tudományos fokozat", row.degree);
        set("Szakterület", row.discipline);
        set("Munkahely", row.workplace);
    };

    const editRow = editIndex < rows.length ? rows[editIndex] : { mtmtId: "", name: "", degree: "", discipline: "", workplace: "" };

    const degreeOptions = (group.fields.find((f) => f.key === "Tudományos fokozat")?.attribs?.options as string[] | undefined) ?? [];
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

// ─── Committee Checker ───────────────────────────────────────────────────────

const MTA_DEGREES = new Set(["MTA doktora", "MTA rendes tagja", "MTA levelező tagja"]);
const PHD_DEGREES = new Set(["PhD", "Kandidátus"]);
const VALID_DEGREES = new Set([...PHD_DEGREES, "Tudomány doktora", ...MTA_DEGREES, "MTA külső tagja"]);

function grpLength(store: FormStore, key: string): number {
    return parseInt(store.getField(`${key}|_length`)) || 0;
}

function grpDegrees(store: FormStore, key: string): string[] {
    return store.getArray(`${key}|Tudományos fokozat`);
}

function grpNames(store: FormStore, key: string): string[] {
    return store.getArray(`${key}|Név`);
}

function grpWorkplaces(store: FormStore, key: string): string[] {
    return store.getArray(`${key}|Munkahely`);
}

function grpMtmtIds(store: FormStore, key: string): string[] {
    return store.getArray(`${key}|MTMT azonosító`);
}

/** Returns the common hierarchical prefix of two " / "-separated affiliation strings, or null. */
function affiliationOverlap(a: string, b: string): string | null {
    const pa = a
        .split(" / ")
        .map((s) => s.trim())
        .filter(Boolean);
    const pb = b
        .split(" / ")
        .map((s) => s.trim())
        .filter(Boolean);
    const common: string[] = [];
    for (let i = 0; i < Math.min(pa.length, pb.length); i++) {
        if (pa[i] === pb[i]) common.push(pa[i]);
        else break;
    }
    return common.length > 0 ? common.join(" / ") : null;
}

type CheckLine = { text: string; status: "" | "ok" | "warn" | "error"; indent?: boolean; links?: string[] };

export const CommitteeChecker = ({ keyPrefix }: { group: GroupDescriptor; keyPrefix: string; index: number }) => {
    const store = useValueStore();
    const [lines, setLines] = useState<CheckLine[]>([]);
    // keyPrefix is e.g. "formName|Bíráló bizottság|Ellenőrzés"
    // sibling group keys live one level up: "formName|Bíráló bizottság|<groupKey>"
    const sectionPrefix = keyPrefix.substring(0, keyPrefix.lastIndexOf("|"));
    const pagePrefix = sectionPrefix.substring(0, sectionPrefix.lastIndexOf("|"));
    const grp = (name: string) => `${pagePrefix}|${name}|${name}`;

    const runChecks = async () => {
        const result: CheckLine[] = [];
        // ── Count checks ──────────────────────────────────────────────────────
        result.push({ text: "── Létszámok ──", status: "" });
        const countChecks: [string, string, number][] = [
            [grp("Hivatalos bírálók"), "Bírálók", 3],
            [grp("Tartalék bírálók"), "Tartalék bírálók", 3],
            [grp("Bíráló bizottság elnöke"), "Bíráló bizottság elnöke", 1],
            [grp("Bíráló bizottság titkára"), "Bíráló bizottság titkára", 1],
            [grp("Bíráló bizottság tartalék elnöke"), "Bíráló bizottság tartalék elnöke", 1],
            [grp("Bíráló bizottság tartalék titkára"), "Bíráló bizottság tartalék titkára", 1],
            [grp("Bíráló bizottság tagjai"), "Bíráló bizottság tagjai", 5],
            [grp("Bíráló bizottság tartalék tagjai"), "Bíráló bizottság tartalék tagjai", 5]
        ];
        for (const [key, label, expected] of countChecks) {
            const n = grpLength(store, key);
            if (n === expected) {
                result.push({ text: `${label}: ${n} fő ✓`, status: "ok" });
            } else if (n < expected) {
                result.push({ text: `${label}: ${n} fő — ${expected - n} további fő hozzáadása szükséges`, status: "warn" });
            } else {
                result.push({ text: `${label}: ${n} fő — túl sok, legfeljebb ${expected} fő megengedett`, status: "error" });
            }
        }

        // ── Degree checks ─────────────────────────────────────────────────────
        result.push({ text: "── Fokozatok ──", status: "" });

        // Hivatalos bírálók
        const biralokDeg = grpDegrees(store, grp("Hivatalos bírálók"));
        const biralokMta = biralokDeg.filter((d) => MTA_DEGREES.has(d)).length;
        const biralokPhd = biralokDeg.filter((d) => PHD_DEGREES.has(d)).length;
        result.push({
            text: `MTA doktora fokozattal rendelkezik ${biralokMta} bíráló ${biralokMta >= 2 ? "✓" : "✗"}`,
            status: biralokMta >= 2 ? "ok" : "error"
        });
        if (biralokMta < 2) {
            result.push({
                text: `→ Legalább 2 bírálónak MTA doktora, MTA levelező tagja vagy MTA rendes tagja fokozattal kell rendelkeznie`,
                status: "error",
                indent: true
            });
        }
        if (biralokPhd > 1) {
            result.push({
                text: `→ Legfeljebb 1 bíráló rendelkezhet PhD vagy Kandidátus fokozattal (jelenleg: ${biralokPhd} fő)`,
                status: "error",
                indent: true
            });
        } else {
            result.push({ text: `PhD/Kandidátus fokozatú bírálók száma megfelelő (${biralokPhd} fő) ✓`, status: "ok" });
        }

        // Tartalék bírálók
        const tarBiralokDeg = grpDegrees(store, grp("Tartalék bírálók"));
        const tarBiralokMta = tarBiralokDeg.filter((d) => MTA_DEGREES.has(d)).length;
        const tarBiralokPhd = tarBiralokDeg.filter((d) => PHD_DEGREES.has(d)).length;
        result.push({
            text: `MTA doktora fokozattal rendelkezik ${tarBiralokMta} tartalék bíráló ${tarBiralokMta >= 2 ? "✓" : "✗"}`,
            status: tarBiralokMta >= 2 ? "ok" : "error"
        });
        if (tarBiralokMta < 2) {
            result.push({
                text: `→ Legalább 2 tartalék bírálónak MTA doktora, MTA levelező tagja vagy MTA rendes tagja fokozattal kell rendelkeznie`,
                status: "error",
                indent: true
            });
        }
        if (tarBiralokPhd > 1) {
            result.push({
                text: `→ Legfeljebb 1 tartalék bíráló rendelkezhet PhD vagy Kandidátus fokozattal (jelenleg: ${tarBiralokPhd} fő)`,
                status: "error",
                indent: true
            });
        } else {
            result.push({ text: `PhD/Kandidátus fokozatú tartalék bírálók száma megfelelő (${tarBiralokPhd} fő) ✓`, status: "ok" });
        }

        // Elnök / tartalék elnök — must be MTA-level
        for (const [key, label] of [
            [grp("Bíráló bizottság elnöke"), "Bíráló bizottság elnöke"],
            [grp("Bíráló bizottság tartalék elnöke"), "Bíráló bizottság tartalék elnöke"]
        ] as [string, string][]) {
            const deg = grpDegrees(store, key);
            if (deg.length === 0) {
                result.push({ text: `${label}: nincs megadva`, status: "warn" });
            } else if (!MTA_DEGREES.has(deg[0])) {
                result.push({
                    text: `${label}: fokozat nem megfelelő ("${deg[0] || "nincs megadva"}") — MTA doktora, MTA rendes tagja vagy MTA levelező tagja szükséges`,
                    status: "error"
                });
            } else {
                result.push({ text: `${label} fokozata megfelelő ✓`, status: "ok" });
            }
        }

        // Titkár / tartalék titkár — must have at least PhD/Kandidátus
        for (const [key, label] of [
            [grp("Bíráló bizottság titkára"), "Bíráló bizottság titkára"],
            [grp("Bíráló bizottság tartalék titkára"), "Bíráló bizottság tartalék titkára"]
        ] as [string, string][]) {
            const deg = grpDegrees(store, key);
            if (deg.length === 0) {
                result.push({ text: `${label}: nincs megadva`, status: "warn" });
            } else if (!VALID_DEGREES.has(deg[0])) {
                result.push({ text: `${label}: fokozat nem megfelelő ("${deg[0]}") — legalább PhD vagy Kandidátus szükséges`, status: "error" });
            } else {
                result.push({ text: `${label} fokozata megfelelő ✓`, status: "ok" });
            }
        }

        // Tagjai — normally all MTA-level; exception: if ALL bírálók are MTA-level, 1 PhD is allowed
        const tagokDeg = grpDegrees(store, grp("Bíráló bizottság tagjai"));
        const allBiralokMta = biralokDeg.length > 0 && biralokDeg.every((d) => MTA_DEGREES.has(d));
        if (tagokDeg.length === 0) {
            result.push({ text: `Bíráló bizottság tagjai: nincs megadva`, status: "warn" });
        } else if (allBiralokMta) {
            const tagokPhd = tagokDeg.filter((d) => PHD_DEGREES.has(d)).length;
            const tagokInvalid = tagokDeg.filter((d) => !MTA_DEGREES.has(d) && !PHD_DEGREES.has(d) && !VALID_DEGREES.has(d)).length;
            if (tagokPhd > 1) {
                result.push({
                    text: `Bíráló bizottság tagjai: ${tagokPhd} tag PhD/Kandidátus fokozattal — mivel minden bíráló MTA fokozatú, legfeljebb 1 megengedett`,
                    status: "error"
                });
            } else if (tagokInvalid > 0) {
                result.push({ text: `Bíráló bizottság tagjai: ${tagokInvalid} tag nem rendelkezik elfogadható fokozattal`, status: "error" });
            } else {
                result.push({ text: `Bíráló bizottság tagjai fokozatai megfelelők ✓`, status: "ok" });
            }
        } else {
            const nonMta = tagokDeg.filter((d) => !MTA_DEGREES.has(d)).length;
            if (nonMta > 0) {
                result.push({
                    text: `Bíráló bizottság tagjai: ${nonMta} tag nem rendelkezik MTA fokozattal — minden tagnak MTA doktora, MTA levelező tagja vagy MTA rendes tagja fokozattal kell rendelkeznie`,
                    status: "error"
                });
            } else {
                result.push({ text: `Bíráló bizottság tagjai fokozatai megfelelők ✓`, status: "ok" });
            }
        }

        // ── Affiliation overlap checks ────────────────────────────────────────────────
        result.push({ text: "── Intézményi összeférhetetlenség ──", status: "" });
        result.push({
            text: "Ellenőrizze manuálisan, hogy a jelzett szervezeti szintig fennálló munkahelyi átfedés összeférhetetlenséget jelent-e.",
            status: ""
        });
        const applicantData = getApplicantAuthorRecord();
        const applicantAffiliations = applicantData?.affiliations ?? [];
        if (applicantAffiliations.length === 0) {
            result.push({ text: "A kérelmező intézményi adatai nem elérhetők, az összeférhetetlenségi ellenőrzés nem végezhető el.", status: "warn" });
        } else {
            const allGroupKeys: [string, string][] = [
                [grp("Hivatalos bírálók"), "Bíráló"],
                [grp("Tartalék bírálók"), "Tartalék bíráló"],
                [grp("Bíráló bizottság elnöke"), "Elnök"],
                [grp("Bíráló bizottság titkára"), "Titkár"],
                [grp("Bíráló bizottság tartalék elnöke"), "Tartalék elnök"],
                [grp("Bíráló bizottság tartalék titkára"), "Tartalék titkár"],
                [grp("Bíráló bizottság tagjai"), "Tag"],
                [grp("Bíráló bizottság tartalék tagjai"), "Tartalék tag"]
            ];
            let anyOverlap = false;
            for (const [key] of allGroupKeys) {
                const names = grpNames(store, key);
                const workplaces = grpWorkplaces(store, key);
                for (let i = 0; i < names.length; i++) {
                    const memberName = names[i] || `(${i + 1}. tag)`;
                    const memberAffs = (workplaces[i] ?? "")
                        .split(", ")
                        .map((s) => s.trim())
                        .filter(Boolean);
                    const overlaps = new Set<string>();
                    for (const appAff of applicantAffiliations) {
                        for (const memAff of memberAffs) {
                            const common = affiliationOverlap(appAff, memAff);
                            if (common) overlaps.add(common);
                        }
                    }
                    if (overlaps.size > 0) {
                        anyOverlap = true;
                        result.push({
                            text: `${memberName} és a kérelmező közös munkahellyel rendelkezik: ${[...overlaps].join("; ")}`,
                            status: "warn"
                        });
                    }
                }
            }
            if (!anyOverlap) {
                result.push({ text: "Nincs intézményi összeférhetetlenség ✓", status: "ok" });
            }
        }

        // ── Publication overlap checks ────────────────────────────────────────────────
        result.push({ text: "── Közös publikációk ──", status: "" });
        const allGroupKeysForPubs: string[] = [
            grp("Hivatalos bírálók"),
            grp("Tartalék bírálók"),
            grp("Bíráló bizottság elnöke"),
            grp("Bíráló bizottság titkára"),
            grp("Bíráló bizottság tartalék elnöke"),
            grp("Bíráló bizottság tartalék titkára"),
            grp("Bíráló bizottság tagjai"),
            grp("Bíráló bizottság tartalék tagjai")
        ];
        for (const key of allGroupKeysForPubs) {
            const names = grpNames(store, key);
            const memberMtmtIds = grpMtmtIds(store, key);
            for (let i = 0; i < names.length; i++) {
                const memberName = names[i] || `(${i + 1}. tag)`;
                const memberMtmtId = memberMtmtIds[i];
                if (!memberMtmtId) {
                    result.push({ text: `${memberName} — nincs MTMT azonosító megadva`, status: "warn" });
                    continue;
                }
                const commonPubs = getCommonPubsWithApplicant(memberMtmtId);
                if (commonPubs.length === 0) {
                    result.push({ text: `${memberName} — nincs közös publikáció ✓`, status: "ok" });
                } else {
                    result.push({
                        text: `${memberName} és a kérelmező közös publikációi: `,
                        status: "error",
                        links: commonPubs
                    });
                }
            }
        }

        setLines(result);
    };

    return (
        <div className="space-y-3 py-2">
            <div className="flex w-full items-center gap-2">
                <Button variant="outline" className="bg-primary hover:bg-primary/80 text-primary-foreground hover:text-primary-foreground" onClick={runChecks}>
                    Bíráló bizottság ellenőrzése
                </Button>
                <div className="flex-1" />
                {lines.length > 0 && (
                    <Button variant="outline" onClick={() => setLines([])} className="print:hidden">
                        Eredmények törlése
                    </Button>
                )}
            </div>
            {lines.length > 0 && (
                <div className="space-y-0.5 text-sm">
                    {lines.map((line, i) => (
                        <div
                            key={i}
                            className={`px-1 flex flex-wrap items-baseline gap-x-1 ${line.indent ? "pl-8" : ""} ${
                                line.status === "ok"
                                    ? "text-green-700 dark:text-green-400"
                                    : line.status === "warn"
                                      ? "text-amber-600 dark:text-amber-400"
                                      : line.status === "error"
                                        ? "text-red-600 dark:text-red-400"
                                        : ""
                            }`}
                        >
                            <span>{line.text}</span>
                            {line.links &&
                                line.links.map((mtid) => (
                                    <a
                                        key={mtid}
                                        href={`https://m2.mtmt.hu/api/publication/${mtid}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="underline hover:no-underline"
                                    >
                                        {mtid}
                                    </a>
                                ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
