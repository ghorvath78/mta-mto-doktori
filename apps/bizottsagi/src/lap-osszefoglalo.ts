import type { PageDescriptor } from "@repo/form-engine";
import { nominatorOpinionsGroup, bizottsagiOpinionGroup } from "./evaluationgroups";

const ELOTERJESZTOI_JAVASLAT_PREFIX = "Összefoglaló javaslat|Összefoglaló javaslat|Összefoglaló javaslat";
const ELOTERJESZTOI_ROVID_JAVASLAT_PREFIX = "Összefoglaló javaslat|Javaslat a rövid értekezés benyújtásáról|Javaslat a rövid értekezés benyújtásáról";

export const osszefoglalo: PageDescriptor = {
    key: "Összefoglaló javaslat",
    label: "Javaslat",
    conditionKey: "__meta|Legalább 2 előterjesztő betöltve", // = bizottsagiform.tsx: NOMINATORS_LOADED_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    sections: [
        {
            key: "Összefoglaló javaslat",
            label: "Összefoglaló javaslat: A kérelmező doktori habitusának megítélése",
            helpText:
                "Az előterjesztők összefoglaló véleménye a kérelmező doktori habitusáról, valamint a bizottság saját, összegző javaslata.",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                nominatorOpinionsGroup({
                    key: "Előterjesztők véleménye",
                    yesNoPath: `${ELOTERJESZTOI_JAVASLAT_PREFIX}|Javaslat`,
                    textPath: `${ELOTERJESZTOI_JAVASLAT_PREFIX}|A vélemény összegző értékelése`
                }),
                bizottsagiOpinionGroup({
                    key: "Bizottsági javaslat",
                    yesNoLabel: "A bizottság a doktori értekezés bírálatra bocsátását javasolja",
                    textLabel: "A bizottsági vélemény összegző értékelése, konkrét indoklása, legfeljebb 2500 karakter terjedelemben",
                    maxLength: 2500,
                    rows: 6
                })
            ]
        },
        {
            key: "Javaslat a rövid értekezés benyújtásáról",
            label: "Összefoglaló javaslat: A rövid értekezés benyújtásáról",
            helpText: "Az előterjesztők összefoglaló véleménye, valamint a bizottság saját javaslata arról, hogy a kérelem elbírálható-e rövid értekezés benyújtásával.",
            conditionKey: "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája",
            conditionValue: "rövid értekezés",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                nominatorOpinionsGroup({
                    key: "Előterjesztők véleménye",
                    yesNoPath: `${ELOTERJESZTOI_ROVID_JAVASLAT_PREFIX}|Javaslat`,
                    textPath: `${ELOTERJESZTOI_ROVID_JAVASLAT_PREFIX}|Indoklás`
                }),
                bizottsagiOpinionGroup({
                    key: "Bizottsági javaslat",
                    yesNoLabel: "A bizottság javasolja a doktori mű bírálatra bocsátását rövid értekezés formában",
                    textLabel: "A bizottsági indoklás legfeljebb 2500 karakter terjedelemben",
                    maxLength: 2500,
                    rows: 6
                })
            ]
        }
    ]
};
