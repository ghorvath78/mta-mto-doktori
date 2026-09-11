import type { PageDescriptor } from "@repo/form-engine";
import { nominatorOpinionsGroup, bizottsagiOpinionGroup } from "./evaluationgroups";

const ELOTERJESZTOI_OSSZESITES_PREFIX = "Előterjesztői|A tudományos minimumkövetelmények teljesítésének összesítése|Összesítés|Összesítés";

export const osszesites: PageDescriptor = {
    key: "A tudományos minimumkövetelmények teljesítésének összesítése",
    label: "Minimumkövetelmények",
    conditionKey: "__meta|Legalább 2 előterjesztő betöltve", // = bizottsagiform.tsx: NOMINATORS_LOADED_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    sections: [
        {
            key: "Összesítés",
            label: "A tudományos minimumkövetelmények teljesítésének összesítése",
            helpText:
                "A minimumfeltételeket a kérelmezőnek maradéktalanul teljesítenie kell. Az egyes előterjesztők véleménye mellett a bizottság saját megítélését is rögzíteni kell.",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                nominatorOpinionsGroup({
                    key: "Előterjesztők véleménye",
                    yesNoPath: `${ELOTERJESZTOI_OSSZESITES_PREFIX}|Minden követelmény teljesül`,
                    textPath: `${ELOTERJESZTOI_OSSZESITES_PREFIX}|Indoklás`
                }),
                bizottsagiOpinionGroup({
                    key: "Bizottsági értékelés",
                    yesNoLabel: "A bizottság megítélése szerint a kérelmező maradéktalanul teljesítette a minimumkövetelményeket",
                    textLabel: "A nem teljesült minimumkövetelmények bizottsági indoklása legfeljebb 1500 karakterben"
                })
            ]
        }
    ]
};
