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
                            key: "Akadémikus és MTA (tudomány) doktora tagjainak száma",
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
            attribs: {
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Előterjesztők",
                    isArray: true,
                    arrayMin: 0,
                    arrayMax: 3,
                    customComponent: NominatorUploader,
                    fields: [
                        { key: "Előterjesztő neve", type: "text" },
                        { key: "Tudományos fokozat", type: "text" },
                        { key: "RawJSON", type: "text", attribs: { noPrint: true } },
                        { key: "RawApplicantJSON", type: "text", attribs: { noPrint: true } },
                        { key: "RawMtmtJSON", type: "text", attribs: { noPrint: true } }
                    ]
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
                            key: "Akadémikus és MTA (tudomány) doktora tagjainak száma",
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
                            key: "Az ülésen jelen van minden előterjesztő",
                            type: "decisionYesNo"
                        }
                    ]
                },
                {
                    key: "Összesítés",
                    label: "A résztvevő bizottságok összesített létszáma",
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
                            type: "decisionYesNo"
                        }
                    ]
                }
            ]
        }
    ]
};
