import type { FieldDescriptor, FormStore, GroupDescriptor, SectionDescriptor } from "@repo/form-engine";

// ─── ADATFORMÁTUM - NEM VÁLTOZTATHATÓ ────────────────────────────────────────
//
// Az ebben a fájlban szereplő string literálok (lapkulcs, szerepkulcsok, mezőkulcsok) a mentett
// adatlapok JSON-jának ÚTVONALAI (ld. FormStore.toJSON: a store kulcsai szigorúan
// "form|lap|szakasz|csoport|mező" felépítésűek, és ha a szakasz- és csoportkulcs megegyezik, a
// JSON-ban a csoportszint kimarad). Sok előterjesztői adatlap készült már ezekkel a kulcsokkal,
// és a bizottsági app ezekből olvassa ki az előterjesztők javaslatát - bármelyik string
// megváltoztatása visszamenőlegesen olvashatatlanná tenné a korábban mentett PDF-eket.
//
// Az egyes szerepek szakaszkulcsa és csoportkulcsa SZÁNDÉKOSAN azonos (mindkettő a szerep kulcsa),
// mert a toJSON így a csoportszintet elhagyja, és a szerep javaslata egyetlen tömbként jelenik meg
// a JSON-ban.

/** A bírálóbizottsági lap kulcsa - mindkét appban ugyanez (ld. a fenti megjegyzést). */
export const COMMITTEE_PAGE_KEY = "Bíráló bizottság";

/** A bizottsági tag adatmezőinek kulcsai. */
export const CommitteeFieldKey = {
    mtmtId: "MTMT azonosító",
    name: "Név",
    degree: "Tudományos fokozat",
    discipline: "Szakterület",
    workplace: "Munkahely"
} as const;

/** A szerepek (szakasz- és egyben csoportkulcsok). */
export const CommitteeRoleKey = {
    biralok: "Hivatalos bírálók",
    tartalekBiralok: "Tartalék bírálók",
    elnok: "Bíráló bizottság elnöke",
    titkar: "Bíráló bizottság titkára",
    tartalekElnok: "Bíráló bizottság tartalék elnöke",
    tartalekTitkar: "Bíráló bizottság tartalék titkára",
    tagok: "Bíráló bizottság tagjai",
    tartalekTagok: "Bíráló bizottság tartalék tagjai"
} as const;

// ─── Szereptábla ─────────────────────────────────────────────────────────────

export type CommitteeRole = {
    /** A szerep kulcsa - egyben a szakasz- ÉS a csoportkulcs a lap-leíróban (ld. fenti megjegyzés). */
    key: string;
    /** Egyes számú, rövid megnevezés: chipek, összeférhetetlenségi listák. */
    shortLabel: string;
    /** Az ellenőrző létszám-sorainak megnevezése (a kimenet szó szerinti megtartása miatt külön). */
    countLabel: string;
    /** A szerepben megkövetelt (és egyben legfeljebb megengedett) létszám = arrayMax. */
    max: number;
};

/** A szerepek a lapon megjelenő sorrendben. Az ellenőrző és a bizottsági app palettája is ezt követi. */
export const COMMITTEE_ROLES: CommitteeRole[] = [
    { key: CommitteeRoleKey.biralok, shortLabel: "Bíráló", countLabel: "Bírálók", max: 3 },
    { key: CommitteeRoleKey.tartalekBiralok, shortLabel: "Tartalék bíráló", countLabel: "Tartalék bírálók", max: 3 },
    { key: CommitteeRoleKey.elnok, shortLabel: "Elnök", countLabel: CommitteeRoleKey.elnok, max: 1 },
    { key: CommitteeRoleKey.titkar, shortLabel: "Titkár", countLabel: CommitteeRoleKey.titkar, max: 1 },
    { key: CommitteeRoleKey.tartalekElnok, shortLabel: "Tartalék elnök", countLabel: CommitteeRoleKey.tartalekElnok, max: 1 },
    { key: CommitteeRoleKey.tartalekTitkar, shortLabel: "Tartalék titkár", countLabel: CommitteeRoleKey.tartalekTitkar, max: 1 },
    { key: CommitteeRoleKey.tagok, shortLabel: "Tag", countLabel: CommitteeRoleKey.tagok, max: 5 },
    { key: CommitteeRoleKey.tartalekTagok, shortLabel: "Tartalék tag", countLabel: CommitteeRoleKey.tartalekTagok, max: 5 }
];

export function committeeRole(roleKey: string): CommitteeRole {
    const role = COMMITTEE_ROLES.find((r) => r.key === roleKey);
    if (!role) throw new Error(`Ismeretlen bírálóbizottsági szerep: ${roleKey}`);
    return role;
}

/**
 * Egy szerep tömbjének store-kulcsa. A `pagePrefix` a lapig tartó előtag, azaz
 * "<form>|Bíráló bizottság" - pl. "Előterjesztői|Bíráló bizottság", "Bizottsági|Bíráló bizottság"
 * vagy a bizottsági appban betöltött előterjesztő esetén "Előterjesztő2|Bíráló bizottság".
 * A szakasz- és a csoportkulcs egyaránt a szerep kulcsa (ld. a fájl eleji megjegyzést).
 */
export function committeeArrayKey(pagePrefix: string, roleKey: string): string {
    return `${pagePrefix}|${roleKey}|${roleKey}`;
}

// ─── Mezőleírók ──────────────────────────────────────────────────────────────

export const COMMITTEE_DEGREE_OPTIONS = [
    "PhD",
    "Kandidátus",
    "Tudomány doktora",
    "MTA doktora",
    "MTA levelező tagja",
    "MTA rendes tagja",
    "MTA külső tagja"
];

/** Egy bizottsági tag mezőleírói. Új példányt ad vissza, mert minden csoport sajátot kap. */
export function committeeMemberFields(): FieldDescriptor[] {
    return [
        {
            key: CommitteeFieldKey.mtmtId,
            type: "mtmtUser",
            attribs: { noPrint: true }
        },
        {
            key: CommitteeFieldKey.name,
            type: "text",
            attribs: {
                colWidth: "120"
            }
        },
        {
            key: CommitteeFieldKey.degree,
            label: "Fokozat",
            type: "selectAddOther",
            helpText: "A javasolt személy tudományos fokozata.",
            attribs: {
                type: "fokozat",
                options: COMMITTEE_DEGREE_OPTIONS,
                colWidth: "80"
            }
        },
        {
            key: CommitteeFieldKey.discipline,
            type: "text",
            attribs: {
                colWidth: "*"
            }
        },
        {
            key: CommitteeFieldKey.workplace,
            type: "text",
            attribs: {
                colWidth: "*"
            }
        }
    ];
}

/**
 * Szintetikus csoportleíró egy szerephez, kizárólag store-műveletekhez (append/delete/insert).
 * Azért van rá szükség, mert a lapon lévő CommitteeTable példányok összecsukott szakaszban
 * nincsenek beillesztve a DOM-ba (a Collapsible bezáráskor unmountol), tehát a DnD-kontextusban
 * regisztrált csoportleírókra nem hagyatkozhat az, ami a lap tetejéről nyúl a tömbökhöz
 * (komplett javaslat átvétele, paletta).
 */
export function committeeGroupDescriptor(role: CommitteeRole): GroupDescriptor {
    return {
        key: role.key,
        isArray: true,
        arrayMin: 0,
        arrayMax: role.max,
        fields: committeeMemberFields()
    };
}

// ─── Sorok írása/olvasása ────────────────────────────────────────────────────

export type RowData = {
    mtmtId: string;
    name: string;
    degree: string;
    discipline: string;
    workplace: string;
};

export const EMPTY_ROW: RowData = { mtmtId: "", name: "", degree: "", discipline: "", workplace: "" };

/** Mezőkulcs -> érték leképezés egy sorhoz. */
export function rowToFieldMap(row: RowData): Record<string, string> {
    return {
        [CommitteeFieldKey.mtmtId]: row.mtmtId,
        [CommitteeFieldKey.name]: row.name,
        [CommitteeFieldKey.degree]: row.degree,
        [CommitteeFieldKey.discipline]: row.discipline,
        [CommitteeFieldKey.workplace]: row.workplace
    };
}

export function readCommitteeRow(store: FormStore, arrayKey: string, index: number): RowData {
    const get = (field: string) => store.getArrayItem(`${arrayKey}|${field}`, index);
    return {
        mtmtId: get(CommitteeFieldKey.mtmtId),
        name: get(CommitteeFieldKey.name),
        degree: get(CommitteeFieldKey.degree),
        discipline: get(CommitteeFieldKey.discipline),
        workplace: get(CommitteeFieldKey.workplace)
    };
}

export function writeCommitteeRow(store: FormStore, arrayKey: string, index: number, row: RowData) {
    for (const [field, value] of Object.entries(rowToFieldMap(row))) {
        store.setField(`${arrayKey}[[${index}]]|${field}`, value);
    }
}

export function committeeArrayLength(store: FormStore, arrayKey: string): number {
    return parseInt(store.getField(`${arrayKey}|_length`)) || 0;
}

/** Beszúr egy sort adott indexre, a további elemeket egy hellyel feljebb tolva (a FormStore.deleteFromFormArray inverze). */
export function insertCommitteeRowAt(store: FormStore, group: GroupDescriptor, arrayKey: string, index: number, row: RowData) {
    const lengthKey = `${arrayKey}|_length`;
    const length = committeeArrayLength(store, arrayKey);
    const fieldMap = rowToFieldMap(row);

    const toNotifyKeys: string[] = [lengthKey];
    for (const field of group.fields) {
        for (let i = length; i > index; i--) {
            const key = `${arrayKey}[[${i}]]|${field.key}`;
            const prevKey = `${arrayKey}[[${i - 1}]]|${field.key}`;
            store.data[key] = store.data[prevKey];
            toNotifyKeys.push(key);
        }
        const targetKey = `${arrayKey}[[${index}]]|${field.key}`;
        store.data[targetKey] = fieldMap[field.key] ?? "";
        toNotifyKeys.push(targetKey);
    }
    store.data[lengthKey] = String(length + 1);
    store.notifyListenersForKeys(toNotifyKeys);
}

/** A tömb végére fűz egy sort. */
export function appendCommitteeRow(store: FormStore, group: GroupDescriptor, arrayKey: string, row: RowData) {
    const index = committeeArrayLength(store, arrayKey);
    store.appendToFormArray(group, arrayKey);
    writeCommitteeRow(store, arrayKey, index, row);
}

/** A tömb kiürítése (az utolsó elemtől visszafelé, hogy ne kelljen elemeket csúsztatni). */
export function clearCommitteeArray(store: FormStore, group: GroupDescriptor, arrayKey: string) {
    for (let i = committeeArrayLength(store, arrayKey) - 1; i >= 0; i--) {
        store.deleteFromFormArray(group, arrayKey, i);
    }
}

/**
 * Egy személy azonosítója duplikátumszűréshez: elsősorban az MTMT azonosító, annak hiányában a
 * normalizált (kisbetűs, egyszeres szóközös) név. Üres sorra üres stringet ad.
 */
export function personIdentity(row: RowData): string {
    if (row.mtmtId.trim()) return `mtmt:${row.mtmtId.trim()}`;
    const name = row.name.trim().toLowerCase().replace(/\s+/g, " ");
    return name ? `nev:${name}` : "";
}

// ─── Szakaszleíró ────────────────────────────────────────────────────────────

/**
 * Egy szerep szakaszleírója. A szakasz- és a csoportkulcs egyaránt a szerep kulcsa, a csoport
 * tömbként, a megadott customComponent-tel jelenik meg. A súgószöveget az app adja, mert az
 * előterjesztői ("javaslat") és a bizottsági ("a bizottság javaslata") szövegezés eltér.
 */
export function committeeSection(role: CommitteeRole, helpText: string, tableComponent: GroupDescriptor["customComponent"]): SectionDescriptor {
    return {
        key: role.key,
        helpText,
        groups: [
            {
                key: role.key,
                isArray: true,
                arrayMin: 0,
                arrayMax: role.max,
                customComponent: tableComponent,
                fields: committeeMemberFields()
            }
        ]
    };
}
