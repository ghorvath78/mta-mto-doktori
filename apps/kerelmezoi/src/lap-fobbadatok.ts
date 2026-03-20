import type { PageDescriptor } from "@/forms";

export const fobbAdatok: PageDescriptor = {
    key: "A kérelmező főbb adatai",
    sections: [
        {
            key: "Személyes adatok",
            groups: [
                {
                    key: "Személyes adatok",
                    fields: [
                        {
                            key: "Név",
                            type: "text",
                            helpText: "A név mezőbe a teljes név (vezetéknév, keresztnév) kerül, ahogy az a hivatalos dokumentumaiban szerepel."
                        },
                        {
                            key: "Születési adatok",
                            type: "birthYearPlace",
                            helpText: "Születési év és hely megadása."
                        },
                        {
                            key: "MTMT azonosító",
                            type: "mtmtUser",
                            helpText:
                                "Az Ön MTMT szerzői azonosítója (pl. 10012345). A beviteli mező végén található ikonra kattintva az azonosító név alapján lekérdezhető."
                        },
                        {
                            key: "ODT személyi lap",
                            type: "link",
                            helpText:
                                "Adja meg a linket, mely a doktori.hu-n található személyi oldalára vezet. A doktori.hu oldalon az 'Oktatók' menüre kattintva és a saját nevet kiválasztva lehet eljutni a személyi oldalra, ennek a linkjét kérjük a mezőben megadni. A mező végén az ikonra kattintva ellenőrizheti, hogy helyesen adta-e meg a linket."
                        },
                        {
                            key: "Egyéni honlap",
                            type: "link",
                            helpText:
                                "Adja meg a saját egyéni honlapjának URL-jét. A mező végén az ikonra kattintva ellenőrizheti, hogy helyesen adta-e meg a linket."
                        }
                    ]
                }
            ]
        },
        {
            key: "Diplomák",
            helpText: "Az 5 legfontosabb felsőfokú végzettség megadása.",
            groups: [
                {
                    key: "Diplomák",
                    isArray: true,
                    arrayMin: 1,
                    arrayMax: 5,
                    arrayAddLabel: "Új diploma hozzáadása",
                    fields: [
                        {
                            key: "Egyetem",
                            type: "text",
                            helpText: "A diplomát kiállító egyetem megnevezése."
                        },
                        {
                            key: "Kar (szak)",
                            type: "text",
                            helpText: "A mezőbe kérjük a kart és utána, pontosvesszővel elválasztva, a szak megnevezését feltüntetni."
                        },
                        {
                            key: "Megszerzés éve",
                            type: "year",
                            helpText: "A diploma megszerzésének éve."
                        },
                        {
                            key: "Minősítése",
                            type: "selectAddOther",
                            helpText:
                                "A diploma minősítése. Ha a listában nem szerepel a diplomán feltüntetett minősítés, a legördülő menüben új megnevezés is beírható, és a megjelenő 'Egyéb minősítés' gomb megnyomásával rögzíthető.",
                            attribs: {
                                type: "minősítés",
                                options: ["elégséges", "közepes", "jó", "jeles", "kiváló", "kitűnő", "kitüntetéses", "rite", "cum laude", "summa cum laude"]
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Tudományos fokozatok",
            groups: [
                {
                    key: "Tudományos fokozatok",
                    isArray: true,
                    arrayMin: 1,
                    arrayAddLabel: "Új fokozat hozzáadása",
                    fields: [
                        {
                            key: "Egyetem/TMB",
                            type: "text",
                            helpText: "A tudományos fokozatot kiállító egyetem vagy tudományos minősítő bizottság megnevezése."
                        },
                        {
                            key: "Tudományterület",
                            type: "text",
                            helpText: "A tudományterület megnevezése."
                        },
                        {
                            key: "Megszerzés éve",
                            type: "year",
                            helpText: "A tudományos fokozat megszerzésének éve."
                        },
                        {
                            key: "Minősítése",
                            type: "selectAddOther",
                            helpText:
                                "A tudományos fokozat minősítése. Ha a listában nem szerepel a fokozaton feltüntetett minősítés, a legördülő menüben új megnevezés is beírható, és a megjelenő 'Egyéb minősítés' gomb megnyomásával rögzíthető. Ha nincs minősítés feltüntetve, válassza a 'nem releváns' opciót.",
                            attribs: {
                                type: "minősítés",
                                options: [
                                    "elégséges",
                                    "közepes",
                                    "jó",
                                    "jeles",
                                    "kiváló",
                                    "kitűnő",
                                    "kitüntetéses",
                                    "rite",
                                    "cum laude",
                                    "summa cum laude",
                                    "nem releváns"
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Tudományos címek",
            label: "Tudományos címek (pl. habilitáció)",
            groups: [
                {
                    key: "Tudományos címek",
                    isArray: true,
                    arrayAddLabel: "Új cím hozzáadása",
                    fields: [
                        {
                            key: "Cím",
                            type: "text",
                            helpText: "A tudományos cím megnevezése (pl. habilitált doktor)."
                        },
                        {
                            key: "Egyetem/TMB",
                            type: "text",
                            helpText: "A tudományos címet kiállító egyetem vagy tudományos minősítő bizottság megnevezése."
                        },
                        {
                            key: "Tudományterület",
                            type: "text",
                            helpText: "A tudományterület megnevezése."
                        },
                        {
                            key: "Megszerzés éve",
                            type: "year",
                            helpText: "A tudományos cím megszerzésének éve."
                        },
                        {
                            key: "Minősítése",
                            type: "selectAddOther",
                            helpText:
                                "A tudományos cím minősítése. Ha a listában nem szerepel a címen feltüntetett minősítés, a legördülő menüben új megnevezés is beírható, és a megjelenő 'Egyéb minősítés' gomb megnyomásával rögzíthető.",
                            attribs: {
                                type: "minősítés",
                                options: ["elégséges", "közepes", "jó", "jeles", "kiváló", "kitűnő", "kitüntetéses", "rite", "cum laude", "summa cum laude"]
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Aktuális munkahelyek",
            groups: [
                {
                    key: "Aktuális munkahelyek",
                    isArray: true,
                    arrayAddLabel: "Új munkahely hozzáadása",
                    fields: [
                        {
                            key: "Intézmény",
                            type: "text",
                            helpText: "A munkahely intézményének megnevezése."
                        },
                        {
                            key: "Szervezeti egység",
                            type: "text",
                            helpText:
                                "A munkahely szervezeti egységének megnevezése. Egyetemi munkahely esetén kérjük a kar és a tanszék megnevezését is feltüntetni."
                        },
                        {
                            key: "Beosztás",
                            type: "text",
                            helpText: "A munkahelyen betöltött beosztás megnevezése."
                        }
                    ]
                }
            ]
        },
        {
            key: "Korábbi tevékenységek, munkahelyek",
            label: "Korábbi munkahelyek és tevékenységek",
            helpText: "Legfeljebb 3 korábbi munkahely és tevékenység megadása.",
            groups: [
                {
                    key: "Korábbi tevékenységek, munkahelyek",
                    isArray: true,
                    arrayMax: 3,
                    arrayAddLabel: "Új tevékenység hozzáadása",
                    fields: [
                        {
                            key: "Intézmény",
                            type: "text",
                            helpText: "A korábbi munkahely intézményének megnevezése."
                        },
                        {
                            key: "Szervezeti egység",
                            type: "text",
                            helpText:
                                "A korábbi munkahely szervezeti egységének megnevezése. Egyetemi munkahely esetén kérjük a kar és a tanszék megnevezését is feltüntetni."
                        },
                        {
                            key: "Beosztás",
                            type: "text",
                            helpText: "A korábbi munkahelyen betöltött beosztás megnevezése."
                        },
                        {
                            key: "Időtartam",
                            type: "yearRange",
                            helpText: "A korábbi munkahelyen töltött időszak (kezdő év - záró év)."
                        }
                    ]
                }
            ]
        },
        {
            key: "Nyelvismeret",
            groups: [
                {
                    key: "Nyelvismeret",
                    isArray: true,
                    arrayAddLabel: "Új nyelv hozzáadása",
                    fields: [
                        {
                            key: "Nyelv",
                            type: "text",
                            helpText: "A nyelv megnevezése."
                        },
                        {
                            key: "Képesség",
                            type: "select",
                            value: "komplex",
                            helpText: "A nyelvvizsga képességének típusa (pl. írásbeli, szóbeli, komplex).",
                            attribs: {
                                type: "képesség",
                                options: ["írásbeli", "szóbeli", "komplex"]
                            }
                        },
                        {
                            key: "Típus",
                            type: "text",
                            helpText: "A nyelvvizsga típusa (pl. állami, ECL, Euroexam)."
                        },
                        {
                            key: "Szint",
                            type: "text",
                            helpText: "A nyelvvizsga szintje (pl. A1, A2, B1, B2, C1, C2)."
                        },
                        {
                            key: "Kiállító és szám",
                            type: "text",
                            helpText: "A nyelvvizsgát kiállító intézmény megnevezése és a vizsga száma."
                        }
                    ]
                }
            ]
        },
        {
            key: "Szakterületek",
            groups: [
                {
                    key: "Szakterületek",
                    fields: [
                        {
                            key: "Szakterületek felsorolása",
                            label: "Szakterületek felsorolása (max. 500 karakter)",
                            type: "longtext",
                            helpText:
                                "A szakterületek, kutatási területek megnevezése, vesszővel elválasztva, szóközökkel együtt legfeljebb 500 karakter hosszúságban.",
                            attribs: {
                                maxLength: 500,
                                rows: 3
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
