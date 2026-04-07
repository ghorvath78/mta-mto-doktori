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
            helpText:
                "A kérelmezőre vonatkozó kategória és a hozzá tartozó küszöbszámok. A kategóriát az illetékes tudományos bizottság határozza meg. A minimumfeltételeket a kérelmezőnek maradéktalanul teljesítenie kell. Ha az előírt minimumkövetelményekből csak egy is nem teljesül, a doktori habitus nem megfelelő.",
            groups: [
                {
                    key: "A kérelmezőre vonatkozó minimumkövetelmények",
                    fields: [
                        {
                            key: "Kategória",
                            type: "select",
                            helpText: "A kérelmezőre vonatkozó követelménykategória (A, B vagy C), amelyet az illetékes tudományos bizottság határoz meg.",
                            attribs: {
                                options: ["A", "B", "C"]
                            }
                        },
                        {
                            key: "Q küszöbszám",
                            type: "number",
                            helpText: "A publikációs és alkotási teljesítményt mérő Q pontszám minimuma a kérelmező kategóriájában.",
                            readonly: true
                            //noPersist: true
                        },
                        {
                            key: "I küszöbszám",
                            type: "number",
                            helpText: "Az idézettséget mérő I pontszám minimuma a kérelmező kategóriájában.",
                            readonly: true
                            //noPersist: true
                        },
                        {
                            key: "Tud. köz. szempontok",
                            type: "number",
                            helpText:
                                "A tudományos közéleti tevékenység értékelésénél megkövetelt minimális területek száma (alapesetben 5, rövid értekezésnél 6).",
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
            helpText:
                "A publikációs teljesítményt mérő Q pontszám az MTMT adataiból kerül kiszámításra. A Q pontszámot növelik a kérelmező által megadott maximum 5 jelentős műszaki alkotásból származó pontok. Alkotásonként maximum 1 pont adható, a konkrét értéket befolyásolja a társalkotók száma és az alkotás színvonala.",
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
                                "A kérelmező által megadott műszaki alkotás megnevezése. Csak kiemelkedő megvalósult műszaki alkotásra adható pont: vagy beszámolt az alkotásban megvalósult tudományos eredményről legalább egy lektorált folyóiratcikkben, melyre legalább két komoly hivatkozást is kapott, vagy megvalósított szabadalom fűződik hozzá.",
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
                            helpText: "A műszaki alkotáshoz kapcsolódó szabadalom MTMT azonosítója a kérelmezői adatlapból.",
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
                            helpText: "A műszaki alkotáshoz kapcsolódó publikáció MTMT azonosítója a kérelmezői adatlapból.",
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
                            helpText: "A kérelmező által megadott hivatkozás linkje a műszaki alkotásra, amennyiben az nem szerepel az MTMT-ben.",
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
                            helpText: "A kérelmező által megadott társalkotók listája.",
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
                            helpText: "A kérelmező által megadott minősítés (pl. nívódíj, nemzetközi elismerés).",
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
                            helpText: "Az építészeti alkotáshoz kapcsolódó publikáció MTMT azonosítója a kérelmezői adatlapból.",
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
                            helpText: "A kérelmező által megadott hivatkozás linkje az építészeti alkotásra, amennyiben az nem szerepel az MTMT-ben.",
                            attribs: {
                                noPrint: true,
                                short: true
                            }
                        },
                        {
                            key: "Pontszám",
                            type: "number",
                            helpText:
                                "Az előterjesztő által javasolt pontszám a műszaki alkotásra. Alkotásonként maximum 1 pont adható, a konkrét értéket befolyásolja a társalkotók száma és az alkotás színvonala.",
                            attribs: {
                                fractional: true,
                                colWidth: "50",
                                important: true,
                                maxValue: 1
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
            helpText:
                "A kérelmező idézettségét mérő mutatók az MTMT-ből kerülnek átvételre. Az I-szám a független hivatkozások számából számított mutató, amely a kérelmező tudományos munkásságának nemzetközi visszhangját tükrözi.",
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
                            helpText: "A kérelmező idézettségét mérő I-szám, amely az MTMT-ben rögzített független hivatkozásokból kerül kiszámításra.",
                            attribs: {
                                readonly: true
                            }
                        },
                        {
                            key: "WoS idézők száma",
                            type: "number",
                            helpText: "A kérelmező Web of Science (WoS) szerinti független hivatkozásainak száma.",
                            attribs: {
                                readonly: true
                            }
                        },
                        {
                            key: "H-index",
                            type: "number",
                            helpText: "A kérelmező Hirsch-indexe az MTMT adatai alapján.",
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
            helpText:
                "A tételes publikációs elvárások a kérelmező kategóriájához tartozó, egyenként ellenőrizendő publikációs követelményeket tartalmazzák. Ezek teljesülését az MTMT-ből kinyert adatok alapján kell ellenőrizni.",
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
            helpText:
                "Az előterjesztő szöveges értékelése a kérelmező publikációs tevékenységéről. Térjen ki arra, hogy mennyire jellemző a rangos, a szakterületen elfogadott kiadóknál történő publikálás, kerüli-e a kérelmező a kifogásolható gyakorlatot folytató fórumokon történő publikálást. Általában a kevesebb, de színvonalas publikáció kedvezőbb elbírálás alá esik, mint a gyenge minőségű publikációkkal felhígított publikációs lista.",
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
