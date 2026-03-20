import type { PageDescriptor } from "@/forms";

export const doktoriMu: PageDescriptor = {
    key: "A doktori mű adatai",
    sections: [
        {
            key: "Az eljárás alapjául szolgáló doktori mű",
            groups: [
                {
                    key: "Az eljárás alapjául szolgáló doktori mű",
                    fields: [
                        {
                            key: "Címe",
                            type: "longtext",
                            helpText: "A doktori mű címe, szóközökkel együtt legfeljebb 250 karakter hosszúságban.",
                            attribs: {
                                maxLength: 250,
                                rows: 2
                            }
                        },
                        {
                            key: "Formája",
                            type: "select",
                            helpText:
                                'Válassza ki a benyújtott mű típusát! "Rövid értekezés" választása csak kiemelkedő tudományos teljesítmény (kitűnő habitus) és szigorú minőségi követelmények (D1/Q1 cikkek) esetén lehetséges. Könyv esetén az elmúlt 3 évben megjelent, egyszerzős monográfia fogadható el. A három különböző forma esetén eltérő további adatok megadása szükséges.',
                            attribs: {
                                type: "forma",
                                options: ["értekezés", "monográfia vagy könyv", "rövid értekezés"]
                            },
                            value: "értekezés"
                        },
                        {
                            key: "Tudományág",
                            type: "select",
                            helpText: "A doktori mű tudományága.",
                            attribs: {
                                type: "tudományág",
                                options: [
                                    "Anyagtudomány és technológia",
                                    "Áramlás- és hőtechnika",
                                    "Automatizálás és számítástechnika",
                                    "Elektronikus eszközök és technológiák",
                                    "Elektrotechnika",
                                    "Energetika",
                                    "Építészet",
                                    "Gépszerkezettan",
                                    "Informatika",
                                    "Közlekedés- és járműtudomány",
                                    "Metallurgia",
                                    "Szál- és kompozittechnológia",
                                    "Szilárd testek mechanikája",
                                    "Távközlés",
                                    "Vízgazdálkodás-tudomány"
                                ]
                            },
                            value: "Anyagtudomány és technológia"
                        },
                        {
                            key: "Illetékes bizottság",
                            type: "select",
                            helpText: "A doktori mű illetékes tudományos bizottsága.",
                            attribs: {
                                type: "bizottság",
                                options: [
                                    "Anyagtudományi és Technológiai Tudományos Bizottság",
                                    "Áramlás- és Hőtechnikai Tudományos Bizottság",
                                    "Automatizálási és Számítástechnikai Tudományos Bizottság",
                                    "Elektronikus Eszközök és Technológiák Tudományos Bizottsága",
                                    "Elektrotechnikai Tudományos Bizottság",
                                    "Energetikai Tudományos Bizottság",
                                    "Építészeti Tudományos Bizottság",
                                    "Gépszerkezettani Tudományos Bizottság",
                                    "Informatikai Tudományos Bizottság",
                                    "Közlekedés- és Járműtudományi Bizottság",
                                    "Metallurgiai Tudományos Bizottság",
                                    "Szál- és Kompozittechnológiai Tudományos Bizottság",
                                    "Szilárd Testek Mechanikája Tudományos Bizottság",
                                    "Távközlési Tudományos Bizottság",
                                    "Vízgazdálkodástudományi Bizottság"
                                ]
                            },
                            value: "Anyagtudományi és Technológiai Tudományos Bizottság"
                        }
                    ]
                }
            ]
        },
        {
            key: "D1 közlemények listája",
            label: "SJR D1 besorolású tudományos közleményeinek listája",
            conditionKey: "Kérelmezői|Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája",
            conditionValue: "rövid értekezés",
            hidden: true,
            groups: [
                {
                    key: "D1 közlemények listája",
                    isArray: true,
                    arrayAddLabel: "Új közlemény hozzáadása",
                    fields: [
                        {
                            key: "Cikk MTMT azonosítója",
                            type: "mtmtPub",
                            attribs: {
                                type: "journal",
                                minRank: "D1",
                                unique: true
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Téziseket alátámasztó publikációk",
            label: "A téziseket alátámasztó legalább Q1 besorolású cikkek (max. 6)",
            helpText: "Csak legalább Q1 besorolású, legfeljebb 3 szerzős cikkek adhatók meg.",
            conditionKey: "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája",
            conditionValue: "rövid értekezés",
            groups: [
                {
                    key: "Téziseket alátámasztó publikációk",
                    isArray: true,
                    arrayMax: 6,
                    arrayAddLabel: "Új publikáció hozzáadása",
                    fields: [
                        {
                            key: "Cikk MTMT azonosítója",
                            type: "mtmtPub",
                            helpText:
                                "A cikk MTMT azonosítója. A listában csak Q1 besorolású folyóiratokban megjelent cikkek választhatók, miután a Fő adatok szekcióban megadta az MTMT azonosítóját.",
                            attribs: {
                                type: "journal",
                                minRank: "Q1",
                                maxAuthors: 3,
                                unique: true
                            }
                        },
                        {
                            key: "Saját hozzájárulás összefoglalása",
                            type: "longtext",
                            helpText:
                                "A cikkben végzett saját kutatási hozzájárulásának rövid összefoglalója, szóközökkel együtt legfeljebb 750 karakter terjedelemben.",
                            attribs: {
                                maxLength: 750,
                                rows: 5
                            }
                        },
                        {
                            key: "1. társszerző hozzájárulása",
                            type: "longtext",
                            helpText:
                                "Az első társszerző (amennyiben van) feladata/hozzájárulása a cikkhez, szóközökkel együtt legfeljebb 750 karakter terjedelemben.",
                            attribs: {
                                maxLength: 750,
                                rows: 5
                            }
                        },
                        {
                            key: "2. társszerző hozzájárulása",
                            type: "longtext",
                            helpText:
                                "A második társszerző (amennyiben van) feladata/hozzájárulása a cikkhez, szóközökkel együtt legfeljebb 750 karakter terjedelemben.",
                            attribs: {
                                maxLength: 750,
                                rows: 5
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Könyv adatai",
            conditionKey: "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája",
            conditionValue: "monográfia vagy könyv",
            helpText:
                "Könyv benyújtásával a pályázó közlés alatt álló, vagy a kérelem benyújtása előtt legfeljebb 3 évvel megjelent önálló, egyszerzős könyvben közölt saját, jól azonosítható eredményeivel pályázhat. Ebben az esetben is eredményeinek jelentős részét korábban a szakterület meghatározó nemzetközi folyóirataiban publikálnia kell. A könyvet a tudományág meghatározó tudományos kiadóinak egyike kell, hogy megjelentesse, a pályázó egyszerzős monográfiájaként. Követelmény, hogy a bírálók és az olvasók a részletes levezetéseket megtalálják a műben. Lényeges, hogy nem magát a könyv egészét, hanem a pályázó abban foglalt eredményeit bírálják el, ezért ebben az esetben is fontos szerep jut a tézisfüzetnek, ahol a tézispontok megfogalmazására, kialakítására ugyanazok az előírások vonatkoznak, mint értekezés benyújtása esetén.",
            groups: [
                {
                    key: "Könyv adatai",
                    fields: [
                        {
                            key: "Könyv MTMT azonosítója",
                            type: "mtmtPub",
                            attribs: {
                                type: "book"
                            }
                        },
                        {
                            key: "Elérhetőség",
                            type: "link",
                            helpText:
                                "Ha megjelenés előtt álló könyvről van szó, akkor itt adja meg az elérhetőséget. Ha a kiadó korlátozza a közzétételt, akkor az MTA Könyvtárát adja meg."
                        }
                    ]
                }
            ]
        }
    ]
};
