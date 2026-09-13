import type { GroupDescriptor, PageDescriptor } from "@repo/form-engine";
import { mtaOsztalyOptions, MUSZAKI_TUDOMANYOK_OSZTALY, tudomanyosBizottsagOptions } from "./requirements";
import { nominatorOpinionsGroup, bizottsagiOpinionGroup, votingResultGroup } from "./evaluationgroups";
import { MAX_NOMINATORS, nominatorLoadedKey, nominatorNameKey, nominatorPrefix } from "./nominators";

const ILLETEKESSEG_MEGALLAPITAS_KEY = "Bizottsági|Pályázó adatai|Illetékesség|A bizottság véleménye|Bizottsági megállapítás";
const BEVONANDO_OSZTALY_KEY = "Bizottsági|Pályázó adatai|Illetékesség|Bevonandó bizottságok/osztályok|Bevonandó osztály";

const ELBIRALHATO = "A megnevezett szakterületen és bizottságban elbírálható";
const NEM_BIRALHATO_EL = "A megnevezett szakterületen és bizottságban nem bírálható el";
const BEVONASSAL_ELBIRALHATO = "A megnevezett szakterület és bizottság részvételével elbírálható, további bizottság és/vagy osztály bevonásával";

const ALLASPONT_SZAVAZAS_HELP =
    "A fentiekben kialakult álláspontot a bizottság vita után egyszerű többségi, tartózkodásmentes nyílt szavazással az alábbi szavazati eredménnyel támasztotta alá.";

function nominatorHabitusOpinionGroup(index: number): GroupDescriptor {
    const prefix = nominatorPrefix(index);
    return {
        key: `${index}. előterjesztő habitusvéleménye`,
        conditionKey: nominatorLoadedKey(index),
        readonly: true,
        noPersist: true,
        fields: [
            {
                key: "Előterjesztő neve",
                type: "text",
                readonly: true,
                valueSource: nominatorNameKey(index)
            },
            {
                key: "Véleménye",
                type: "text",
                readonly: true,
                valueSource: `${prefix}|Összefoglaló javaslat|Összefoglaló javaslat|Összefoglaló javaslat|Javaslat`
            },
            {
                key: "Rövid értekezéssel is",
                type: "text",
                readonly: true,
                conditionKey: "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája",
                conditionValue: "rövid értekezés",
                valueSource: `${prefix}|Összefoglaló javaslat|Javaslat a rövid értekezés benyújtásáról|Javaslat a rövid értekezés benyújtásáról|Javaslat`
            }
        ]
    };
}

export const palyazoAdatai: PageDescriptor = {
    key: "Pályázó adatai",
    conditionKey: "__meta|Habitusvizsgálat lefolytatható", // = bizottsagiform.tsx: HABITUSVIZSGALAT_LEFOLYTATHATO_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    sections: [
        {
            key: "A pályázó személyes adatai",
            helpText: "A kérelmező személyes adatai a kérelmezői adatlapból kerülnek átvételre.",
            groups: [
                {
                    key: "A pályázó személyes adatai",
                    noPersist: true,
                    fields: [
                        {
                            key: "A doktori mű szerzője",
                            type: "text",
                            readonly: true,
                            valueSource: "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|Név"
                        },
                        {
                            key: "Születési adatok",
                            type: "birthYearPlace",
                            readonly: true,
                            valueSource: "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|Születési adatok"
                        },
                        {
                            key: "MTMT azonosító",
                            type: "mtmtUser",
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
                    noPersist: true,
                    valueSource: "Kérelmezői|A kérelmező főbb adatai|Aktuális munkahelyek|Aktuális munkahelyek",
                    fields: [
                        { key: "Intézmény", type: "text", readonly: true },
                        { key: "Szervezeti egység", type: "text", readonly: true },
                        { key: "Beosztás", type: "text", readonly: true },
                        { key: "Kezdete", type: "year", readonly: true }
                    ]
                }
            ]
        },
        {
            key: "A doktori mű",
            helpText: "A doktori mű adatai a kérelmezői adatlapból kerülnek átvételre.",
            groups: [
                {
                    key: "A doktori mű",
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Formája",
                            type: "text",
                            valueSource:
                                "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája"
                        },
                        {
                            key: "Címe",
                            type: "text",
                            valueSource: "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Címe"
                        }
                    ]
                }
            ]
        },
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
                    yesNoPath: "Pályázó adatai|Illetékesség|Illetékesség|Illetékesség megállapítása"
                }),
                {
                    key: "A bizottság véleménye",
                    label: "A bizottság véleménye",
                    attribs: {
                        // important: true
                    },
                    fields: [
                        {
                            key: "Bizottsági megállapítás",
                            type: "select",
                            attribs: {
                                important: true,
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
        },
        {
            key: "Alkalmasság",
            label: "A benyújtott doktori mű formai alkalmassága",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            helpText:
                "A formai alkalmasság megállapítása: alkalmas-e a benyújtott doktori mű formailag az elbírálásra. Tartalmi értékelést ebben a szakaszban nem szabad végezni.",
            groups: [
                nominatorOpinionsGroup({
                    key: "Előterjesztők véleménye",
                    yesNoPath: "Pályázó adatai|Alkalmasság|Alkalmasság|Formai alkalmasság megállapítása",
                    textPath: "Pályázó adatai|Alkalmasság|Alkalmasság|Alkalmasság indoklása"
                }),
                bizottsagiOpinionGroup({
                    key: "Alkalmasság",
                    yesNoLabel: "A bizottság véleménye szerint a benyújtott doktori mű formailag alkalmas az elbírálásra",
                    textLabel: "Nemleges vélemény indoklása"
                }),
                votingResultGroup("Alkalmasság szavazás eredménye", ALLASPONT_SZAVAZAS_HELP)
            ]
        },
        {
            key: "Az előterjesztők véleménye a kérelmező doktori habitusáról",
            helpText:
                'Az egyes előterjesztők záró javaslata a kérelmező doktori habitusáról, az előterjesztői adatlapok "Javaslat" lapjáról átvéve. Ez a szekció csak megjelenít, a bizottságnak itt nem kell semmit megadnia.',
            description: "Az előterjesztők a tudományos munkássága alapján alkalmasnak tartják-e a kérelmezőt az MTA doktora cím megszerzésére",
            groups: Array.from({ length: MAX_NOMINATORS }, (_, i) => nominatorHabitusOpinionGroup(i + 1))
        }
    ]
};
