import type { PageDescriptor } from "@repo/form-engine";

export const palyazoAdatai: PageDescriptor = {
    key: "Pályázó adatai",
    conditionKey: "__meta|Kérelmezői adatlap betöltve", // = eloterjesztoiform.tsx: APPLICANT_DATA_LOADED_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    sections: [
        {
            key: "A pályázó személyes adatai",
            helpText: "A kérelmező személyes adatai a kérelmezői adatlapból kerülnek átvételre. Az adatok ellenőrzése az előterjesztő feladata.",
            groups: [
                {
                    key: "A pályázó személyes adatai",
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
                            type: "birthYearPlace",
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
                    key: "Aktuális munkahelyek",
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
                            helpText: "A munkahely szervezeti egységének megnevezése. Egyetemi munkahely esetén a kar és a tanszék megnevezése is szerepel.",
                            readonly: true
                        },
                        {
                            key: "Beosztás",
                            type: "text",
                            helpText: "A munkahelyen betöltött beosztás megnevezése.",
                            readonly: true
                        },
                        {
                            key: "Kezdete",
                            type: "year",
                            helpText: "A munkahelyen töltött időszak kezdő éve."
                        }
                    ]
                }
            ]
        }
    ]
};
