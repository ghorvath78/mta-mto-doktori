import type { PageDescriptor } from "@/forms";

export const kozeletiTevekenyseg: PageDescriptor = {
    key: "Tudományos közéleti tevékenység",
    sections: [
        {
            key: "TDK témavezetés",
            label: "TDK-téma vezetése (OTDK helyezés és különdíj)",
            helpText:
                "Kizárólag az OTDK helyezések számítanak, helyi TDK eredmény nem megfelelő. A pályázónak legyen legalább:\n• egy I. helyezett; vagy\n• két II., III. helyezett vagy különdíjas\nhallgatója (OTDT honlapon igazolt módon).\n\nLegfeljebb 5 tétel adható meg.",
            groups: [
                {
                    key: "Lista",
                    label: "Témavezetések listája:",
                    isArray: true,
                    arrayMax: 5,
                    arrayAddLabel: "Új TDK témavezetés hozzáadása",
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "Hallgató neve",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "OTDK éve",
                            type: "year",
                            attribs: {
                                colWidth: "40"
                            }
                        },
                        {
                            key: "OTDK szekció",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Helyezés",
                            type: "text",
                            attribs: {
                                colWidth: "50"
                            }
                        },
                        {
                            key: "Igazoló link",
                            type: "link",
                            attribs: {
                                colWidth: "40"
                            }
                        }
                    ]
                },
                {
                    key: "Összesítés",
                    label: "OTDK-n díjazott dolgozatok száma összesen:",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "I. díjas",
                            type: "number"
                        },
                        {
                            key: "II. díjas",
                            type: "number"
                        },
                        {
                            key: "III. díjas",
                            type: "number"
                        },
                        {
                            key: "Különdíjas",
                            type: "number"
                        }
                    ]
                }
            ]
        },
        {
            key: "Részvétel graduális és doktori képzésben",
            label: "Részvétel graduális és doktori képzésben (tárgyelőadó, tárgyfelelős)",
            helpText:
                "Az elmúlt 5 év oktatási tevékenysége. Minimum követelmény:\n• 2 graduális és 1 doktori képzésben meghirdetett tárgy felelőse/előadója; vagy\n• 5 graduális képzésben meghirdetett tárgy felelőse/előadója legalább három szemeszteren át (Neptunban történő vagy más, hitelesen igazolt módon).\n\nLegfeljebb 5 tétel adható meg.",
            groups: [
                {
                    key: "Lista",
                    label: "",
                    isArray: true,
                    arrayMax: 5,
                    arrayAddLabel: "Új részvétel hozzáadása",
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "Intézmény és szervezeti egység",
                            helpText: "Az intézmény neve mellett a kart is kérjük megadni.",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Tantárgy neve",
                            helpText: "A tantárgy teljes neve.",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Oktatói munka jellege",
                            helpText: "Jelölje, milyen jellegű oktatói munkát végzett (pl. tárgy kidolgozása, tárgyfelelős, előadó, gyakorlatvezető stb.).",
                            type: "text",
                            attribs: {
                                colWidth: "80"
                            }
                        },
                        {
                            key: "Képzési szint",
                            type: "select",
                            value: "alapképzés",
                            attribs: {
                                options: ["alapképzés", "mesterképzés", "osztatlan képzés", "doktori képzés"],
                                colWidth: "60"
                            }
                        },
                        {
                            key: "Időszak",
                            type: "yearRange",
                            helpText: "Az oktatói munka időszaka (kezdő és befejező év).",
                            attribs: {
                                colWidth: "55"
                            }
                        }
                    ]
                },
                {
                    key: "Link",
                    label: "",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Tevékenység igazoló linkje",
                            label: "Adjon meg linket, ahol a megadott információk ellenőrizhetők",
                            helpText:
                                "Kérjük, adjon meg egy érvényes URL-t, amely alátámasztó információkat tartalmazó weblapra mutat, vagy az információkat összefűzve tartalmazó PDF-dokumentum letöltési helyére.",
                            type: "link",
                            attribs: {
                                inline: "false"
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Doktori fokozatot szerzett hallgatók",
            label: "Részvétel doktori témavezetésben (fokozatot szerzett hallgatók)",
            helpText:
                "Fokozatot szerzett hallgatók. Legyen (témavezetői arányokkal súlyozva):\n• két sikeresen védett PhD hallgatója, mindkettő 100%-ban; vagy\n• 4 db 50%-ban; vagy\n• 1 db 100%-ban és 2 db 50%-ban.\n\nMagyarországon kiadott PhD esetében a https://doktori.hu/index.php honlapon igazoltan, külföldi PhD esetében az ottani doktori iskola/egyetem igazolása szükséges.\n\nLegfeljebb 5 tétel adható meg.",
            groups: [
                {
                    key: "Lista",
                    isArray: true,
                    arrayMax: 5,
                    arrayAddLabel: "Új témavezetés hozzáadása",
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "Hallgató neve",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Témavezetés",
                            type: "select",
                            value: "egyéni témavezető",
                            attribs: {
                                options: ["egyéni témavezető", "társtémavezető"],
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Doktori iskola",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Fokozatszerzés éve",
                            type: "year",
                            attribs: {
                                colWidth: "80"
                            }
                        }
                    ]
                },
                {
                    key: "Összes",
                    label: "",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Fokozatott szerzett doktoranduszok száma",
                            label: "Összes fokozatott szerzett doktorandusz száma a témavezetési arányokat (egyéni/társ) figyelembe véve",
                            type: "number",
                            attribs: {
                                inline: "false",
                                fractional: true
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Részvétel tudományos zsűriben, kuratóriumban, bírálatokban",
            helpText:
                "Részvétel tudományos zsűriben, kuratóriumban, jelentős tudományos presztízsű hazai vagy nemzetközi kutatási projekt- és ösztöndíjpályázatok bírálatában (pályázatnál kérjük a felhívás és a kiíró szervezet pontos megnevezését is).\n\nElfogadhatónak tekinthető:\n• 1 db nemzetközi pályázat (pl. ERC, Horizon, MSCA, Fulbright stb.) bírálata; vagy\n• 5 db hazai pályázat (pl. OTKA, NKKP, TÉT, egyéb NKFIH pályázatok, Bolyai-, Magyar Állami Eötvös Ösztöndíj stb.) bírálata.\n\nLegfeljebb 5 tétel adható meg.",
            groups: [
                {
                    key: "Lista",
                    isArray: true,
                    arrayMax: 5,
                    arrayAddLabel: "Új részvétel hozzáadása",
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "A testület megnevezése",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Hazai/nemzetközi",
                            type: "select",
                            value: "hazai",
                            attribs: {
                                options: ["hazai", "nemzetközi"],
                                colWidth: "60"
                            }
                        },
                        {
                            key: "Részvételi szerep",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Időszak",
                            type: "text",
                            attribs: {
                                colWidth: "80"
                            }
                        }
                    ]
                },
                {
                    key: "Link",
                    label: "",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Alátámasztó link",
                            label: "Alátámasztó link, ahol a megadott információk igazolása megtalálható",
                            helpText:
                                "Kérjük, adjon meg egy érvényes URL-t, mely alátámasztó információkat tartalmazó weblapra mutat, vagy az információkat összefűzve tartalmazó pdf dokumentum letöltési helyére.",
                            type: "link",
                            attribs: {
                                inline: "false"
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében",
            label: "Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében, plenáris előadások",
            helpText:
                "Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében vagy azokon meghívott/plenáris előadó. A felkérésnek/megjelenésnek a konferencia, kongresszus honlapján, hivatalos programfüzetében láthatónak kell lennie vagy igazoló oklevelet kell mellékelni.\n\nLegfeljebb 5 tétel adható meg.",
            groups: [
                {
                    key: "Lista",
                    isArray: true,
                    arrayMax: 5,
                    arrayAddLabel: "Új részvétel hozzáadása",
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "A rendezvény pontos címe és ideje",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "A rendező ország",
                            type: "text",
                            attribs: {
                                colWidth: "80"
                            }
                        },
                        {
                            key: "Szervezői/előadói szerep leírása",
                            type: "text",
                            attribs: {
                                colWidth: "100"
                            }
                        },
                        {
                            key: "Alátámasztó weblink",
                            type: "link",
                            attribs: {
                                colWidth: "60"
                            }
                        }
                    ]
                },
                {
                    key: "Link",
                    label: "",
                    conditionKey:
                        "Kérelmezői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "További információ",
                            label: "Alátámasztó link, ahol a megadott információk igazolása megtalálható",
                            helpText:
                                "Kérjük, adjon meg egy érvényes URL-t, mely alátámasztó információkat tartalmazó weblapra mutat, vagy az információkat összefűzve tartalmazó pdf dokumentum letöltési helyére.",
                            type: "link",
                            attribs: {
                                inline: "false"
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Tisztség, kiemelt/választott tagság tudományos szervezetben",
            label: "Tisztség, kiemelt/választott tagság hazai és/vagy nemzetközi tudományos szervezetben",
            helpText:
                "Tisztség, kiemelt/választott tagság hazai és/vagy nemzetközi tudományos szervezetben legalább egy évig. Nem tagság, hanem tisztség fogadható el, mint például elnök, titkár, senior member, advisory committee/board member, president/chair, deputy president/chair, secretary.\n\nLegfeljebb 5 tétel adható meg.",
            groups: [
                {
                    key: "Lista",
                    isArray: true,
                    arrayMax: 5,
                    arrayAddLabel: "Új tisztség hozzáadása",
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "A szervezet neve",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "A szervezet weboldala",
                            type: "link",
                            attribs: {
                                colWidth: "60"
                            }
                        },
                        {
                            key: "Hazai/nemzetközi",
                            type: "select",
                            value: "hazai",
                            attribs: {
                                options: ["hazai", "nemzetközi"],
                                colWidth: "60"
                            }
                        },
                        {
                            key: "Tisztsége",
                            type: "text",
                            attribs: {
                                colWidth: "90"
                            }
                        },
                        {
                            key: "Tagság",
                            type: "yearRange",
                            attribs: {
                                colWidth: "80"
                            }
                        }
                    ]
                },
                {
                    key: "Link",
                    label: "",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Alátámasztó link",
                            label: "Alátámasztó link, ahol a megadott információk igazolása megtalálható",
                            helpText:
                                "Adja meg a linket, ahol a megadott információk elérhetők (vagy adjon meg egy linket, ahol a megadott anyagok igazolása megtalálható, pl. felkérő levelek).",
                            type: "link",
                            attribs: {
                                inline: "false"
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Folyóirat-szerkesztőbizottsági tagság legalább 2 évig",
            helpText:
                "Folyóirat-szerkesztőbizottsági tagság legalább 2 évig. A tagság időszakában a külföldi folyóirat legyen a norvég listában 1 vagy 2 besorolású és a Scopus-ban D1, Q1, Q2 minősítésű, a magyar nyelvű folyóirat A kategóriás minősítésű.\n\nLegfeljebb 5 tétel adható meg.",
            groups: [
                {
                    key: "Lista",
                    isArray: true,
                    arrayMax: 5,
                    arrayAddLabel: "Új tagság hozzáadása",
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "A folyóirat neve",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "A folyóirat weboldala",
                            type: "link",
                            attribs: {
                                colWidth: "60"
                            }
                        },
                        {
                            key: "Besorolás",
                            type: "text",
                            attribs: {
                                colWidth: "60"
                            }
                        },
                        {
                            key: "Tisztsége",
                            type: "text",
                            attribs: {
                                colWidth: "90"
                            }
                        },
                        {
                            key: "Mettől-meddig",
                            type: "text",
                            attribs: {
                                colWidth: "80"
                            }
                        }
                    ]
                },
                {
                    key: "Link",
                    label: "",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Alátámasztó link",
                            label: "Ha nem szerepel a folyóirat honlapján, adjon meg alátámasztó linket",
                            helpText:
                                "Ha nem szerepel a folyóirat honlapján (pl. a folyóirat megszűnt), adjon meg linket, ahol megtalálható az információ, vagy amivel igazolni tudja a megadott információkat.",
                            type: "link",
                            attribs: {
                                inline: "false"
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Részvétel tudományos minősítésben",
            label: "Részvétel tudományos minősítésben (bíráló, bírálóbizottsági titkár)",
            helpText:
                "Elvárások: Legyen legalább:\n• 3 doktori (PhD) dolgozat bírálója; vagy\n• 1 MTA doktori értekezés bírálója; vagy\n• 2 MTA doktori bírálóbizottság titkára; vagy\n• 2 doktori (PhD) dolgozat bírálója, és ezzel egyidejűleg 3 PhD bírálóbizottságban titkár.",
            groups: [
                {
                    key: "Összesítés",
                    fields: [
                        {
                            key: "MTA doktora értekezés bírálója",
                            type: "number",
                            helpText: "Adja meg, hány alkalommal bírált MTA doktora értekezést."
                        },
                        {
                            key: "MTA doktori bírálóbizottság titkára",
                            type: "number",
                            helpText: "Adja meg, hány alkalommal volt MTA doktori bírálóbizottság titkára."
                        },
                        {
                            key: "PhD vagy kandidátusi értekezés bírálója",
                            type: "number",
                            helpText: "Adja meg, hány alkalommal bírált PhD vagy kandidátusi értekezést."
                        },
                        {
                            key: "PhD bírálóbizottság titkára",
                            type: "number",
                            helpText: "Adja meg, hány alkalommal volt PhD bírálóbizottság titkára."
                        },
                        {
                            key: "Alátámasztó link",
                            label: "Adja meg a linket, ahol a részvételét tudományos minősítésben tudja igazolni (pl. felkérőlevelek másolatai)",
                            type: "link",
                            attribs: {
                                inline: "false"
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Elnyert tudományos pályázat",
            helpText:
                "Elnyert pályázatok témavezetőként.\n\nMinimum követelmény: legyen legalább\n• 2 db NKFIH által kezelt pályázat (pl. “OTKA” K, FK, PD; ERC starting vagy advanced; PIAC; GINOP) témavezetője; vagy\n• 1 db Lendület csoport vezetője; vagy\n• 1 db rangos (ERC, HORIZON, HORIZON 2020) nemzetközi pályázat vezetője, alprojekt-/munkacsoport-munkaszakasz dokumentált vezetője.\n\nLegfeljebb 5 tétel adható meg.",
            groups: [
                {
                    key: "Lista",
                    isArray: true,
                    arrayMax: 5,
                    arrayAddLabel: "Új pályázat hozzáadása",
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "A pályázat címe",
                            type: "text",
                            helpText: "Adja meg a pályázat címét, azonosítóját, kiíróját.",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Támogatási összeg",
                            type: "text",
                            helpText: "Adja meg a pályázat támogatási összegét.",
                            attribs: {
                                colWidth: "70"
                            }
                        },
                        {
                            key: "Hazai/nemzetközi",
                            type: "select",
                            value: "hazai",
                            helpText: "Adja meg, hogy a pályázat hazai vagy nemzetközi.",
                            attribs: {
                                options: ["hazai", "nemzetközi"],
                                colWidth: "60"
                            }
                        },
                        {
                            key: "Funkció",
                            type: "selectAddOther",
                            value: "témavezető",
                            attribs: {
                                options: ["témavezető", "alprojektvezető", "munkacsoportvezető"],
                                colWidth: "60"
                            },
                            helpText:
                                "Adja meg a pályázatban betöltött funkcióját (témavezető, résztvevő). Ha egyéb funkciót töltött be, válassza az 'egyéb' opciót, és adja meg a pontos funkciót."
                        },
                        {
                            key: "Futamidő",
                            type: "text",
                            helpText: "Adja meg a pályázat futamidejét (pl. 2020-2023). Ha még folyamatban van, jelezze (pl. 2021-folyamatban).",
                            attribs: {
                                colWidth: "80"
                            }
                        }
                    ]
                },
                {
                    key: "Link",
                    label: "",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Alátámasztó link",
                            label: "Adja meg a linket, ahol az elnyert tudományos pályázatot tudja igazolni",
                            helpText:
                                "Adja meg a linket, ahol az elnyert tudományos pályázatot tudja igazolni (vagy ahonnan a vonatkozó dokumentumokat egybefűzve le lehet tölteni).",
                            type: "link",
                            attribs: {
                                inline: "false"
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Külföldi tartózkodás",
            label: "Külföldi szakmai munka",
            helpText:
                "Külföldi szakmai tanulmányút vagy külföldi szakmai munkavállalás vagy külföldi vendégprofesszori/vendégkutatói megbízás (min. 3 hónap) vagy külföldi posztdoktori állás betöltése (a fogadó intézmény saját forrásból fedezi, a nyertest több jelöltből választják ki, a tartózkodás pedig min. 6 hónapos. Hallgatói (alap-, mester és doktori képzés alatti) féléváthallgatások nem számítanak. \n\nLegfeljebb 5 tétel adható meg.",
            groups: [
                {
                    key: "Lista",
                    isArray: true,
                    arrayMax: 5,
                    arrayAddLabel: "Új tartózkodás hozzáadása",
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "A meghívó neve, helyszín",
                            type: "text",
                            helpText: "A meghívó intézmény, egység megnevezése, helyszíne.",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "A tartózkodás jellege",
                            type: "text",
                            helpText: "Adja meg a tartózkodás jellegét (pl. tanulmányút, munkavállalás, vendégprofesszori megbízás).",
                            attribs: {
                                colWidth: "90"
                            }
                        },
                        {
                            key: "Finanszírozás forrása",
                            type: "text",
                            helpText: "Szponzor/ösztöndíj (ahol releváns).",
                            attribs: {
                                colWidth: "90"
                            }
                        },
                        {
                            key: "Mettől-meddig",
                            type: "text",
                            helpText: "A tartózkodás időtartama (pl. 2020.03-2020.09).",
                            attribs: {
                                colWidth: "90"
                            }
                        }
                    ]
                },
                {
                    key: "Link",
                    label: "",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Külföldi tartózkodás|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Alátámasztó link",
                            label: "Adja meg a linket, ahol a külföldi tartózkodást tudja igazolni",
                            helpText:
                                "Adja meg a linket, ahol a tanulmányutat, külföldi szakmai munkavállalás, külföldi vendégprofesszori/vendégkutatói megbízás vagy külföldi posztdoktori állás betöltése tudja igazolni (pl. igazolás, meghívólevél).",
                            type: "link",
                            attribs: {
                                inline: "false"
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Állami vagy MTA által adományozott tudományos díj, kitüntetés",
            helpText:
                "Pl. Magyar Érdemrend és Érdemkereszt különböző fokozatai, Eötvös József-díj, Apáczai Csere János-díj, Trefort Ágoston-díj, Szent-Györgyi Albert-díj, Akadémiai Ifjúsági Díj, Akadémiai Díj, Bolyai-plakett, Széchenyi-díj, Kossuth-díj, Gábor Dénes-díj, illetve jelentős külföldi tudományos díj, amelynek elfogadásához a TB indoklása szükséges a habitus vizsgálat során (kari, egyetemi, vállalati kitüntetések nem számítanak).\n\nLegfeljebb 5 tétel adható meg.",
            groups: [
                {
                    key: "Lista",
                    isArray: true,
                    arrayMax: 5,
                    arrayAddLabel: "Új díj, kitüntetés hozzáadása",
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "Kitüntetés megnevezése",
                            type: "text",
                            helpText: "A díj, kitüntetés megnevezése, jellege.",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Adományozó szervezet",
                            type: "text",
                            helpText: "Adja meg az adományozó szervezet nevét.",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Ország",
                            type: "text",
                            helpText: "Adja meg az ország nevét, ahol a díjat, kitüntetést adományozták.",
                            attribs: {
                                colWidth: "90"
                            }
                        },
                        {
                            key: "Adományozás időpontja",
                            type: "text",
                            helpText: "A díj, kitüntetés adományozásának időpontja (pl. 2020.03.01).",
                            attribs: {
                                colWidth: "90"
                            }
                        }
                    ]
                },
                {
                    key: "Link",
                    label: "",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Alátámasztó link",
                            label: "Adja meg a linket, ahol az elnyert állami vagy MTA által adományozott tudományos díjakat, kitüntetéseket igazolni tudja",
                            helpText:
                                "Adja meg a linket, ahol az elnyert állami vagy MTA által adományozott tudományos díjakat, kitüntetéseket igazolni tudja (pl. a vonatkozó dokumentumokat összefűzve).",
                            type: "link",
                            attribs: {
                                inline: "false"
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
