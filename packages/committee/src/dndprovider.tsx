import { useState, useCallback, useRef, createContext, useContext } from "react";
import { type GroupDescriptor, useValueStore } from "@repo/form-engine";
import { GripVertical } from "lucide-react";
import {
    useDraggable,
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    type DragOverEvent,
    DragOverlay
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { insertCommitteeRowAt, readCommitteeRow, type RowData } from "./roles";

export type DndItemId = string; // formátum: "arrayKey::index"

/**
 * A húzás forrása. A bizottsági táblák sorai "row" típusúak (a drop áthelyezi őket: a forrásból
 * törlődnek), a lap tetején lévő előterjesztői paletta chipjei "external" típusúak (a drop
 * MÁSOL: a forrás érintetlen marad, hiszen az az előterjesztő javaslata, nem szerkeszthető).
 */
export type CommitteeDragSource = { kind: "row"; prefix: string; index: number } | { kind: "external"; row: RowData };

// ─── Az egész lapon megosztott DnD-kontextus ─────────────────────────────────

type CommitteeDndContextValue = {
    registerGroup: (keyPrefix: string, group: GroupDescriptor) => void;
    unregisterGroup: (keyPrefix: string) => void;
    getGroups: () => Map<string, GroupDescriptor>;
    crossGroupOver: { targetPrefix: string; targetIndex: number } | null;
    activeSourcePrefix: string | null;
    /** Van-e éppen folyamatban húzás (a táblák tömör módra váltásához). */
    isDragActive: boolean;
};

const CommitteeDndReactContext = createContext<CommitteeDndContextValue | null>(null);

export function useCommitteeDnd(): CommitteeDndContextValue | null {
    return useContext(CommitteeDndReactContext);
}

/** A húzott elem forrásának kiolvasása: elsődlegesen a draggable `data`-jából, visszaesésként az id-ból. */
function readDragSource(data: Record<string, unknown> | undefined, id: string): CommitteeDragSource | null {
    const source = data?.committeeSource as CommitteeDragSource | undefined;
    if (source) return source;
    if (!id.includes("::")) return null;
    const [prefix, idxStr] = parseItemId(id);
    return { kind: "row", prefix, index: parseInt(idxStr) };
}

/**
 * A lapot körbefogó wrapper, ami a csoportok közti drag & drophoz közös DndContext-et ad.
 */
export const CommitteeDndProvider = ({ children }: { children: React.ReactNode }) => {
    const store = useValueStore();
    const groupsRef = useRef(new Map<string, GroupDescriptor>());
    // Az overlay kinézete a forrás típusától függ: a táblasor overlay-e a sor teljes
    // szélességét kapja, a paletta-chipé viszont csak a chip méretét - más tartalom kell bele.
    const [activeDrag, setActiveDrag] = useState<{ row: RowData; kind: CommitteeDragSource["kind"] } | null>(null);
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

    const readRow = useCallback((keyPrefix: string, index: number): RowData => readCommitteeRow(store, keyPrefix, index), [store]);

    const removeRow = useCallback(
        (keyPrefix: string, index: number, group: GroupDescriptor) => {
            store.deleteFromFormArray(group, keyPrefix, index);
        },
        [store]
    );

    const insertRow = useCallback(
        (keyPrefix: string, index: number, group: GroupDescriptor, row: RowData) => {
            insertCommitteeRowAt(store, group, keyPrefix, index, row);
        },
        [store]
    );

    const handleDragStart = useCallback(
        (event: DragStartEvent) => {
            const id = event.active.id as string;
            const source = readDragSource(event.active.data.current, id);
            if (!source) return;
            if (source.kind === "external") {
                setActiveSourcePrefix(null);
                setActiveDrag({ row: source.row, kind: "external" });
                return;
            }
            setActiveSourcePrefix(source.prefix);
            if (groupsRef.current.get(source.prefix)) {
                setActiveDrag({ row: readRow(source.prefix, source.index), kind: "row" });
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
            sourcePrefix: string | null
        ): { targetPrefix: string; targetIdx: number } | null => {
            let effectiveOver = over;
            const overId = over.id as string;

            // Compute active element's current center
            const initialRect = active.rect.current.initial;
            const activeCenter = initialRect ? initialRect.top + initialRect.height / 2 + delta.y : null;

            // If primary hit belongs to the source group, check if the pointer is physically
            // inside a different group's container — if so, prefer that container.
            const overIsSourceItem = sourcePrefix !== null && overId.includes("::") && parseItemId(overId)[0] === sourcePrefix;
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

            const source = readDragSource(active.data.current, active.id as string);
            const sourcePrefix = source?.kind === "row" ? source.prefix : null;
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
            setActiveDrag(null);
            setCrossGroupOver(null);
            setActiveSourcePrefix(null);

            const { active, over, delta, collisions } = event;
            if (!over || active.id === over.id) return;

            const source = readDragSource(active.data.current, active.id as string);
            if (!source) return;

            const sourcePrefix = source.kind === "row" ? source.prefix : null;
            const resolved = resolveTarget(active, over, delta, collisions, sourcePrefix);
            if (!resolved) return;
            const { targetPrefix, targetIdx } = resolved;

            const targetEntry = groupsRef.current.get(targetPrefix);
            if (!targetEntry) return;

            // Külső forrás (előterjesztői paletta): MÁSOLÁS, a forrás érintetlen marad.
            if (source.kind === "external") {
                insertRow(targetPrefix, targetIdx, targetEntry, source.row);
                return;
            }

            const sourceEntry = groupsRef.current.get(source.prefix);
            if (!sourceEntry) return;
            const rowData = readRow(source.prefix, source.index);

            if (source.prefix === targetPrefix) {
                // Same group: reorder
                if (source.index === targetIdx) return;
                removeRow(source.prefix, source.index, sourceEntry);
                insertRow(targetPrefix, targetIdx, targetEntry, rowData);
            } else {
                // Cross-group: remove from source, insert into target
                removeRow(source.prefix, source.index, sourceEntry);
                insertRow(targetPrefix, targetIdx, targetEntry, rowData);
            }
        },
        [readRow, removeRow, insertRow, resolveTarget]
    );

    const handleDragCancel = useCallback(() => {
        setActiveDrag(null);
        setCrossGroupOver(null);
        setActiveSourcePrefix(null);
    }, []);

    const ctxValue: CommitteeDndContextValue = {
        registerGroup,
        unregisterGroup,
        getGroups,
        crossGroupOver,
        activeSourcePrefix,
        isDragActive: activeDrag !== null
    };

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
                    {activeDrag?.kind === "row" && (
                        <div className="bg-background border rounded shadow-lg px-3 py-2 text-sm flex items-center gap-2 opacity-90">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{activeDrag.row.name}</span>
                            {activeDrag.row.mtmtId && <span className="text-muted-foreground">[{activeDrag.row.mtmtId}]</span>}
                            <span className="text-muted-foreground">— {activeDrag.row.degree}</span>
                        </div>
                    )}
                    {/* A paletta chipjének overlay-e: a chip saját méretét kapja, ezért ugyanazzal a
                        betűmérettel és belső margóval, csak a névvel jelenik meg. */}
                    {activeDrag?.kind === "external" && (
                        <div className="flex h-full w-full items-center rounded border border-primary bg-background px-1.5 py-0.5 text-xs whitespace-nowrap shadow-lg">
                            <span className="truncate">{activeDrag.row.name || `[${activeDrag.row.mtmtId}]`}</span>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </CommitteeDndReactContext.Provider>
    );
};

// ─── Helper to parse item IDs ────────────────────────────────────────────────

export function parseItemId(id: string): [string, string] {
    const lastSep = id.lastIndexOf("::");
    return [id.substring(0, lastSep), id.substring(lastSep + 2)];
}

export function makeItemId(keyPrefix: string, index: number): DndItemId {
    return `${keyPrefix}::${index}`;
}

// ─── Külső (nem táblában lévő) elem húzhatóvá tétele ─────────────────────────

/**
 * Egy lapon kívüli forrás - jelenleg a bizottsági adatlap előterjesztői palettája - egy elemének
 * húzhatóvá tétele. A drop MÁSOL: a forrás érintetlen marad, mert az egy betöltött előterjesztő
 * javaslata, nem szerkeszthető adat.
 *
 * Csak a pointer-figyelőt adja vissza (a teljes `listeners` helyett), mert a paletta chipje egyben
 * kattintható is: a KeyboardSensor Enter/Space aktivátora ütközne a chip saját kattintásával -
 * billentyűzetről a szereplistát nyitó kattintás az út, nem a húzás.
 */
export function useExternalCommitteeDraggable(id: string, row: RowData) {
    const source: CommitteeDragSource = { kind: "external", row };
    const { listeners, setNodeRef, isDragging } = useDraggable({ id, data: { committeeSource: source } });
    return {
        setNodeRef,
        isDragging,
        onPointerDown: listeners?.onPointerDown as ((event: React.PointerEvent<HTMLElement>) => void) | undefined
    };
}
