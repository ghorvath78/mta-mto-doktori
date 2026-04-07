import type { PageDescriptor } from "@repo/form-engine";
import { applicantDataLoaded } from "./atoms";

export const osszefoglalo: PageDescriptor = {
    key: "Összefoglaló javaslat",
    enabledAtom: applicantDataLoaded,
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
        }
    ]
};
