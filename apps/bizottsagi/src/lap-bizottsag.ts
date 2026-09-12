import type { PageDescriptor } from "@repo/form-engine";
import { tudomanyosBizottsagOptions } from "./requirements";
import { NominatorUploader } from "./customgroups/nominatoruploader";
import { QuorumSummary } from "./customgroups/quorumsummary";

export const bizottsag: PageDescriptor = {
    key: "Bizottság",
    attribs: {
        style: "primary"
    },
    sections: [
        {
            key: "Bizottság összetétele",
            helpText: "A bizottsági javaslatot készítő tudományos bizottság és összetételének megadása.",
            groups: [
                {
                    key: "Bizottság összetétele",
                    fields: [
                        {
                            key: "Ügykezelő bizottság",
                            type: "select",
                            helpText: "A bizottsági javaslatot készítő tudományos bizottság.",
                            attribs: {
                                options: tudomanyosBizottsagOptions
                            }
                        },
                        {
                            key: "A bizottság elnöke",
                            type: "text"
                        },
                        {
                            key: "A bizottság titkára",
                            type: "text"
                        },
                        {
                            key: "Akadémikus és MTA doktora tagok száma",
                            type: "number"
                        },
                        {
                            key: "Ebből a jelölttel nem összeférhetetlen tagok száma",
                            type: "number"
                        },
                        {
                            key: "Ebből jelen van",
                            type: "number"
                        }
                    ]
                }
            ]
        },
        {
            key: "Előterjesztők",
            helpText:
                "Töltse fel a kérelemről véleményt alkotó 2-3 előterjesztő mentett PDF adatlapját. Az első feltöltéskor a benne beágyazott kérelmezői adatlap is betöltésre kerül; a további feltöltéseknél a rendszer ellenőrzi, hogy ugyanarról a kérelmezőről van-e szó, és eltérés esetén elutasítja a feltöltést.",
            groups: [
                {
                    key: "Feltöltés",
                    customComponent: NominatorUploader,
                    noPersist: true,
                    fields: []
                }
            ]
        },
        {
            key: "Vendégbizottságok",
            helpText: "A habitusvizsgálati ülésen részt vevő, legfeljebb 2 vendégbizottság megadása.",
            groups: [
                {
                    key: "Vendégbizottságok",
                    isArray: true,
                    arrayMin: 0,
                    arrayMax: 2,
                    arrayAddLabel: "Vendégbizottság hozzáadása",
                    fields: [
                        {
                            key: "Vendégbizottság",
                            type: "select",
                            attribs: {
                                options: tudomanyosBizottsagOptions
                            }
                        },
                        {
                            key: "Akadémikus és MTA doktora tagok száma",
                            helpText: "Csak azokat a tagokat vegye figyelembe, akik az ügykezelő bizottságban nem lettek még figyelembe véve.",
                            type: "number"
                        },
                        {
                            key: "Ebből a jelölttel nem összeférhetetlen tagok száma",
                            helpText: "Csak azokat a tagokat vegye figyelembe, akik az ügykezelő bizottságban nem lettek még figyelembe véve.",
                            type: "number"
                        },
                        {
                            key: "Ebből jelen van",
                            helpText: "Csak azokat a tagokat vegye figyelembe, akik az ügykezelő bizottságban nem lettek még figyelembe véve.",
                            type: "number"
                        }
                    ]
                }
            ]
        },
        {
            key: "Határozatképesség",
            attribs: {
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Ülés adatai",
                    fields: [
                        {
                            key: "Az ülés időpontja",
                            type: "date"
                        },
                        {
                            key: "Jelen van minden előterjesztő",
                            type: "select",
                            attribs: {
                                options: ["Igen", "Nem"]
                            }
                        }
                    ]
                },
                {
                    key: "Összesítés",
                    noPersist: true,
                    customComponent: QuorumSummary,
                    fields: []
                },
                {
                    key: "Szavazati joggal rendelkezők névsora",
                    fields: [
                        {
                            key: "Névsor",
                            label: "Szavazati joggal rendelkezők névsora (vesszővel elválasztva)",
                            type: "longtext",
                            attribs: {
                                rows: 3
                            }
                        }
                    ]
                },
                {
                    key: "Határozatképesség megállapítása",
                    attribs: {
                        important: true
                    },
                    fields: [
                        {
                            key: "A habitusvizsgálatot lefolytató bizottsági ülés határozatképes",
                            type: "decisionYesNo",
                            readonly: true,
                            helpText:
                                "A bizottsági ülés a doktori eljárásban akkor határozatképes, ha mindhárom alábbi feltétel teljesül:\n" +
                                "a) jelen van az összes felkért előterjesztő;\n" +
                                "b) az ügykezelő bizottságban a doktori eljárásban szavazati joggal rendelkező, összeférhetetlenség miatt ki nem zárt bizottsági tagoknak legalább a fele jelen van;\n" +
                                "c) a doktori eljárásban szavazati joggal rendelkező, összeférhetetlenség miatt ki nem zárt jelenlévő ügykezelő bizottsági és vendégbizottsági tagok számának összege - az előterjesztőket nem számítva - legalább 7.\n\n" +
                                'Az értéket a rendszer a fenti "Összesítés" táblázat és a jelenléti adatok alapján automatikusan állapítja meg.'
                        }
                    ]
                }
            ]
        }
    ]
};
