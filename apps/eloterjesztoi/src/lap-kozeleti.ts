import type { PageDescriptor } from "@repo/form-engine";
import { applicantDataLoaded } from "./atoms";
import { TabularList } from "./customgroups/tabularlist";
import { PublicActivitySummary } from "./customgroups/publicactivitysummary";

export const kozeletiTevekenyseg: PageDescriptor = {
    key: "Tudományos közéleti tevékenység",
    enabledAtom: applicantDataLoaded,
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
                    customComponent: TabularList,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés|Lista",
                    fields: [],
                    attribs: {
                        colNames: "Hallgató neve|OTDK éve|OTDK szekció|Helyezés|Igazoló link",
                        colWidths: "*,40,*,50,40"
                    }
                },
                {
                    key: "Összesítés",
                    label: "OTDK-n díjazott dolgozatok száma összesen:",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés|Lista|_length",
                    conditionValue: "1",
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "I. díjas",
                            type: "number",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés|Összesítés|I. díjas"
                        },
                        {
                            key: "II. díjas",
                            type: "number",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés|Összesítés|II. díjas"
                        },
                        {
                            key: "III. díjas",
                            type: "number",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés|Összesítés|III. díjas"
                        },
                        {
                            key: "Különdíjas",
                            type: "number",
                            readonly: true,
                            noPersist: true,
                            valueSource: "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés|Összesítés|Különdíjas"
                        }
                    ]
                },
                {
                    key: "Értékelés",
                    label: "Értékelés:",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Követelmény teljesül",
                            label: "A kérelmező a minimumkövetelményeknek megfelel",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Vélemény indoklása legfeljebb 750 karakterben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 750,
                                rows: 3
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
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
                    label: "Tevékenységek listája:",
                    customComponent: TabularList,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben|Lista",
                    fields: [],
                    attribs: {
                        colNames: "Intézmény és szervezeti egység|Tantárgy neve|Oktatói munka jellege|Képzési szint|Időszak",
                        colWidths: "*,*,80,60,55",
                        extraLabel: "Tevékenység igazoló linkje",
                        extraInfo: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben|Link|Tevékenység igazoló linkje"
                    }
                },
                {
                    key: "Értékelés",
                    label: "Értékelés:",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Követelmény teljesül",
                            label: "A kérelmező a minimumkövetelményeknek megfelel",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Vélemény indoklása legfeljebb 750 karakterben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 750,
                                rows: 3
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
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
                    label: "Témavezetések listája:",
                    customComponent: TabularList,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók|Lista",
                    fields: [],
                    attribs: {
                        colNames: "Hallgató neve|Témavezetés|Doktori iskola|Fokozatszerzés éve",
                        colWidths: "*,80,*,80",
                        extraLabel: "Fokozatot szerzett doktoranduszok száma",
                        extraInfo:
                            "Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók|Összes|Fokozatot szerzett doktoranduszok száma"
                    }
                },
                {
                    key: "Értékelés",
                    label: "Értékelés:",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Követelmény teljesül",
                            label: "A kérelmező a minimumkövetelményeknek megfelel",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Vélemény indoklása legfeljebb 750 karakterben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 750,
                                rows: 3
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
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
                    label: "Tevékenységek listája:",
                    customComponent: TabularList,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban|Lista",
                    fields: [],
                    attribs: {
                        colNames: "A testület megnevezése|Hazai/nemzetközi|Részvételi szerep|Időszak",
                        colWidths: "*,60,*,80",
                        extraLabel: "Alátámasztó link",
                        extraInfo: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban|Link|Alátámasztó link"
                    }
                },
                {
                    key: "Értékelés",
                    label: "Értékelés:",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Követelmény teljesül",
                            label: "A kérelmező a minimumkövetelményeknek megfelel",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Vélemény indoklása legfeljebb 750 karakterben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 750,
                                rows: 3
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
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
                    label: "Tevékenységek listája:",
                    customComponent: TabularList,
                    lengthSource:
                        "Kérelmezői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében|Lista",
                    fields: [],
                    attribs: {
                        colNames: "A rendezvény pontos címe és ideje|A rendező ország|Szervezői/előadói szerep leírása|Alátámasztó weblink",
                        colWidths: "*,80,100,60",
                        extraLabel: "További információ",
                        extraInfo:
                            "Kérelmezői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében|Link|További információ"
                    }
                },
                {
                    key: "Értékelés",
                    label: "Értékelés:",
                    conditionKey:
                        "Kérelmezői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Követelmény teljesül",
                            label: "A kérelmező a minimumkövetelményeknek megfelel",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Vélemény indoklása legfeljebb 750 karakterben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 750,
                                rows: 3
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
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
                    label: "Tevékenységek listája:",
                    customComponent: TabularList,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben|Lista",
                    fields: [],
                    attribs: {
                        colNames: "A szervezet neve|A szervezet weboldala|Hazai/nemzetközi|Tisztsége|Tagság",
                        colWidths: "*,60,60,90,80",
                        extraLabel: "Alátámasztó link",
                        extraInfo:
                            "Kérelmezői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben|Link|Alátámasztó link"
                    }
                },
                {
                    key: "Értékelés",
                    label: "Értékelés:",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Követelmény teljesül",
                            label: "A kérelmező a minimumkövetelményeknek megfelel",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Vélemény indoklása legfeljebb 750 karakterben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 750,
                                rows: 3
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
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
                    label: "Tevékenységek listája:",
                    customComponent: TabularList,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig|Lista",
                    fields: [],
                    attribs: {
                        colNames: "A folyóirat neve|A folyóirat weboldala|Besorolás|Tisztsége|Mettől-meddig",
                        colWidths: "*,60,60,90,80",
                        extraLabel: "Alátámasztó link",
                        extraInfo: "Kérelmezői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig|Link|Alátámasztó link"
                    }
                },
                {
                    key: "Értékelés",
                    label: "Értékelés:",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Követelmény teljesül",
                            label: "A kérelmező a minimumkövetelményeknek megfelel",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Vélemény indoklása legfeljebb 750 karakterben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 750,
                                rows: 3
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
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
                    label: "Összesítő táblázat",
                    noPersist: true,
                    fields: [
                        {
                            key: "MTA doktora értekezés bírálója",
                            type: "number",
                            helpText: "Adja meg, hány alkalommal bírált MTA doktora értekezést.",
                            noPersist: true,
                            readonly: true,
                            valueSource:
                                "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos minősítésben|Összesítés|MTA doktora értekezés bírálója"
                        },
                        {
                            key: "MTA doktori bírálóbizottság titkára",
                            type: "number",
                            helpText: "Adja meg, hány alkalommal volt MTA doktori bírálóbizottság titkára.",
                            noPersist: true,
                            readonly: true,
                            valueSource:
                                "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos minősítésben|Összesítés|MTA doktori bírálóbizottság titkára"
                        },
                        {
                            key: "PhD vagy kandidátusi értekezés bírálója",
                            type: "number",
                            helpText: "Adja meg, hány alkalommal bírált PhD vagy kandidátusi értekezést.",
                            noPersist: true,
                            readonly: true,
                            valueSource:
                                "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos minősítésben|Összesítés|PhD vagy kandidátusi értekezés bírálója"
                        },
                        {
                            key: "PhD bírálóbizottság titkára",
                            type: "number",
                            helpText: "Adja meg, hány alkalommal volt PhD bírálóbizottság titkára.",
                            noPersist: true,
                            readonly: true,
                            valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos minősítésben|Összesítés|PhD bírálóbizottság titkára"
                        },
                        {
                            key: "Alátámasztó link",
                            label: "Adja meg a linket, ahol a részvételét tudományos minősítésben tudja igazolni (pl. felkérőlevelek másolatai)",
                            type: "link",
                            noPersist: true,
                            readonly: true,
                            valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos minősítésben|Összesítés|Alátámasztó link",
                            attribs: {
                                inline: "false"
                            }
                        }
                    ]
                },
                {
                    key: "Értékelés",
                    label: "Értékelés:",
                    fields: [
                        {
                            key: "Követelmény teljesül",
                            label: "A kérelmező a minimumkövetelményeknek megfelel",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Vélemény indoklása legfeljebb 750 karakterben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 750,
                                rows: 3
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
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
                    label: "Tevékenységek listája:",
                    customComponent: TabularList,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat|Lista",
                    fields: [],
                    attribs: {
                        colNames: "A pályázat címe|Támogatási összeg|Hazai/nemzetközi|Funkció|Futamidő",
                        colWidths: "*,70,60,60,80",
                        extraLabel: "Alátámasztó link",
                        extraInfo: "Kérelmezői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat|Link|Alátámasztó link"
                    }
                },
                {
                    key: "Értékelés",
                    label: "Értékelés:",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Követelmény teljesül",
                            label: "A kérelmező a minimumkövetelményeknek megfelel",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Vélemény indoklása legfeljebb 750 karakterben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 750,
                                rows: 3
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
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
                    label: "Tevékenységek listája:",
                    customComponent: TabularList,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Külföldi tartózkodás|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Külföldi tartózkodás|Lista",
                    fields: [],
                    attribs: {
                        colNames: "A meghívó neve, helyszín|A tartózkodás jellege|Finanszírozás forrása|Mettől-meddig",
                        colWidths: "*,85,85,90",
                        extraLabel: "Alátámasztó link",
                        extraInfo: "Kérelmezői|Tudományos közéleti tevékenység|Külföldi tartózkodás|Link|Alátámasztó link"
                    }
                },
                {
                    key: "Értékelés",
                    label: "Értékelés:",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Külföldi tartózkodás|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Követelmény teljesül",
                            label: "A kérelmező a minimumkövetelményeknek megfelel",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Vélemény indoklása legfeljebb 750 karakterben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 750,
                                rows: 3
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
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
                    label: "Tevékenységek listája:",
                    customComponent: TabularList,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés|Lista",
                    fields: [],
                    attribs: {
                        colNames: "Kitüntetés megnevezése|Adományozó szervezet|Ország|Adományozás időpontja",
                        colWidths: "*,*,90,90",
                        extraLabel: "Alátámasztó link",
                        extraInfo:
                            "Kérelmezői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés|Link|Alátámasztó link"
                    }
                },
                {
                    key: "Értékelés",
                    label: "Értékelés:",
                    conditionKey: "Kérelmezői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés|Lista|_length",
                    conditionValue: "1",
                    fields: [
                        {
                            key: "Követelmény teljesül",
                            label: "A kérelmező a minimumkövetelményeknek megfelel",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Vélemény indoklása legfeljebb 750 karakterben",
                            type: "decisionText",
                            attribs: {
                                maxLength: 750,
                                rows: 3
                            }
                        }
                    ],
                    attribs: {
                        important: true
                    }
                }
            ]
        },
        {
            key: "Tudományos közéleti tevékenység értékelése",
            attribs: {
                important: true,
                alwaysOpen: true
            },
            groups: [
                {
                    key: "Összesítés",
                    noPersist: true,
                    customComponent: PublicActivitySummary,
                    fields: []
                },
                {
                    key: "Értékelés",
                    fields: [
                        {
                            key: "Követelmény teljesül",
                            label: "A kérelmező a minimumkövetelményeknek megfelel",
                            type: "decisionYesNo"
                        },
                        {
                            key: "Indoklás",
                            label: "Vélemény indoklása legfeljebb 750 karakterben",
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
