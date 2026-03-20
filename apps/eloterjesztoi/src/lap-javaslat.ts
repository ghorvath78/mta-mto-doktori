import type { PageDescriptor } from "@repo/form-engine";
import { applicantDataLoaded } from "./atoms";

export const javaslat: PageDescriptor = {
    key: "A tudományos minimumkövetelmények teljesítésének összesítése",
    enabledAtom: applicantDataLoaded,
    sections: [
        {
            key: "Összefoglaló javaslat",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Javaslat",
                    fields: [
                        {
                            key: "Bírálatra bocsátás javaslata",
                            label: "Az előterjesztő a kérelmező doktori habitusa alapján, figyelembe véve tudományos eredményeit, publikációs és alkotási tevékenységét, tudományos tevékenységének visszhangját, tudományos közéleti munkásságát, és a minimumkövetelmények teljesülését, a kérelmező doktori értekezésének bírálatra bocsátását javasolja",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "A vélemény összegző értékelése, fenti szempontok szerinti konkrét indoklása",
                            type: "decisionText",
                            attribs: {
                                maxLength: 2500,
                                rows: 10
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
