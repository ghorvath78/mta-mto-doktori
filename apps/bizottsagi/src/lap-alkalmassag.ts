import type { PageDescriptor } from "@repo/form-engine";
import { nominatorOpinionsGroup, bizottsagiOpinionGroup, votingResultGroup, ALLASPONT_SZAVAZAS_HELP } from "./evaluationgroups";

// A benyújtott doktori mű formai alkalmassága (a mentett JSON-ban: "Alkalmasság|Alkalmasság|...").
export const alkalmassag: PageDescriptor = {
    key: "Alkalmasság",
    label: "Formai alkalmasság",
    conditionKey: "__meta|Habitusvizsgálat lefolytatható", // = bizottsagiform.tsx: HABITUSVIZSGALAT_LEFOLYTATHATO_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    sections: [
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
                    yesNoPath: "Alkalmasság|Alkalmasság|Alkalmasság|Formai alkalmasság megállapítása",
                    textPath: "Alkalmasság|Alkalmasság|Alkalmasság|Alkalmasság indoklása"
                }),
                bizottsagiOpinionGroup({
                    key: "Alkalmasság",
                    yesNoLabel: "A bizottság véleménye szerint a benyújtott doktori mű formailag alkalmas az elbírálásra",
                    textLabel: "Nemleges vélemény indoklása"
                }),
                votingResultGroup("Alkalmasság szavazás eredménye", ALLASPONT_SZAVAZAS_HELP)
            ]
        }
    ]
};
