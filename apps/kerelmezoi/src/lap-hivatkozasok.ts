import type { PageDescriptor } from "@/forms";

export const hivatkozasok: PageDescriptor = {
    key: "Legfontosabb hivatkozások",
    sections: [
        {
            key: "Öt legfontosabb hivatkozás",
            helpText:
                "Az 5 legfontosabbnak tartott hivatkozás kapcsán vizsgálat alá esik:\n• a hivatkozó publikáció megjelenésének helye (rangos folyóirat, könyv);\n• a hivatkozó publikáció szerzőinek nemzetközisége;\n• a hivatkozó publikáció szerzőinek valódi függetlensége a hivatkozott publikáció szerzőitől;\n• a hivatkozás érdemi volta (azaz alkalmazza-e érdemben a hivatkozott publikáció eredményeit, elismeri-e azokat jelentős eredménynek).",
            groups: [
                {
                    key: "Öt legfontosabb hivatkozás",
                    isArray: true,
                    arrayMax: 5,
                    arrayAddLabel: "Új hivatkozás hozzáadása",
                    fields: [
                        {
                            key: "Hivatkozott közlemény",
                            type: "mtmtPub",
                            helpText:
                                'A hivatkozott közlemény MTMT azonosítója. A listában csak a "Fő adatok" szekcióban megadott MTMT azonosítóhoz tartozó publikációk választhatók.'
                        },
                        {
                            key: "Hivatkozó közlemény",
                            type: "mtmtCitation",
                            helpText:
                                'A hivatkozó közlemény MTMT azonosítója. A listában csak a fenti "Hivatkozott közlemény" mezőben kiválasztott publikáció idézői választhatók.',
                            attribs: {
                                pubKey: "Kérelmezői|Legfontosabb hivatkozások|Öt legfontosabb hivatkozás|Öt legfontosabb hivatkozás|Hivatkozott közlemény"
                            }
                        },
                        {
                            key: "Szövegkörnyezet",
                            type: "longtext",
                            helpText:
                                "Másolja be a hivatkozás szövegkörnyezetét eredeti nyelven! A szövegnek igazolnia kell, hogy a hivatkozó érdemben alkalmazza vagy elismeri az eredményt. Szóközökkel együtt legfeljebb 1500 karakter áll rendelkezésre.",
                            attribs: {
                                maxLength: 1500,
                                rows: 5
                            }
                        },
                        {
                            key: "Fordítás",
                            type: "longtext",
                            helpText: "A hivatkozás szövegkörnyezetének fordítása magyar nyelvre, szóközökkel együtt legfeljebb 1500 karakter terjedelemben.",
                            attribs: {
                                maxLength: 1500,
                                rows: 5
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
