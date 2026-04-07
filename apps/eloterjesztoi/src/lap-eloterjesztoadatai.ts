import { type PageDescriptor } from "@repo/form-engine";
import { ApplicationPdfUploader } from "./customgroups/uploader";

export const eloterjesztoAdatai: PageDescriptor = {
    key: "Előterjesztő adatai",
    attribs: {
        style: "primary"
    },
    sections: [
        {
            key: "Előterjesztő adatai",
            attribs: {
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Adatok",
                    fields: [
                        {
                            key: "Előterjesztő neve",
                            type: "text",
                            helpText: "Az előterjesztő teljes neve."
                        },
                        {
                            key: "Tudományos fokozat",
                            type: "selectAddOther",
                            helpText: "Az előterjesztő tudományos fokozata (PhD, MTA doktora, MTA levelező tagja, MTA rendes tagja).",
                            attribs: {
                                type: "fokozat",
                                options: ["PhD", "MTA doktora", "MTA levelező tagja", "MTA rendes tagja"]
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Kérelmezői adatlap",
            helpText:
                "Töltse fel a kérelmező által kitöltött kérelmezői adatlapot PDF formátumban. Az adatlapot a rendszer feldolgozza, és a pályázó adatai automatikusan megjelennek az űrlap megfelelő mezőiben. Az adatlap feltöltése nélkül az előterjesztői űrlap kitöltése nem folytatható.",
            attribs: {
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Kérelmezői adatlap",
                    customComponent: ApplicationPdfUploader,
                    noPersist: true,
                    fields: []
                }
            ]
        }
    ]
};
