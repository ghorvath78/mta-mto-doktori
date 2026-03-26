import type { PageDescriptor } from "@repo/form-engine";
import { applicantDataLoaded } from "./atoms";

export const otHivatkozas: PageDescriptor = {
    key: "Öt kiemelt hivatkozás",
    enabledAtom: applicantDataLoaded,
    sections: [
        {
            key: "A kérelmező által megjelölt öt legfontosabb hivatkozás",
            attribs: {
                alwaysOpen: true
            },
            groups: [
                {
                    key: "A kérelmező által megjelölt öt legfontosabb hivatkozás",
                    isArray: true,
                    lengthSource: "Kérelmezői|Legfontosabb hivatkozások|Öt legfontosabb hivatkozás|Öt legfontosabb hivatkozás|_length",
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Hivatkozott közlemény",
                            type: "mtmtPub",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Legfontosabb hivatkozások|Öt legfontosabb hivatkozás|Öt legfontosabb hivatkozás|Hivatkozott közlemény"
                        },
                        {
                            key: "Hivatkozó közlemény",
                            type: "mtmtCitation",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Legfontosabb hivatkozások|Öt legfontosabb hivatkozás|Öt legfontosabb hivatkozás|Hivatkozó közlemény",
                            attribs: {
                                pubKey: "Kérelmezői|Legfontosabb hivatkozások|Öt legfontosabb hivatkozás|Öt legfontosabb hivatkozás|Hivatkozott közlemény"
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Öt legfontosabb hivatkozás értékelése",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Hivatkozások értékelése",
                    fields: [
                        {
                            key: "Szöveges értékelés",
                            label: "Értékelje a pályázó öt legfontosabb hivatkozásának minőségét",
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
