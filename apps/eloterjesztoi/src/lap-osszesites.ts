import type { PageDescriptor } from "@repo/form-engine";
import { applicantDataLoaded } from "./atoms";

export const osszesites: PageDescriptor = {
    key: "A tudományos minimumkövetelmények teljesítésének összesítése",
    enabledAtom: applicantDataLoaded,
    sections: [
        {
            key: "Összesítés",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Értékelés",
                    fields: [
                        {
                            key: "Minden követelmény teljesül",
                            label: "Az előterjesztő véleménye szerint a kérelmező maradéktalanul teljesítette a minimumkövetelményeket:",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "A nem teljesült minimumkövetelmények indoklása legfeljebb 1500 karakterben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 1500,
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
