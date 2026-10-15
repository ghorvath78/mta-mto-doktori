import type { PageDescriptor } from "@repo/form-engine";

// A tudományági és szakterületi illetékesség megállapítása (a mentett JSON-ban: "Illetékesség|Illetékesség|...").
export const illetekesseg: PageDescriptor = {
    key: "Illetékesség",
    conditionKey: "__meta|Kérelmezői adatlap betöltve", // = eloterjesztoiform.tsx: APPLICANT_DATA_LOADED_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    sections: [
        {
            key: "A kérelmező által megnevezett szakterület és tudományos bizottság",
            helpText: "A kérelmező által megnevezett szakterület és az illetékes tudományos bizottság, amelyben a doktori kérelem elbírálásra kerül.",
            groups: [
                {
                    key: "A kérelmező által megnevezett szakterület és tudományos bizottság",
                    readonly: true,
                    noPersist: true,
                    fields: [
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
        }
    ]
};
