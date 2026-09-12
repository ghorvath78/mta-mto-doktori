import type { FieldDescriptor, GroupDescriptor, PageDescriptor } from "@repo/form-engine";
import { PublicActivitySummary } from "./customgroups/publicactivitysummary";
import { nominatorOpinionsGroup, bizottsagiOpinionGroup } from "./evaluationgroups";

const KOZELETI_PREFIX = "Kérelmezői|Tudományos közéleti tevékenység";
const ELOTERJESZTOI_KOZELETI_PREFIX = "Tudományos közéleti tevékenység";

function listGroup(sectionKey: string, fields: FieldDescriptor[]): GroupDescriptor {
    const base = `${KOZELETI_PREFIX}|${sectionKey}|Lista`;
    return {
        key: "Lista",
        isArray: true,
        lengthSource: `${base}|_length`,
        valueSource: base,
        readonly: true,
        noPersist: true,
        attribs: {
            printTabular: true
        },
        fields
    };
}

function linkGroup(sectionKey: string, fieldKey: string = "Igazoló link"): GroupDescriptor {
    return {
        key: "Link",
        readonly: true,
        noPersist: true,
        conditionKey: `${KOZELETI_PREFIX}|${sectionKey}|Lista|_length`,
        conditionValue: ">=1",
        fields: [
            {
                key: fieldKey,
                type: "link",
                readonly: true,
                noPersist: true,
                valueSource: `${KOZELETI_PREFIX}|${sectionKey}|Link|${fieldKey}`,
                attribs: {
                    noAlign: true,
                    short: true
                }
            }
        ]
    };
}

function evaluationGroups(sectionKey: string, opts?: { conditionOnList?: boolean }): GroupDescriptor[] {
    const conditioned = opts?.conditionOnList !== false;
    const conditionKey = conditioned ? `${KOZELETI_PREFIX}|${sectionKey}|Lista|_length` : undefined;
    const conditionValue = conditioned ? ">=1" : undefined;

    return [
        {
            ...nominatorOpinionsGroup({
                key: "Előterjesztők véleménye",
                yesNoPath: `${ELOTERJESZTOI_KOZELETI_PREFIX}|${sectionKey}|Értékelés|Követelmény teljesül`,
                textPath: `${ELOTERJESZTOI_KOZELETI_PREFIX}|${sectionKey}|Értékelés|Indoklás`
            }),
            conditionKey,
            conditionValue
        },
        {
            ...bizottsagiOpinionGroup({
                key: "Bizottsági értékelés",
                yesNoLabel: "A kérelmező a szempontnak megfelel",
                textLabel: "A bizottsági vélemény indoklása legfeljebb 750 karakterben",
                maxLength: 750,
                rows: 3
            }),
            conditionKey,
            conditionValue
        }
    ];
}

export const kozeletiTevekenyseg: PageDescriptor = {
    key: "Tudományos közéleti tevékenység",
    label: "Közéleti tevékenység",
    conditionKey: "__meta|Habitusvizsgálat lefolytatható", // = bizottsagiform.tsx: HABITUSVIZSGALAT_LEFOLYTATHATO_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    sections: [
        {
            key: "TDK témavezetés",
            label: "TDK-téma vezetése (OTDK helyezés és különdíj)",
            groups: [
                listGroup("TDK témavezetés", [
                    { key: "Hallgató neve", type: "text", attribs: { colWidth: "*" } },
                    { key: "OTDK éve", type: "year", attribs: { colWidth: "40" } },
                    { key: "OTDK szekció", type: "text", attribs: { colWidth: "*" } },
                    { key: "Helyezés", type: "text", attribs: { colWidth: "50" } },
                    { key: "Igazoló link", type: "link", attribs: { colWidth: "40" } }
                ]),
                {
                    key: "Összesítés",
                    label: "OTDK-n díjazott dolgozatok száma összesen:",
                    conditionKey: `${KOZELETI_PREFIX}|TDK témavezetés|Lista|_length`,
                    conditionValue: ">=1",
                    readonly: true,
                    noPersist: true,
                    fields: (["I. díjas", "II. díjas", "III. díjas", "Különdíjas"] as const).map((key) => ({
                        key,
                        type: "number",
                        readonly: true,
                        noPersist: true,
                        valueSource: `${KOZELETI_PREFIX}|TDK témavezetés|Összesítés|${key}`
                    }))
                },
                ...evaluationGroups("TDK témavezetés")
            ]
        },
        {
            key: "Részvétel graduális és doktori képzésben",
            label: "Részvétel graduális és doktori képzésben (tárgyelőadó, tárgyfelelős)",
            groups: [
                listGroup("Részvétel graduális és doktori képzésben", [
                    { key: "Intézmény és szervezeti egység", type: "text", attribs: { colWidth: "*" } },
                    { key: "Tantárgy neve", type: "text", attribs: { colWidth: "*" } },
                    { key: "Oktatói munka jellege", type: "text", attribs: { colWidth: "80" } },
                    { key: "Képzési szint", type: "text", attribs: { colWidth: "60" } },
                    { key: "Időszak", type: "yearRange", attribs: { colWidth: "55" } }
                ]),
                linkGroup("Részvétel graduális és doktori képzésben"),
                ...evaluationGroups("Részvétel graduális és doktori képzésben")
            ]
        },
        {
            key: "Doktori fokozatot szerzett hallgatók",
            label: "Részvétel doktori témavezetésben (fokozatot szerzett hallgatók)",
            groups: [
                listGroup("Doktori fokozatot szerzett hallgatók", [
                    { key: "Hallgató neve", type: "text", attribs: { colWidth: "*" } },
                    { key: "Témavezetés", type: "text", attribs: { colWidth: "*" } },
                    { key: "Doktori iskola", type: "text", attribs: { colWidth: "*" } },
                    { key: "Fokozatszerzés éve", type: "year", attribs: { colWidth: "80" } },
                    { key: "Igazoló link", type: "link", attribs: { colWidth: "40" } }
                ]),
                {
                    key: "Összes",
                    conditionKey: `${KOZELETI_PREFIX}|Doktori fokozatot szerzett hallgatók|Lista|_length`,
                    conditionValue: ">=1",
                    fields: [
                        {
                            key: "Fokozatott szerzett doktoranduszok száma",
                            label: "Összes fokozatott szerzett doktoranduszok száma (témavezetői arányokkal súlyozva)",
                            valueSource: `${KOZELETI_PREFIX}|Doktori fokozatot szerzett hallgatók|Összes|Fokozatott szerzett doktoranduszok száma`,
                            type: "number",
                            readonly: true,
                            noPersist: true,
                            attribs: {
                                fractional: true,
                                noAlign: true
                            }
                        }
                    ]
                },
                ...evaluationGroups("Doktori fokozatot szerzett hallgatók")
            ]
        },
        {
            key: "Részvétel tudományos zsűriben, kuratóriumban, bírálatokban",
            groups: [
                listGroup("Részvétel tudományos zsűriben, kuratóriumban, bírálatokban", [
                    { key: "A testület megnevezése", type: "text", attribs: { colWidth: "*" } },
                    { key: "Hazai/nemzetközi", type: "text", attribs: { colWidth: "60" } },
                    { key: "Részvételi szerep", type: "text", attribs: { colWidth: "*" } },
                    { key: "Időszak", type: "text", attribs: { colWidth: "80" } }
                ]),
                linkGroup("Részvétel tudományos zsűriben, kuratóriumban, bírálatokban"),
                ...evaluationGroups("Részvétel tudományos zsűriben, kuratóriumban, bírálatokban")
            ]
        },
        {
            key: "Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében",
            label: "Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében, plenáris előadások",
            groups: [
                listGroup("Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében", [
                    { key: "A rendezvény pontos címe és ideje", type: "text", attribs: { colWidth: "*" } },
                    { key: "A rendező ország", type: "text", attribs: { colWidth: "80" } },
                    { key: "Szervezői/előadói szerep leírása", type: "text", attribs: { colWidth: "100" } },
                    { key: "Igazoló link", type: "link", attribs: { colWidth: "60", short: true } }
                ]),
                ...evaluationGroups("Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében")
            ]
        },
        {
            key: "Tisztség, kiemelt/választott tagság tudományos szervezetben",
            label: "Tisztség, kiemelt/választott tagság hazai és/vagy nemzetközi tudományos szervezetben",
            groups: [
                listGroup("Tisztség, kiemelt/választott tagság tudományos szervezetben", [
                    { key: "A szervezet neve", type: "text", attribs: { colWidth: "*" } },
                    { key: "A szervezet weboldala", label: "Szervezet weboldala", type: "link", attribs: { colWidth: "60" } },
                    { key: "Hazai/nemzetközi", type: "text", attribs: { colWidth: "60" } },
                    { key: "Tisztsége", type: "text", attribs: { colWidth: "90" } },
                    { key: "Tisztség időszaka", type: "text", attribs: { colWidth: "80" } }
                ]),
                linkGroup("Tisztség, kiemelt/választott tagság tudományos szervezetben"),
                ...evaluationGroups("Tisztség, kiemelt/választott tagság tudományos szervezetben")
            ]
        },
        {
            key: "Folyóirat-szerkesztőbizottsági tagság legalább 2 évig",
            groups: [
                listGroup("Folyóirat-szerkesztőbizottsági tagság legalább 2 évig", [
                    { key: "A folyóirat neve", type: "text", attribs: { colWidth: "*" } },
                    { key: "A folyóirat weboldala", type: "link", attribs: { colWidth: "60" } },
                    { key: "Besorolás", type: "text", attribs: { colWidth: "60" } },
                    { key: "Tisztsége", type: "text", attribs: { colWidth: "90" } },
                    { key: "Időszak", type: "yearRange", attribs: { colWidth: "80" } },
                    { key: "Igazoló link", type: "link", attribs: { colWidth: "40" } }
                ]),
                ...evaluationGroups("Folyóirat-szerkesztőbizottsági tagság legalább 2 évig")
            ]
        },
        {
            key: "Részvétel tudományos minősítésben",
            label: "Részvétel tudományos minősítésben (bíráló, bírálóbizottsági titkár)",
            groups: [
                {
                    key: "Összesítés",
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "MTA doktora értekezés bírálója",
                            type: "number",
                            readonly: true,
                            noPersist: true,
                            valueSource: `${KOZELETI_PREFIX}|Részvétel tudományos minősítésben|Összesítés|MTA doktora értekezés bírálója`
                        },
                        {
                            key: "MTA doktori bírálóbizottság titkára",
                            type: "number",
                            readonly: true,
                            noPersist: true,
                            valueSource: `${KOZELETI_PREFIX}|Részvétel tudományos minősítésben|Összesítés|MTA doktori bírálóbizottság titkára`
                        },
                        {
                            key: "PhD vagy kandidátusi értekezés bírálója",
                            type: "number",
                            readonly: true,
                            noPersist: true,
                            valueSource: `${KOZELETI_PREFIX}|Részvétel tudományos minősítésben|Összesítés|PhD vagy kandidátusi értekezés bírálója`
                        },
                        {
                            key: "PhD bírálóbizottság titkára",
                            type: "number",
                            readonly: true,
                            noPersist: true,
                            valueSource: `${KOZELETI_PREFIX}|Részvétel tudományos minősítésben|Összesítés|PhD bírálóbizottság titkára`
                        },
                        {
                            key: "Igazoló link",
                            type: "link",
                            readonly: true,
                            noPersist: true,
                            valueSource: `${KOZELETI_PREFIX}|Részvétel tudományos minősítésben|Összesítés|Igazoló link`,
                            attribs: { short: true }
                        }
                    ]
                },
                ...evaluationGroups("Részvétel tudományos minősítésben", { conditionOnList: false })
            ]
        },
        {
            key: "Elnyert tudományos pályázat",
            groups: [
                listGroup("Elnyert tudományos pályázat", [
                    { key: "A pályázat címe", type: "text", attribs: { colWidth: "*" } },
                    { key: "Támogatási összeg", type: "text", attribs: { colWidth: "70" } },
                    { key: "Hazai/nemzetközi", type: "text", attribs: { colWidth: "60" } },
                    { key: "Funkció", type: "text", attribs: { colWidth: "60" } },
                    { key: "Futamidő", type: "text", attribs: { colWidth: "80" } }
                ]),
                linkGroup("Elnyert tudományos pályázat"),
                ...evaluationGroups("Elnyert tudományos pályázat")
            ]
        },
        {
            key: "Külföldi tartózkodás",
            label: "Külföldi szakmai munka",
            groups: [
                listGroup("Külföldi tartózkodás", [
                    { key: "A meghívó neve, helyszín", type: "text", attribs: { colWidth: "*" } },
                    { key: "A tartózkodás jellege", type: "text", attribs: { colWidth: "90" } },
                    { key: "Finanszírozás forrása", type: "text", attribs: { colWidth: "90" } },
                    { key: "Mettől-meddig", type: "text", attribs: { colWidth: "90" } }
                ]),
                linkGroup("Külföldi tartózkodás"),
                ...evaluationGroups("Külföldi tartózkodás")
            ]
        },
        {
            key: "Állami vagy MTA által adományozott tudományos díj, kitüntetés",
            groups: [
                listGroup("Állami vagy MTA által adományozott tudományos díj, kitüntetés", [
                    { key: "Kitüntetés megnevezése", type: "text", attribs: { colWidth: "*" } },
                    { key: "Adományozó szervezet", type: "text", attribs: { colWidth: "*" } },
                    { key: "Ország", type: "text", attribs: { colWidth: "90" } },
                    { key: "Adományozás időpontja", type: "text", attribs: { colWidth: "90" } }
                ]),
                linkGroup("Állami vagy MTA által adományozott tudományos díj, kitüntetés"),
                ...evaluationGroups("Állami vagy MTA által adományozott tudományos díj, kitüntetés")
            ]
        },
        {
            key: "Tudományos közéleti tevékenység értékelése",
            helpText:
                "A közéleti tevékenység pozitív megítéléséhez a 11 terület közül legalább 5-ben kell értékelhető tevékenységet felmutatni.",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Összesítés",
                    noPersist: true,
                    customComponent: PublicActivitySummary,
                    fields: []
                },
                nominatorOpinionsGroup({
                    key: "Előterjesztők véleménye",
                    yesNoPath: `${ELOTERJESZTOI_KOZELETI_PREFIX}|Tudományos közéleti tevékenység értékelése|Értékelés|Követelmény teljesül`,
                    textPath: `${ELOTERJESZTOI_KOZELETI_PREFIX}|Tudományos közéleti tevékenység értékelése|Értékelés|Indoklás`
                }),
                bizottsagiOpinionGroup({
                    key: "Bizottsági értékelés",
                    yesNoLabel: "A bizottság megítélése szerint a kérelmező a közéleti tevékenységre vonatkozó követelménynek megfelel",
                    textLabel: "A bizottsági vélemény indoklása legfeljebb 1500 karakterben"
                })
            ]
        }
    ]
};
