import type { PageDescriptor } from "@repo/form-engine";
import { SciScoringTable } from "./customgroups/sciscoringtable";
import { WorksScoringTable } from "./customgroups/worksscoringtable";
import { QScoreSummary } from "./customgroups/qscoresummary";
import { ItemizedRequirements } from "./customgroups/itemizedrequirements";
import { ShortThesisRequirements } from "./customgroups/shortthesisrequirements";
import { nominatorOpinionsGroup, bizottsagiOpinionGroup } from "./evaluationgroups";
import "./customgroups/iscoresummary";

export const tudomanymetria: PageDescriptor = {
    key: "Tudományos minimumkövetelmények",
    label: "Tudománymetria",
    conditionKey: "__meta|Legalább 2 előterjesztő betöltve", // = bizottsagiform.tsx: NOMINATORS_LOADED_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    sections: [
        {
            key: "A kérelmezőre vonatkozó minimumkövetelmények",
            helpText:
                "A kérelmezőre vonatkozó kategória és a hozzá tartozó küszöbszámok. A kategóriát az illetékes tudományos bizottság határozza meg. A minimumfeltételeket a kérelmezőnek maradéktalanul teljesítenie kell.",
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
                            readonly: true
                        },
                        {
                            key: "I küszöbszám",
                            type: "number",
                            readonly: true
                        }
                    ]
                }
            ]
        },
        {
            key: "Q-szám",
            label: "Q-szám: A kérelmező publikációs és alkotási teljesítménye",
            helpText:
                "A publikációs teljesítményt mérő Q pontszám az MTMT adataiból kerül kiszámításra. A műszaki alkotásokra minden betöltött előterjesztő adott pontszámot; a bizottság ez alapján állapítja meg a saját pontszámát.",
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
                    customComponent: WorksScoringTable,
                    fields: [
                        {
                            key: "Bizottsági pontszám",
                            type: "number",
                            attribs: {
                                fractional: true,
                                maxValue: 1,
                                important: true
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
                            readonly: true
                        },
                        {
                            key: "I-szám",
                            type: "number",
                            readonly: true
                        },
                        {
                            key: "WoS idézők száma",
                            type: "number",
                            readonly: true
                        },
                        {
                            key: "H-index",
                            type: "number",
                            readonly: true
                        },
                        {
                            key: "Összegzés",
                            type: "iScoreSummary",
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
            helpText: "A betöltött előterjesztők véleménye a kérelmező publikációs tevékenységéről, valamint a bizottság saját értékelése.",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                nominatorOpinionsGroup({
                    key: "Előterjesztők véleménye",
                    textPath:
                        "Tudományos minimumkövetelmények|Publikációs teljesítmény értékelése|Publikációs teljesítmény értékelése|Szöveges értékelés"
                }),
                bizottsagiOpinionGroup({
                    key: "Bizottsági értékelés",
                    yesNoLabel: "A bizottság megítélése szerint a kérelmező publikációs teljesítménye megfelel a követelményeknek",
                    textLabel: "A bizottsági vélemény szöveges indoklása legfeljebb 1500 karakterben"
                })
            ]
        },
        {
            key: "Rövid értekezésre vonatkozó minimumkövetelmények",
            conditionKey: "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája",
            conditionValue: "rövid értekezés",
            groups: [
                {
                    key: "Táblázat",
                    customComponent: ShortThesisRequirements,
                    noPersist: true,
                    fields: []
                }
            ]
        },
        {
            key: "Rövid értekezésre vonatkozó értékelés",
            conditionKey: "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája",
            conditionValue: "rövid értekezés",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                nominatorOpinionsGroup({
                    key: "Előterjesztők véleménye",
                    textPath:
                        "Tudományos minimumkövetelmények|Rövid értekezésre vonatkozó értékelés|Rövid értekezésre vonatkozó értékelés|Szöveges értékelés"
                }),
                bizottsagiOpinionGroup({
                    key: "Bizottsági értékelés",
                    yesNoLabel: "A bizottság megítélése szerint a kérelmező teljesíti a rövid értekezésre vonatkozó minimumkövetelményeket",
                    textLabel: "A bizottsági vélemény szöveges indoklása legfeljebb 1500 karakterben"
                })
            ]
        }
    ]
};
