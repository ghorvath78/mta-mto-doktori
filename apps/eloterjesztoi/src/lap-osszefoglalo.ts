import type { PageDescriptor } from "@repo/form-engine";

export const osszefoglalo: PageDescriptor = {
    key: "Összefoglaló javaslat",
    label: "Javaslat",
    conditionKey: "__meta|Kérelmezői adatlap betöltve", // = eloterjesztoiform.tsx: APPLICANT_DATA_LOADED_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    sections: [
        {
            key: "Összefoglaló javaslat",
            label: "Összefoglaló javaslat: A kérelmező doktori habitusának megítélése",
            helpText:
                "Az előterjesztő összefoglaló véleménye a kérelmező doktori habitusáról, figyelembe véve tudományos eredményeit, publikációs és alkotási tevékenységét, tudományos tevékenységének visszhangját, tudományos közéleti munkásságát és a minimumkövetelmények teljesülését. A véleményt konkrét érvekkel és példákkal kell alátámasztani.",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Összefoglaló javaslat",
                    fields: [
                        {
                            key: "Javaslat",
                            label: "Az előterjesztő a doktori értekezés bírálatra bocsátását javasolja",
                            type: "decisionYesNo"
                        },
                        {
                            key: "A vélemény összegző értékelése",
                            label: "A vélemény összegző értékelése, konkrét indoklása, legfeljebb 2500 karakter terjedelemben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 2500,
                                rows: 6
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
                }
            ]
        },
        {
            key: "Javaslat a rövid értekezés benyújtásáról",
            label: "Összefoglaló javaslat: A rövid értekezés benyújtásáról",
            helpText: "Az előterjesztő összefoglaló véleménye arról, hogy a kérelem elbírálható-e rövid értekezés benyújtásával.",
            conditionKey: "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája",
            conditionValue: "rövid értekezés",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Javaslat a rövid értekezés benyújtásáról",
                    fields: [
                        {
                            key: "Javaslat",
                            label: "Az előterjesztő javasolja a doktori mű bírálatra bocsátását rövid értekezés formában",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Indoklás (legfeljebb 2500 karakter terjedelemben)",
                            type: "decisionText",
                            attribs: {
                                maxLength: 2500,
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
