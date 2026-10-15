import type { PageDescriptor } from "@repo/form-engine";
import { mtaOsztalyOptions, MUSZAKI_TUDOMANYOK_OSZTALY, tudomanyosBizottsagOptions } from "./requirements";
import { nominatorOpinionsGroup, votingResultGroup, ALLASPONT_SZAVAZAS_HELP } from "./evaluationgroups";

const ILLETEKESSEG_MEGALLAPITAS_KEY = "Bizottsági|Illetékesség|Illetékesség|A bizottság véleménye|Bizottsági megállapítás";
const BEVONANDO_OSZTALY_KEY = "Bizottsági|Illetékesség|Illetékesség|Bevonandó bizottságok/osztályok|Bevonandó osztály";

const ELBIRALHATO = "A megnevezett szakterületen és bizottságban elbírálható";
const NEM_BIRALHATO_EL = "A megnevezett szakterületen és bizottságban nem bírálható el";
const BEVONASSAL_ELBIRALHATO = "A megnevezett szakterület és bizottság részvételével elbírálható, további bizottság és/vagy osztály bevonásával";

// A tudományági és szakterületi illetékesség megállapítása (a mentett JSON-ban: "Illetékesség|Illetékesség|...").
export const illetekesseg: PageDescriptor = {
    key: "Illetékesség",
    conditionKey: "__meta|Habitusvizsgálat lefolytatható", // = bizottsagiform.tsx: HABITUSVIZSGALAT_LEFOLYTATHATO_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    sections: [
        {
            key: "A kérelmező által megnevezett szakterület és tudományos bizottság",
            groups: [
                {
                    key: "A kérelmező által megnevezett szakterület és tudományos bizottság",
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Szakterület",
                            type: "text",
                            valueSource:
                                "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Tudományág"
                        },
                        {
                            key: "Tudományos bizottság",
                            type: "text",
                            valueSource:
                                "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Illetékes bizottság"
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
                "Az illetékesség megállapítása: elbírálható-e a doktori kérelem a kérelmező által megnevezett szakterületen és tudományos bizottságban, esetleg további bizottság/osztály bevonásával.",
            groups: [
                nominatorOpinionsGroup({
                    key: "Előterjesztők véleménye",
                    yesNoPath: "Illetékesség|Illetékesség|Illetékesség|Illetékesség megállapítása"
                }),
                {
                    key: "A bizottság véleménye",
                    label: "A bizottság véleménye",
                    attribs: {
                        important: true
                    },
                    fields: [
                        {
                            key: "Bizottsági megállapítás",
                            type: "select",
                            attribs: {
                                primaryBackground: true,
                                options: [ELBIRALHATO, NEM_BIRALHATO_EL, BEVONASSAL_ELBIRALHATO]
                            }
                        }
                    ]
                },
                {
                    key: "Bevonandó bizottságok/osztályok",
                    isArray: true,
                    arrayMin: 1,
                    arrayMax: 2,
                    arrayAddLabel: "Bevonandó bizottság/osztály",
                    conditionKey: ILLETEKESSEG_MEGALLAPITAS_KEY,
                    conditionValue: BEVONASSAL_ELBIRALHATO,
                    fields: [
                        {
                            key: "Bevonandó osztály",
                            type: "select",
                            attribs: {
                                // important: true,
                                options: mtaOsztalyOptions
                            }
                        },
                        {
                            key: "Bevonandó bizottság",
                            type: "select",
                            conditionKey: BEVONANDO_OSZTALY_KEY,
                            conditionValue: MUSZAKI_TUDOMANYOK_OSZTALY,
                            attribs: {
                                // important: true,
                                options: tudomanyosBizottsagOptions
                            }
                        }
                    ]
                },
                votingResultGroup("Illetékesség szavazás eredménye", ALLASPONT_SZAVAZAS_HELP)
            ]
        }
    ]
};
