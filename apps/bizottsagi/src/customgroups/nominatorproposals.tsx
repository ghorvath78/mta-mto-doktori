import { useRef, useState } from "react";
import { useCollapsibleState, useFieldArrayValue, useSetInfoState, useValueStore } from "@repo/form-engine";
import {
    COMMITTEE_ROLES,
    CommitteeDndProvider,
    CommitteeFieldKey,
    EMPTY_ROW,
    committeeArrayKey,
    committeeArrayLength,
    personIdentity,
    useExternalCommitteeDraggable,
    type CommitteeRole,
    type RowData
} from "@repo/committee";
import {
    TARGET_PAGE_PREFIX,
    addToRole,
    adoptProposal,
    buildPalette,
    buildProposals,
    type NominatorProposal,
    type PaletteEntry
} from "./nominatorproposaldata";
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Popover, PopoverAnchor, PopoverContent } from "@repo/ui";
import { Check, ChevronDown, ChevronRight, Users } from "lucide-react";
import { useNominatorSlots, type NominatorSlotView } from "../nominators";

// A bizottság saját bírálóbizottsági javaslata ezen a lapon áll össze. A lap tetején - a lap
// wrapperComponent-jeként, tehát a szakaszoktól függetlenül, sticky módon - jelenik meg az
// előterjesztők javaslata: felül a komplett átvétel (1. réteg), alatta a deduplikált
// névpaletta (2. réteg), amelyről chipenként lehet embert a bizottság táblái közé tenni.

// ─── A bizottság saját tábláiban már szereplő személyek ──────────────────────

/**
 * A bizottság saját javaslatában MÁR szereplő személyek azonosítói - ettől lesznek a paletta
 * chipjei "felhasznált" jelölésűek. Reaktív: minden szerepre feliratkozik a bizottság tömbjének
 * nevére és MTMT azonosítójára (a COMMITTEE_ROLES fix konstans, így a hookok száma és sorrendje
 * minden renderben azonos).
 */
function useCommitteeIdentities(): Set<string> {
    const identities = new Set<string>();
    for (const role of COMMITTEE_ROLES) {
        const arrayKey = committeeArrayKey(TARGET_PAGE_PREFIX, role.key);
        // eslint-disable-next-line react-hooks/rules-of-hooks -- a COMMITTEE_ROLES fix konstans, a hívások száma/sorrendje minden renderben azonos
        const names = useFieldArrayValue(`${arrayKey}|${CommitteeFieldKey.name}`);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const mtmtIds = useFieldArrayValue(`${arrayKey}|${CommitteeFieldKey.mtmtId}`);
        for (let i = 0; i < Math.max(names.length, mtmtIds.length); i++) {
            const identity = personIdentity({ ...EMPTY_ROW, name: names[i] ?? "", mtmtId: mtmtIds[i] ?? "" });
            if (identity) identities.add(identity);
        }
    }
    return identities;
}

// ─── Chip ────────────────────────────────────────────────────────────────────

const NominatorBadges = ({ nominators }: { nominators: number[] }) => (
    <span className="flex gap-px text-[10px] leading-none text-muted-foreground">
        {[...nominators].sort((a, b) => a - b).map((n) => (
            <span key={n} className="rounded-sm bg-muted px-1 py-0.5">
                {n}
            </span>
        ))}
    </span>
);

const PaletteChip = ({
    entry,
    role,
    alreadyUsed,
    slots,
    onPlace
}: {
    entry: PaletteEntry;
    role: CommitteeRole;
    alreadyUsed: boolean;
    slots: NominatorSlotView[];
    onPlace: (role: CommitteeRole, row: RowData) => void;
}) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const setInfo = useSetInfoState();
    // A chip azonosítója a szerepből és a személy azonosságából áll (nem tartalmaz "::"-t, hogy a
    // DnD-kontextus sorazonosító-formátumával össze se lehessen keverni).
    const { setNodeRef, isDragging, onPointerDown } = useExternalCommitteeDraggable(`palette|${role.key}|${entry.identity}`, entry.row);

    // A chip egyszerre húzható és kattintható. A PointerSensor 5px elmozdulásnál indít húzást, a
    // böngésző viszont a húzás végén is kattintást küld - ezért a lenyomás és a kattintás helyét
    // összevetve döntjük el, hogy valódi kattintás volt-e (ekkor nyílik a szereplista).
    const pointerDownAt = useRef<{ x: number; y: number } | null>(null);
    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        pointerDownAt.current = { x: event.clientX, y: event.clientY };
        onPointerDown?.(event);
    };
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const down = pointerDownAt.current;
        if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) return;
        setPopoverOpen((prev) => !prev);
    };

    const infoText = [
        entry.row.name || "(nincs név)",
        entry.row.degree ? `Fokozat: ${entry.row.degree}` : "",
        entry.row.discipline ? `Szakterület: ${entry.row.discipline}` : "",
        entry.row.workplace ? `Munkahely: ${entry.row.workplace}` : "",
        entry.row.mtmtId ? `MTMT azonosító: ${entry.row.mtmtId}` : "",
        "",
        `Javasolta ${role.shortLabel.toLowerCase()}ként: ` +
            entry.nominators
                .map((n) => slots.find((s) => s.index === n)?.name || `${n}. előterjesztő`)
                .join(", "),
        alreadyUsed ? "\nA bizottság javaslatában már szerepel." : "",
        "\nKattintson a szerep kiválasztásához, vagy húzza a kívánt táblába."
    ]
        .filter((line) => line !== "")
        .join("\n");

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverAnchor asChild>
                <button
                    ref={setNodeRef}
                    type="button"
                    onPointerDown={handlePointerDown}
                    onClick={handleClick}
                    className={`flex max-w-full items-center gap-1 rounded border px-1.5 py-0.5 text-xs whitespace-nowrap ${
                        alreadyUsed ? "border-dashed border-border text-muted-foreground" : "border-border bg-background hover:border-primary"
                    } ${isDragging ? "opacity-40" : ""} cursor-grab active:cursor-grabbing`}
                    onMouseEnter={() => setInfo({ field: infoText })}
                    onMouseLeave={() => setInfo({ field: "" })}
                    title={entry.row.name}
                >
                    {alreadyUsed && <Check className="h-3 w-3 shrink-0" />}
                    <span className="truncate">{entry.row.name || `[${entry.row.mtmtId}]`}</span>
                    <NominatorBadges nominators={entry.nominators} />
                </button>
            </PopoverAnchor>
            <PopoverContent className="w-64 p-1" align="start">
                <div className="px-2 py-1 text-xs text-muted-foreground">Hozzáadás a bizottság javaslatához:</div>
                {COMMITTEE_ROLES.map((target) => (
                    <RoleTargetButton
                        key={target.key}
                        role={target}
                        highlighted={target.key === role.key}
                        onClick={() => {
                            onPlace(target, entry.row);
                            setPopoverOpen(false);
                        }}
                    />
                ))}
            </PopoverContent>
        </Popover>
    );
};

const RoleTargetButton = ({ role, highlighted, onClick }: { role: CommitteeRole; highlighted: boolean; onClick: () => void }) => {
    const length = useFieldArrayValue(`${committeeArrayKey(TARGET_PAGE_PREFIX, role.key)}|${CommitteeFieldKey.name}`).length;
    const full = length >= role.max;
    return (
        <button
            type="button"
            className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm hover:bg-accent ${highlighted ? "font-semibold" : ""}`}
            onClick={onClick}
        >
            <span className="truncate">{role.key}</span>
            <span className={`ml-2 shrink-0 text-xs ${full ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                {length}/{role.max}
                {full ? " (betelt)" : ""}
            </span>
        </button>
    );
};

// ─── Komplett javaslat átvétele ──────────────────────────────────────────────

const AdoptDialog = ({
    proposal,
    onClose,
    onAdopt
}: {
    proposal: NominatorProposal | null;
    onClose: () => void;
    onAdopt: (proposal: NominatorProposal, mode: "overwrite" | "merge") => void;
}) => (
    <Dialog open={proposal !== null} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Előterjesztői javaslat átvétele</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2 text-sm">
                <p>
                    A bizottság javaslatában már szerepelnek nevek.{" "}
                    <span className="font-semibold">{proposal?.slot.name || `${proposal?.slot.index}. előterjesztő`}</span> javaslatának átvétele:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                    <li>
                        <span className="font-semibold">Felülírás</span>: a bizottság eddigi javaslata minden szerepben törlődik, és az előterjesztő
                        javaslata kerül a helyére.
                    </li>
                    <li>
                        <span className="font-semibold">Összefűzés</span>: a bizottság eddigi javaslata megmarad, és csak azok a személyek kerülnek be,
                        akik még egyáltalán nem szerepelnek benne - a betelt szerepekbe nem kerül újabb név.
                    </li>
                </ul>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                    Mégse
                </Button>
                <Button variant="outline" onClick={() => proposal && onAdopt(proposal, "merge")}>
                    Összefűzés
                </Button>
                <Button variant="destructive" onClick={() => proposal && onAdopt(proposal, "overwrite")}>
                    Felülírás
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

// ─── A sticky sáv ────────────────────────────────────────────────────────────

const NominatorProposalsBar = () => {
    const store = useValueStore();
    const slots = useNominatorSlots();
    const usedIdentities = useCommitteeIdentities();
    const [open, setOpen] = useCollapsibleState("Bizottsági-eloterjesztoi-javaslatok-open");
    const [unusedOnly, setUnusedOnly] = useState(false);
    const [adoptDialogFor, setAdoptDialogFor] = useState<NominatorProposal | null>(null);
    const [status, setStatus] = useState("");

    // Az előterjesztők javaslata a feltöltés után már nem változik, de minden renderben újra
    // felépítjük - a useNominatorSlots() minden hívásban új tömböt ad, tehát memoizálni csak
    // látszatra lehetne. Legfeljebb 3 x 20 sorról van szó, és ez a komponens csak a slotok, a
    // bizottság tábláinak és a saját állapotának változására renderel újra.
    const proposals = buildProposals(store, slots);
    const palette = buildPalette(proposals);

    const allPaletteIdentities = new Set<string>();
    for (const entries of palette.values()) for (const entry of entries) allPaletteIdentities.add(entry.identity);
    const totalPersons = allPaletteIdentities.size;

    const handlePlace = (role: CommitteeRole, row: RowData) => {
        addToRole(store, role, row);
        setStatus(`${row.name || "A kiválasztott személy"} hozzáadva: ${role.key}.`);
    };

    const runAdopt = (proposal: NominatorProposal, mode: "overwrite" | "merge") => {
        const result = adoptProposal(store, proposal, mode);
        setAdoptDialogFor(null);
        const parts = [`${result.added} személy átvéve`];
        if (result.skippedDuplicate > 0) parts.push(`${result.skippedDuplicate} kihagyva (már szerepelt)`);
        if (result.skippedFull > 0) parts.push(`${result.skippedFull} kihagyva (betelt szerep)`);
        setStatus(`${proposal.slot.name || `${proposal.slot.index}. előterjesztő`} javaslatából ${parts.join(", ")}.`);
    };

    const handleAdoptClick = (proposal: NominatorProposal) => {
        const hasExisting = COMMITTEE_ROLES.some((role) => committeeArrayLength(store, committeeArrayKey(TARGET_PAGE_PREFIX, role.key)) > 0);
        if (hasExisting) {
            setAdoptDialogFor(proposal);
        } else {
            runAdopt(proposal, "overwrite");
        }
    };

    return (
        <div className="sticky top-0 z-20 -mx-1 bg-muted px-1 pb-2">
            <div className="rounded border border-primary/40 bg-background shadow-sm">
                <div className="flex items-center gap-2 px-2 py-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => setOpen(!open)} title={open ? "Összecsukás" : "Kinyitás"}>
                        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <Users className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm font-semibold">Előterjesztői javaslatok</span>
                    <span className="text-xs text-muted-foreground">
                        {slots.length} előterjesztő, {totalPersons} javasolt személy
                    </span>
                    <div className="flex-1" />
                    {open && totalPersons > 0 && (
                        <label className="flex items-center gap-1 text-xs text-muted-foreground">
                            <input type="checkbox" checked={unusedOnly} onChange={(e) => setUnusedOnly(e.target.checked)} />
                            Csak a még fel nem használtak
                        </label>
                    )}
                </div>

                {open && (
                    <div className="space-y-2 border-t px-2 py-2">
                        {/* 1. réteg: komplett javaslat átvétele */}
                        <div className="space-y-1">
                            {proposals.map((proposal) => (
                                <div key={proposal.slot.index} className="flex items-center gap-2 text-sm">
                                    <span className="w-4 shrink-0 text-muted-foreground">{proposal.slot.index}.</span>
                                    <span className="truncate font-medium">{proposal.slot.name || "(nincs név)"}</span>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {proposal.personCount > 0 ? `${proposal.personCount} javasolt személy` : "nincs bírálóbizottsági javaslat"}
                                    </span>
                                    <div className="flex-1" />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={proposal.personCount === 0}
                                        onClick={() => handleAdoptClick(proposal)}
                                    >
                                        Teljes javaslat átvétele
                                    </Button>
                                </div>
                            ))}
                            {proposals.length === 0 && <div className="text-sm italic text-muted-foreground">Nincs betöltött előterjesztő.</div>}
                        </div>

                        {/* 2. réteg: deduplikált névpaletta szerepenként */}
                        {totalPersons > 0 && (
                            <div className="max-h-[28vh] space-y-1 overflow-y-auto border-t pt-2">
                                {COMMITTEE_ROLES.map((role) => {
                                    const entries = (palette.get(role.key) ?? []).filter((entry) => !unusedOnly || !usedIdentities.has(entry.identity));
                                    if (entries.length === 0) return null;
                                    return (
                                        <div key={role.key} className="flex items-start gap-2">
                                            <span className="w-28 shrink-0 pt-0.5 text-xs text-muted-foreground">{role.shortLabel}</span>
                                            <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                                                {entries.map((entry) => (
                                                    <PaletteChip
                                                        key={entry.identity}
                                                        entry={entry}
                                                        role={role}
                                                        alreadyUsed={usedIdentities.has(entry.identity)}
                                                        slots={slots}
                                                        onPlace={handlePlace}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {totalPersons === 0 && proposals.length > 0 && (
                            <div className="border-t pt-2 text-sm italic text-muted-foreground">
                                Egyik betöltött előterjesztő sem adott meg bírálóbizottsági javaslatot.
                            </div>
                        )}
                        {status && <div className="border-t pt-1 text-xs text-primary">{status}</div>}
                    </div>
                )}
            </div>
            <AdoptDialog proposal={adoptDialogFor} onClose={() => setAdoptDialogFor(null)} onAdopt={runAdopt} />
        </div>
    );
};

/**
 * A bírálóbizottsági lap wrapperje: a csoportok közti drag & drop kontextusa, és a lap tetején
 * sticky módon megjelenő előterjesztői javaslat-sáv. A sáv azért itt (a wrapperben) van és nem
 * egy szakaszban, mert a sticky pozicionálás csak a szülőelem magasságán belül tart: így a
 * paletta az összes tábla scrollozása közben végig a helyén marad.
 */
export const BiraloBizottsagWrapper = ({ children }: { children: React.ReactNode }) => (
    <CommitteeDndProvider>
        <NominatorProposalsBar />
        {children}
    </CommitteeDndProvider>
);
