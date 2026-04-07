import type { PageDescriptor } from "@repo/form-engine";
import { applicantDataLoaded } from "./atoms";

export const osszesites: PageDescriptor = {
    key: "A tudományos minimumkövetelmények teljesítésének összesítése",
    enabledAtom: applicantDataLoaded,
    sections: [
        {
            key: "Összesítés",
            label: "A tudományos minimumkövetelmények teljesítésének összesítése",
            helpText:
                "A minimumfeltételeket a kérelmezőnek maradéktalanul teljesítenie kell. Ha az előírt minimumkövetelményekből csak egy is nem teljesül, a doktori habitus nem megfelelő, és a doktori eljárás folytatását, azaz a doktori mű bírálatra bocsátását az előterjesztő nem javasolhatja. Ugyanakkor a követelmények teljesítése vagy akár túlteljesítése önmagában nem jelenti az elvárt habitus meglétét.",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Összesítés",
                    fields: [
                        {
                            key: "Minden követelmény teljesül",
                            label: "Az előterjesztő véleménye szerint a kérelmező maradéktalanul teljesítette a minimumkövetelményeket",
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
