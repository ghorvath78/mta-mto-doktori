import type { PageDescriptor } from "@/forms";

export const publikaciok: PageDescriptor = {
    key: "Legfontosabb publikációk",
    sections: [
        {
            key: "Öt legfontosabb publikáció",
            helpText:
                "Az 5 kiemelt publikáció esetében a habitusvizsgáló ülést előkészítő előterjesztők és a tudományos bizottság azt vizsgálja, hogy az egyes publikációk:\n• megjelenési helye mennyire tekinthető az adott szakterületen kiemelkedően színvonalas, rangos fórumnak;\n• milyen (nemzetközi) együttműködést mutatnak;\n• milyen új tudományos eredményt tartalmaznak.\n\nA követelmények szerint az 5 legfontosabb publikáció közül legalább 3-nak szorosan kapcsolódnia kell a tézisekhez (lehetőleg mindegyiknek).",
            groups: [
                {
                    key: "Öt legfontosabb publikáció",
                    isArray: true,
                    arrayMax: 5,
                    arrayAddLabel: "Új publikáció hozzáadása",
                    fields: [
                        {
                            key: "MTMT azonosító",
                            type: "mtmtPub",
                            helpText:
                                'A publikáció MTMT azonosítója. A listában csak a "Fő adatok" szekcióban megadott MTMT azonosítóhoz tartozó publikációk választhatók.',
                            attribs: {
                                unique: true
                            }
                        },
                        {
                            key: "Tézishez kapcsolódás",
                            label: "Tézishez kapcsolódik",
                            type: "select",
                            value: "igen",
                            helpText: "Jelölje, ha a közlemény kapcsolódik a tézisekhez!",
                            attribs: {
                                options: ["igen", "nem"]
                            }
                        },
                        {
                            key: "Tartalmi összefoglaló",
                            type: "longtext",
                            helpText:
                                "A publikációban közölt saját kutatási eredmények tömör összefoglalása, szóközökkel együtt legfeljebb 750 karakter terjedelemben.",
                            attribs: {
                                maxLength: 750,
                                rows: 5
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
