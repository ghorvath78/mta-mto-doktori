import type { PageDescriptor } from "@repo/form-engine";
import { applicantDataLoaded } from "./atoms";

export const otPublikacio: PageDescriptor = {
    key: "Öt kiemelt publikáció",
    enabledAtom: applicantDataLoaded,
    sections: [
        {
            key: "A kérelmező által megjelölt öt legfontosabb publikáció",
            attribs: {
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Publikációk listája",
                    isArray: true,
                    lengthSource: "Kérelmezői|Legfontosabb publikációk|Öt legfontosabb publikáció|Öt legfontosabb publikáció|_length",
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Publikáció adatai",
                            type: "mtmtPub",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Legfontosabb publikációk|Öt legfontosabb publikáció|Öt legfontosabb publikáció|MTMT azonosító"
                        }
                    ]
                }
            ]
        },
        {
            key: "Öt legfontosabb publikáció értékelése",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Publikációk értékelése",
                    fields: [
                        {
                            key: "Szöveges értékelés",
                            label: "Értékelje a pályázó tudományos teljesítményének minőségét az öt legfontosabb publikációja alapján, kitérve a megjelölt publikációk és a tézisek kapcsolódására",
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
