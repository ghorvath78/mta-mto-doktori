import type { PageDescriptor } from "@repo/form-engine";

// A benyújtott doktori mű formai alkalmassága (a mentett JSON-ban: "Alkalmasság|Alkalmasság|...").
export const alkalmassag: PageDescriptor = {
    key: "Alkalmasság",
    label: "Formai alkalmasság",
    conditionKey: "__meta|Kérelmezői adatlap betöltve", // = eloterjesztoiform.tsx: APPLICANT_DATA_LOADED_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    sections: [
        {
            key: "A doktori mű",
            helpText:
                "A doktori mű adatai a kérelmezői adatlapból kerülnek átvételre. Az MTA Doktori Szabályzata háromféle lehetőséget sorol fel a doktori műre: értekezés, könyv, vagy rövid értekezés. A benyújtott műnek megvitathatónak és egymagában alkalmasnak kell lennie a kérelmező tudományos eredményeinek megítélésére.",
            groups: [
                {
                    key: "A doktori mű",
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Formája",
                            type: "text",
                            helpText:
                                "A doktori mű formája (pl. értekezés, rövid értekezés, monográfia vagy könyv). Vegye figyelembe, hogy különböző formájú művekre eltérő tudományos minimumkövetelmények vonatkoznak.",
                            valueSource:
                                "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája",
                            readonly: true
                        },
                        {
                            key: "Címe",
                            type: "text",
                            helpText: "A doktori mű címe.",
                            valueSource: "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Címe",
                            readonly: true
                        }
                    ]
                }
            ]
        },
        {
            key: "Alkalmasság",
            label: "A benyújtott doktori mű formai alkalmassága",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            helpText:
                "A formai alkalmasság megállapítása. Az előterjesztőnek véleményt kell alkotnia arról, hogy a benyújtott doktori mű formailag alkalmas-e az elbírálásra. Tartalmi értékelést ebben a szakaszban nem szabad végezni. Amennyiben az előterjesztő a formai alkalmatlanság mellett dönt, kérjük, hogy a nemleges véleményét indokolja is meg a következő mezőben.",
            groups: [
                {
                    key: "Alkalmasság",
                    fields: [
                        {
                            key: "Formai alkalmasság megállapítása",
                            label: "Az előterjesztő véleménye szerint a benyújtott doktori mű formailag alkalmas az elbírálásra",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Alkalmasság indoklása",
                            label: "Nemleges vélemény indoklása",
                            type: "decisionText"
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
