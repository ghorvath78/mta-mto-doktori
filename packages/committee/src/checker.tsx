import { useState } from "react";
import { type FormStore, type GroupDescriptor, useValueStore } from "@repo/form-engine";
import { Button } from "@repo/ui";
import { COMMITTEE_ROLES, CommitteeFieldKey, CommitteeRoleKey, committeeArrayKey, committeeArrayLength } from "./roles";

// ─── Committee Checker ───────────────────────────────────────────────────────

const MTA_DEGREES = new Set(["MTA doktora", "MTA rendes tagja", "MTA levelező tagja"]);
const PHD_DEGREES = new Set(["PhD", "Kandidátus"]);
const VALID_DEGREES = new Set([...PHD_DEGREES, "Tudomány doktora", ...MTA_DEGREES, "MTA külső tagja"]);

/**
 * Az ellenőrzés app-specifikus adatforrásai: a kérelmező MTMT-ből származó intézményei, illetve
 * egy adott személy és a kérelmező közös publikációi. Mindkettő az adott app MTMT-gyorsítótárából
 * jön (előterjesztői: a saját betöltött adat, bizottsági: a kanonikus előterjesztő PDF-jéből
 * származó gyorsítótár), ezért a lap-leíró adja meg a csoport attribs-ában:
 *   attribs: { checkerDeps: { getApplicantAffiliations, getCommonPubsWithApplicant } }
 */
export type CommitteeCheckerDeps = {
    getApplicantAffiliations: () => string[];
    getCommonPubsWithApplicant: (mtmtId: string) => string[];
};

function grpDegrees(store: FormStore, key: string): string[] {
    return store.getArray(`${key}|${CommitteeFieldKey.degree}`);
}

function grpNames(store: FormStore, key: string): string[] {
    return store.getArray(`${key}|${CommitteeFieldKey.name}`);
}

function grpWorkplaces(store: FormStore, key: string): string[] {
    return store.getArray(`${key}|${CommitteeFieldKey.workplace}`);
}

function grpMtmtIds(store: FormStore, key: string): string[] {
    return store.getArray(`${key}|${CommitteeFieldKey.mtmtId}`);
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

export const CommitteeChecker = ({ group, keyPrefix }: { group: GroupDescriptor; keyPrefix: string; index: number }) => {
    const store = useValueStore();
    const [lines, setLines] = useState<CheckLine[]>([]);
    const deps = group.attribs?.checkerDeps as CommitteeCheckerDeps | undefined;
    // keyPrefix is e.g. "formName|Bíráló bizottság|Ellenőrzés"
    // sibling group keys live one level up: "formName|Bíráló bizottság|<groupKey>"
    const sectionPrefix = keyPrefix.substring(0, keyPrefix.lastIndexOf("|"));
    const pagePrefix = sectionPrefix.substring(0, sectionPrefix.lastIndexOf("|"));
    const grp = (roleKey: string) => committeeArrayKey(pagePrefix, roleKey);

    const runChecks = async () => {
        const result: CheckLine[] = [];
        // ── Count checks ──────────────────────────────────────────────────────
        result.push({ text: "── Létszámok ──", status: "" });
        for (const role of COMMITTEE_ROLES) {
            const key = grp(role.key);
            const label = role.countLabel;
            const expected = role.max;
            const n = committeeArrayLength(store, key);
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
        const biralokDeg = grpDegrees(store, grp(CommitteeRoleKey.biralok));
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
        const tarBiralokDeg = grpDegrees(store, grp(CommitteeRoleKey.tartalekBiralok));
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
        for (const roleKey of [CommitteeRoleKey.elnok, CommitteeRoleKey.tartalekElnok]) {
            const key = grp(roleKey);
            const label = roleKey;
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
        for (const roleKey of [CommitteeRoleKey.titkar, CommitteeRoleKey.tartalekTitkar]) {
            const key = grp(roleKey);
            const label = roleKey;
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
        const tagokDeg = grpDegrees(store, grp(CommitteeRoleKey.tagok));
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
        const applicantAffiliations = deps?.getApplicantAffiliations() ?? [];
        if (applicantAffiliations.length === 0) {
            result.push({ text: "A kérelmező intézményi adatai nem elérhetők, az összeférhetetlenségi ellenőrzés nem végezhető el.", status: "warn" });
        } else {
            let anyOverlap = false;
            for (const role of COMMITTEE_ROLES) {
                const key = grp(role.key);
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
        if (!deps) {
            result.push({ text: "A kérelmező publikációs adatai nem elérhetők, a közös publikációk ellenőrzése nem végezhető el.", status: "warn" });
        } else {
            for (const role of COMMITTEE_ROLES) {
                const key = grp(role.key);
                const names = grpNames(store, key);
                const memberMtmtIds = grpMtmtIds(store, key);
                for (let i = 0; i < names.length; i++) {
                    const memberName = names[i] || `(${i + 1}. tag)`;
                    const memberMtmtId = memberMtmtIds[i];
                    if (!memberMtmtId) {
                        result.push({ text: `${memberName} — nincs MTMT azonosító megadva`, status: "warn" });
                        continue;
                    }
                    const commonPubs = deps.getCommonPubsWithApplicant(memberMtmtId);
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
