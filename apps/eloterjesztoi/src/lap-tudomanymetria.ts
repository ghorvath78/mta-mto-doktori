import type { PageDescriptor } from "@repo/form-engine";
import { applicantDataLoaded } from "./atoms";
import { SciScoringTable } from "./customgroups/sciscoringtable";
import { QScoreSummary } from "./customgroups/qscoresummary";
import { IScoreSummary } from "./customgroups/iscoresummary";
import { ItemizedRequirements } from "./customgroups/Itemizedrequirements";

export const tudomanymetria: PageDescriptor = {
    key: "Tudományos minimumkövetelmények",
    enabledAtom: applicantDataLoaded,
    sections: [
        {
            key: "A kérelmezőre vonatkozó minimumkövetelmények",
            groups: [
                {
                    key: "A kérelmezőre vonatkozó minimumkövetelmények",
                    fields: [
                        {
                            key: "Kategória",
                            type: "select",
                            attribs: {
                                options: ["A", "B", "C"]
                            }
                        },
                        {
                            key: "Q küszöbszám",
                            type: "number",
                            readonly: true
                            //noPersist: true
                        },
                        {
                            key: "I küszöbszám",
                            type: "number",
                            readonly: true
                            //noPersist: true
                        },
                        {
                            key: "Tud. köz. szempontok",
                            type: "number",
                            readonly: true
                            //noPersist: true
                        }
                    ]
                }
            ]
        },
        {
            key: "Q-szám",
            label: "Q-szám: A kérelmező publikációs és alkotási teljesítménye",
            groups: [
                {
                    key: "A kérelmező publikációs teljesítménye",
                    label: "A kérelmező publikációs teljesítménye",
                    customComponent: SciScoringTable,
                    noPersist: true,
                    fields: []
                },
                {
                    key: "A kérelmező alkotási teljesítménye",
                    label: "A kérelmező alkotási teljesítménye",
                    isArray: true,
                    lengthSource: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|_length",
                    readonly: true,
                    attribs: {
                        pdfTabular: true
                    },
                    fields: [
                        {
                            key: "Műszaki alkotás megnevezése",
                            type: "text",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás megnevezése",
                            helpText:
                                "A műszaki alkotás megnevezése. Csak kiemelkedő megvalósult műszaki alkotásra adható pont. Ezek jellemzője az, hogy vagy beszámolt az alkotásban megvalósult tudományos eredményről legalább egy lektorált folyóiratcikkben, melyre legalább két komoly hivatkozást is kapott, vagy megvalósított szabadalom fűződik hozzá. Szóközökkel együtt legfeljebb 750 karakter terjedelemben.",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Műszaki alkotás típusa",
                            type: "text",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            helpText: "A műszaki alkotás típusa (pl. szabadalom, építészeti alkotás, egyéb).",
                            attribs: {
                                colWidth: "75"
                            }
                        },
                        {
                            key: "Kapcsolódó szabadalom",
                            type: "mtmtPub",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "szabadalom",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Kapcsolódó szabadalom",
                            helpText:
                                'A műszaki alkotáshoz kapcsolódó szabadalom MTMT azonosítója. A listában csak a "Fő adatok" szekcióban megadott MTMT azonosítóhoz tartozó közlemények választhatók.',
                            attribs: {
                                noPrint: true
                            }
                        },
                        {
                            key: "Kapcsolódó publikáció",
                            type: "mtmtPub",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "egyéb alkotás",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Kapcsolódó publikáció",
                            helpText:
                                'A műszaki alkotáshoz kapcsolódó publikáció MTMT azonosítója. A listában csak a "Fő adatok" szekcióban megadott MTMT azonosítóhoz tartozó közlemények választhatók.',
                            attribs: {
                                unique: true,
                                noPrint: true
                            }
                        },
                        {
                            key: "1. legfontosabb hivatkozás",
                            type: "mtmtCitation",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "egyéb alkotás",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|1. legfontosabb hivatkozás",
                            helpText: "A műszaki alkotáshoz kapcsolódó szabadalom vagy publikáció első legfontosabb hivatkozásának MTMT azonosítója.",
                            attribs: {
                                pubKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Kapcsolódó publikáció",
                                noPrint: true
                            }
                        },
                        {
                            key: "2. legfontosabb hivatkozás",
                            type: "mtmtCitation",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "egyéb alkotás",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|2. legfontosabb hivatkozás",
                            helpText: "A műszaki alkotáshoz kapcsolódó szabadalom vagy publikáció második legfontosabb hivatkozásának MTMT azonosítója.",
                            attribs: {
                                pubKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Kapcsolódó publikáció",
                                noPrint: true
                            }
                        },
                        {
                            key: "Egyéb alkotásra hivatkozás linkje",
                            type: "link",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "egyéb alkotás",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Egyéb alkotásra hivatkozás linkje",
                            helpText:
                                "Adja meg a műszaki alkotásra vonatkozó hivatkozás linkjét, ha nincsen az MTMT-ben. A mező végén az ikonra kattintva ellenőrizheti, hogy helyesen adta-e meg a linket.",
                            attribs: {
                                noPrint: true,
                                short: true
                            }
                        },
                        {
                            key: "Társalkotók",
                            type: "text",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "építészeti alkotás",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Társalkotók",
                            helpText: "Az építészeti alkotás társalkotóinak felsorolása, vesszővel elválasztva.",
                            attribs: {
                                noPrint: true
                            }
                        },
                        {
                            key: "Alkotás minősítése",
                            type: "text",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "építészeti alkotás",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Alkotás minősítése",
                            helpText: "Az építészeti alkotás minősítésének megadása (pl. nívódíj, nemzetközi elismerés).",
                            attribs: {
                                noPrint: true
                            }
                        },
                        {
                            key: "Alkotás MTMT azonosítója",
                            type: "mtmtPub",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "építészeti alkotás",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Alkotás MTMT azonosítója",
                            helpText:
                                'Az építészeti alkotáshoz kapcsolódó publikáció MTMT azonosítója. A listában csak a "Fő adatok" szekcióban megadott MTMT azonosítóhoz tartozó közlemények választhatók.',
                            attribs: {
                                noPrint: true
                            }
                        },
                        {
                            key: "Építészeti alkotásra hivatkozás linkje",
                            type: "link",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "építészeti alkotás",
                            readonly: true,
                            noPersist: true,
                            valueSource:
                                "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Építészeti alkotásra hivatkozás linkje",
                            helpText:
                                "Adja meg az építészeti alkotásra vonatkozó hivatkozás linkjét, ha nincsen az MTMT-ben. A mező végén az ikonra kattintva ellenőrizheti, hogy helyesen adta-e meg a linket.",
                            attribs: {
                                noPrint: true,
                                short: true
                            }
                        },
                        {
                            key: "Pontszám",
                            type: "number",
                            helpText: "A műszaki alkotásra megítélt pontszám.",
                            attribs: {
                                fractional: true,
                                colWidth: "50"
                            }
                        }
                    ]
                },
                {
                    key: "Összesítés",
                    label: "Q-szám összesítő",
                    customComponent: QScoreSummary,
                    noPersist: true,
                    fields: []
                }
            ]
        },
        {
            key: "I-szám",
            label: "I-szám: A kérelmező idézettsége",
            groups: [
                {
                    key: "I-szám",
                    fields: [
                        {
                            key: "Független idézők száma",
                            type: "number",
                            helpText: "A kérelmező független idézőinek száma (összes, egyéb típusúakkal együtt).",
                            attribs: {
                                readonly: true
                            }
                        },
                        {
                            key: "I-szám",
                            type: "number",
                            attribs: {
                                readonly: true
                            }
                        },
                        {
                            key: "WoS idézők száma",
                            type: "number",
                            attribs: {
                                readonly: true
                            }
                        },
                        {
                            key: "H-index",
                            type: "number",
                            attribs: {
                                readonly: true
                            }
                        },
                        {
                            key: "Összegzés",
                            type: "custom",
                            customComponent: IScoreSummary,
                            noPersist: true
                        }
                    ]
                }
            ]
        },
        {
            key: "Tételes publikációs elvárások",
            groups: [
                {
                    key: "Táblázat",
                    customComponent: ItemizedRequirements,
                    noPersist: true,
                    fields: []
                }
            ]
        },
        {
            key: "Publikációs teljesítmény értékelése",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Publikációs teljesítmény értékelése",
                    fields: [
                        {
                            key: "Szöveges értékelés",
                            label: "Értékelje a pályázó tudományos teljesítmény minőségét az összes publikációja alapján",
                            type: "decisionText",
                            attribs: {
                                maxLength: 1500,
                                rows: 6
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
                }
            ]
        }
    ]
};
