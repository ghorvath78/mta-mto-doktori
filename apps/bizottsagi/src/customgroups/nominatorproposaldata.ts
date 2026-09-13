import type { FormStore } from "@repo/form-engine";
import {
    COMMITTEE_PAGE_KEY,
    COMMITTEE_ROLES,
    appendCommitteeRow,
    clearCommitteeArray,
    committeeArrayKey,
    committeeArrayLength,
    committeeGroupDescriptor,
    personIdentity,
    readCommitteeRow,
    type CommitteeRole,
    type RowData
} from "@repo/committee";
import { nominatorPrefix, type NominatorSlotView } from "../nominators";

// A bizottsági bírálóbizottság-összeállító lap tiszta adatlogikája: az előterjesztők betöltött
// javaslatának kiolvasása, a szerepenként deduplikált paletta felépítése, és a komplett javaslat
// átvétele. Szándékosan React-mentes (csak a FormStore-ra és a @repo/committee kulcsaira épül),
// hogy a UI nélkül, önmagában is tesztelhető legyen.

export const TARGET_PAGE_PREFIX = `Bizottsági|${COMMITTEE_PAGE_KEY}`;

export function nominatorPagePrefix(slotIndex: number): string {
    return `${nominatorPrefix(slotIndex)}|${COMMITTEE_PAGE_KEY}`;
}

// ─── Az előterjesztői javaslatok kiolvasása ──────────────────────────────────

/**
 * Egy előterjesztő bírálóbizottsági javaslata szerepenként. NEM reaktív olvasás: a betöltött
 * előterjesztői adat a feltöltés után már nem változik, a slotok változását pedig a
 * useNominatorSlots() feliratkozása követi (ld. nominators.ts), ami újrarendereli a palettát.
 */
export function readNominatorProposal(store: FormStore, slotIndex: number): Map<string, RowData[]> {
    const byRole = new Map<string, RowData[]>();
    const pagePrefix = nominatorPagePrefix(slotIndex);
    for (const role of COMMITTEE_ROLES) {
        const arrayKey = committeeArrayKey(pagePrefix, role.key);
        const rows: RowData[] = [];
        for (let i = 0; i < committeeArrayLength(store, arrayKey); i++) {
            const row = readCommitteeRow(store, arrayKey, i);
            if (personIdentity(row)) rows.push(row);
        }
        byRole.set(role.key, rows);
    }
    return byRole;
}

export type PaletteEntry = {
    identity: string;
    row: RowData;
    /** Mely előterjesztők (slot-index) javasolták ebben a szerepben. */
    nominators: number[];
};

export type NominatorProposal = {
    slot: NominatorSlotView;
    byRole: Map<string, RowData[]>;
    /** Hány különböző személyt javasolt összesen. */
    personCount: number;
};

export function buildProposals(store: FormStore, slots: NominatorSlotView[]): NominatorProposal[] {
    return slots.map((slot) => {
        const byRole = readNominatorProposal(store, slot.index);
        const identities = new Set<string>();
        for (const rows of byRole.values()) {
            for (const row of rows) identities.add(personIdentity(row));
        }
        return { slot, byRole, personCount: identities.size };
    });
}

/**
 * Szerepenként deduplikált paletta. Egy személy több szerepben is megjelenhet (ha az
 * előterjesztők más-más szerepre javasolták) - ez szándékos, a bizottságnak épp ez az információ
 * kell. A rendezés az egyetértés szerint csökkenő: akit több előterjesztő is javasolt ugyanabban
 * a szerepben, az előre kerül.
 */
export function buildPalette(proposals: NominatorProposal[]): Map<string, PaletteEntry[]> {
    const palette = new Map<string, PaletteEntry[]>();
    for (const role of COMMITTEE_ROLES) {
        const byIdentity = new Map<string, PaletteEntry>();
        for (const proposal of proposals) {
            for (const row of proposal.byRole.get(role.key) ?? []) {
                const identity = personIdentity(row);
                const existing = byIdentity.get(identity);
                if (existing) {
                    if (!existing.nominators.includes(proposal.slot.index)) existing.nominators.push(proposal.slot.index);
                    // A hiányos adatokat a bővebb javaslatból egészítjük ki.
                    for (const field of ["name", "degree", "discipline", "workplace", "mtmtId"] as const) {
                        if (!existing.row[field] && row[field]) existing.row[field] = row[field];
                    }
                } else {
                    byIdentity.set(identity, { identity, row: { ...row }, nominators: [proposal.slot.index] });
                }
            }
        }
        const entries = [...byIdentity.values()].sort(
            (a, b) => b.nominators.length - a.nominators.length || a.row.name.localeCompare(b.row.name, "hu")
        );
        palette.set(role.key, entries);
    }
    return palette;
}

// ─── Hozzáadás a bizottság tábláihoz ─────────────────────────────────────────

export function addToRole(store: FormStore, role: CommitteeRole, row: RowData) {
    const arrayKey = committeeArrayKey(TARGET_PAGE_PREFIX, role.key);
    appendCommitteeRow(store, committeeGroupDescriptor(role), arrayKey, row);
}

export type AdoptResult = { added: number; skippedDuplicate: number; skippedFull: number };

/**
 * Egy előterjesztő teljes javaslatának átvétele.
 *  - "overwrite": a bizottság mindegyik szerepe kiürül, és az előterjesztő javaslata kerül bele.
 *  - "merge": csak azok a személyek kerülnek be, akik még egyáltalán nem szerepelnek a bizottság
 *    javaslatában, és csak addig, amíg az adott szerep be nem telik.
 */
export function adoptProposal(store: FormStore, proposal: NominatorProposal, mode: "overwrite" | "merge"): AdoptResult {
    const result: AdoptResult = { added: 0, skippedDuplicate: 0, skippedFull: 0 };

    if (mode === "overwrite") {
        for (const role of COMMITTEE_ROLES) {
            const group = committeeGroupDescriptor(role);
            const arrayKey = committeeArrayKey(TARGET_PAGE_PREFIX, role.key);
            clearCommitteeArray(store, group, arrayKey);
            for (const row of proposal.byRole.get(role.key) ?? []) {
                appendCommitteeRow(store, group, arrayKey, row);
                result.added++;
            }
        }
        return result;
    }

    // Összefűzés: a már bárhol szereplő személyeket kihagyjuk.
    const existing = new Set<string>();
    for (const role of COMMITTEE_ROLES) {
        const arrayKey = committeeArrayKey(TARGET_PAGE_PREFIX, role.key);
        for (let i = 0; i < committeeArrayLength(store, arrayKey); i++) {
            const identity = personIdentity(readCommitteeRow(store, arrayKey, i));
            if (identity) existing.add(identity);
        }
    }
    for (const role of COMMITTEE_ROLES) {
        const group = committeeGroupDescriptor(role);
        const arrayKey = committeeArrayKey(TARGET_PAGE_PREFIX, role.key);
        for (const row of proposal.byRole.get(role.key) ?? []) {
            const identity = personIdentity(row);
            if (existing.has(identity)) {
                result.skippedDuplicate++;
                continue;
            }
            if (committeeArrayLength(store, arrayKey) >= role.max) {
                result.skippedFull++;
                continue;
            }
            appendCommitteeRow(store, group, arrayKey, row);
            existing.add(identity);
            result.added++;
        }
    }
    return result;
}
