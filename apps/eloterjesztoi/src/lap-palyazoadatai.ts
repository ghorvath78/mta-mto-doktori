import type { PageDescriptor } from "@repo/form-engine";
import { applicantDataLoaded } from "./atoms";

export const palyazoAdatai: PageDescriptor = {
    key: "Pályázó adatai",
    enabledAtom: applicantDataLoaded,
    sections: [
        {
            key: "A pályázó személyes adatai",
            groups: [
                {
                    key: "Személyi adatok",
                    noPersist: true,
                    fields: [
                        {
                            key: "A doktori mű szerzője",
                            type: "text",
                            helpText: "A pályázó teljes neve (vezetéknév, keresztnév), ahogy az a hivatalos dokumentumaiban szerepel.",
                            readonly: true,
                            valueSource: "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|Név"
                        },
                        {
                            key: "Születési adatok",
                            type: "text",
                            helpText: "A pályázó születési helye és ideje.",
                            readonly: true,
                            valueSource: "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|Születési adatok"
                        },
                        {
                            key: "MTMT azonosító",
                            type: "mtmtUser",
                            helpText: "A pályázó MTMT azonosítója. A MTMT azonosítóra kattintva megnyílik a pályázó MTMT profilja.",
                            readonly: true,
                            valueSource: "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|MTMT azonosító"
                        }
                    ]
                }
            ]
        },
        {
            key: "Aktuális munkahelyek",
            groups: [
                {
                    key: "Aktuális munkahely",
                    readonly: true,
                    isArray: true,
                    arrayAddLabel: "Új munkahely hozzáadása",
                    noPersist: true,
                    valueSource: "Kérelmezői|A kérelmező főbb adatai|Aktuális munkahelyek|Aktuális munkahelyek",
                    fields: [
                        {
                            key: "Intézmény",
                            type: "text",
                            helpText: "A munkahely intézményének megnevezése.",
                            readonly: true
                        },
                        {
                            key: "Szervezeti egység",
                            type: "text",
                            helpText:
                                "A munkahely szervezeti egységének megnevezése. Egyetemi munkahely esetén kérjük a kar és a tanszék megnevezését is feltüntetni.",
                            readonly: true
                        },
                        {
                            key: "Beosztás",
                            type: "text",
                            helpText: "A munkahelyen betöltött beosztás megnevezése.",
                            readonly: true
                        }
                    ]
                }
            ]
        },
        {
            key: "A doktori mű",
            groups: [
                {
                    key: "A doktori mű adatai",
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Doktori mű formája",
                            type: "text",
                            helpText:
                                "A doktori mű formája (pl. értekezés, rövid értekezés, monográfia vagy könyv. Vegye figyelembe, hogy különböző formájú művekre eltérő tudományos minimumkövetelmények vonatkoznak.",
                            valueSource:
                                "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája",
                            readonly: true
                        },
                        {
                            key: "Doktori mű címe",
                            type: "text",
                            helpText: "A doktori mű címe.",
                            valueSource: "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Címe",
                            readonly: true
                        },
                        {
                            key: "Szakterület",
                            type: "text",
                            helpText: "A kérelmező által megnevezett szakterület, amelyben a kérelem elbírálható.",
                            valueSource:
                                "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Tudományág",
                            readonly: true
                        },
                        {
                            key: "Tudományos bizottság",
                            type: "text",
                            helpText: "A kérelmező által megnevezett tudományos bizottság.",
                            valueSource:
                                "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Illetékes bizottság",
                            readonly: true
                        }
                    ]
                }
            ]
        },
        {
            key: "Illetékesség",
            label: "A tudományági és szakterületi illetékesség megállapítása",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            helpText:
                "Az illetékesség megállapítása. Az előterjesztőnek véleményt kell alkotnia arról, hogy a doktori kérelem a kérelmező által megnevezett szakterületen, az adatlapon megadott tudományos bizottságban elbírálható-e.",
            groups: [
                {
                    key: "Illetékesség",
                    fields: [
                        {
                            key: "Illetékesség megállapítása",
                            label: "Az előterjesztő véleménye szerint a doktori kérelem a kérelmező által megnevezett szakterületen, az adatlapon megadott tudományos bizottságban elbírálható",
                            type: "decisionYesNo"
                        }
                    ],
                    attribs: {
                        important: true
                    }
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
