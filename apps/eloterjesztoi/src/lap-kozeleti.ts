import type { PageDescriptor } from "@repo/form-engine";
import { applicantDataLoaded } from "./atoms";
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
                    isArray: true,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|TDK témavezetés|Lista",
                    readonly: true,
                    noPersist: true,
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
                    label: "",
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
                    label: "",
                    isArray: true,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben|Lista",
                    readonly: true,
                    noPersist: true,
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "Intézmény és szervezeti egység",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Tantárgy neve",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Oktatói munka jellege",
                            type: "text",
                            attribs: {
                                colWidth: "80"
                            }
                        },
                        {
                            key: "Képzési szint",
                            type: "text",
                            attribs: {
                                colWidth: "60"
                            }
                        },
                        {
                            key: "Időszak",
                            type: "yearRange",
                            attribs: {
                                colWidth: "55"
                            }
                        }
                    ]
                },
                {
                    key: "Link",
                    label: "",
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Tevékenység igazoló linkje",
                            type: "link",
                            valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben|Link|Tevékenység igazoló linkje",
                            readonly: true,
                            attribs: {
                                noAlign: true,
                                short: true
                            }
                        }
                    ]
                },
                {
                    key: "Értékelés",
                    label: "",
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
                    label: "",
                    isArray: true,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók|Lista",
                    readonly: true,
                    noPersist: true,
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
                            type: "text",
                            attribs: {
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
                    fields: [
                        {
                            key: "Fokozatott szerzett doktoranduszok száma",
                            label: "Összes fokozatott szerzett doktoranduszok száma (témavezetői arányokkal súlyozva)",
                            valueSource:
                                "Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók|Összes|Fokozatott szerzett doktoranduszok száma",
                            type: "number",
                            readonly: true,
                            noPersist: true,
                            attribs: {
                                fractional: true,
                                noAlign: true
                            }
                        }
                    ]
                },
                {
                    key: "Értékelés",
                    label: "",
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
                    label: "",
                    isArray: true,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban|Lista",
                    readonly: true,
                    noPersist: true,
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
                            type: "text",
                            attribs: {
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
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Alátámasztó link",
                            valueSource:
                                "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban|Link|Alátámasztó link",
                            type: "link",
                            readonly: true,
                            attribs: {
                                noAlign: true,
                                short: true
                            }
                        }
                    ]
                },
                {
                    key: "Értékelés",
                    label: "",
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
                    label: "",
                    isArray: true,
                    lengthSource:
                        "Kérelmezői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében|Lista",
                    readonly: true,
                    noPersist: true,
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
                                colWidth: "60",
                                short: true
                            }
                        }
                    ]
                },
                {
                    key: "Link",
                    label: "",
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "További információ",
                            label: "Alátámasztó link, ahol a megadott információk igazolása megtalálható",
                            type: "link",
                            readonly: true,
                            attribs: {
                                noAlign: true,
                                short: true
                            },
                            valueSource:
                                "Kérelmezői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében|Link|További információ"
                        }
                    ]
                },
                {
                    key: "Értékelés",
                    label: "",
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
                    label: "",
                    isArray: true,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben|Lista",
                    readonly: true,
                    noPersist: true,
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
                            label: "Szervezet weboldala",
                            type: "link",
                            attribs: {
                                colWidth: "60"
                            }
                        },
                        {
                            key: "Hazai/nemzetközi",
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
                            key: "Tagság",
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
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Alátámasztó link",
                            label: "Alátámasztó link, ahol a megadott információk igazolása megtalálható",
                            type: "link",
                            readonly: true,
                            attribs: {
                                noAlign: true,
                                short: true
                            },
                            valueSource:
                                "Kérelmezői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben|Link|Alátámasztó link"
                        }
                    ]
                },
                {
                    key: "Értékelés",
                    label: "",
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
                    label: "",
                    isArray: true,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig|Lista",
                    readonly: true,
                    noPersist: true,
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
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Alátámasztó link",
                            label: "Alátámasztó link, ha nem szerepel a folyóirat honlapján",
                            type: "link",
                            readonly: true,
                            attribs: {
                                noAlign: true,
                                short: true
                            },
                            valueSource:
                                "Kérelmezői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig|Link|Alátámasztó link"
                        }
                    ]
                },
                {
                    key: "Értékelés",
                    label: "",
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
                    label: "",
                    noPersist: true,
                    readonly: true,
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
                            type: "link",
                            noPersist: true,
                            readonly: true,
                            valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Részvétel tudományos minősítésben|Összesítés|Alátámasztó link",
                            attribs: {
                                short: true
                            }
                        }
                    ]
                },
                {
                    key: "Értékelés",
                    label: "",
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
            groups: [
                {
                    key: "Lista",
                    label: "",
                    isArray: true,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat|Lista",
                    readonly: true,
                    noPersist: true,
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "A pályázat címe",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Támogatási összeg",
                            type: "text",
                            attribs: {
                                colWidth: "70"
                            }
                        },
                        {
                            key: "Hazai/nemzetközi",
                            type: "text",
                            attribs: {
                                colWidth: "60"
                            }
                        },
                        {
                            key: "Funkció",
                            type: "text",
                            attribs: {
                                colWidth: "60"
                            }
                        },
                        {
                            key: "Futamidő",
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
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Alátámasztó link",
                            type: "link",
                            readonly: true,
                            attribs: {
                                noAlign: true,
                                short: true
                            },
                            valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat|Link|Alátámasztó link"
                        }
                    ]
                },
                {
                    key: "Értékelés",
                    label: "",
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
                    label: "",
                    isArray: true,
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Külföldi tartózkodás|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Külföldi tartózkodás|Lista",
                    readonly: true,
                    noPersist: true,
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "A meghívó neve, helyszín",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "A tartózkodás jellege",
                            type: "text",
                            attribs: {
                                colWidth: "90"
                            }
                        },
                        {
                            key: "Finanszírozás forrása",
                            type: "text",
                            attribs: {
                                colWidth: "90"
                            }
                        },
                        {
                            key: "Mettől-meddig",
                            type: "text",
                            attribs: {
                                colWidth: "90"
                            }
                        }
                    ]
                },
                {
                    key: "Link",
                    label: "",
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Alátámasztó link",
                            type: "link",
                            readonly: true,
                            attribs: {
                                noAlign: true,
                                short: true
                            },
                            valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Külföldi tartózkodás|Link|Alátámasztó link"
                        }
                    ]
                },
                {
                    key: "Értékelés",
                    label: "",
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
                    label: "",
                    lengthSource: "Kérelmezői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés|Lista|_length",
                    valueSource: "Kérelmezői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés|Lista",
                    isArray: true,
                    readonly: true,
                    noPersist: true,
                    attribs: {
                        printTabular: true
                    },
                    fields: [
                        {
                            key: "Kitüntetés megnevezése",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Adományozó szervezet",
                            type: "text",
                            attribs: {
                                colWidth: "*"
                            }
                        },
                        {
                            key: "Ország",
                            type: "text",
                            attribs: {
                                colWidth: "90"
                            }
                        },
                        {
                            key: "Adományozás időpontja",
                            type: "text",
                            attribs: {
                                colWidth: "90"
                            }
                        }
                    ]
                },
                {
                    key: "Link",
                    label: "",
                    readonly: true,
                    noPersist: true,
                    fields: [
                        {
                            key: "Alátámasztó link",
                            type: "link",
                            readonly: true,
                            attribs: {
                                noAlign: true,
                                short: true
                            },
                            valueSource:
                                "Kérelmezői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés|Link|Alátámasztó link"
                        }
                    ]
                },
                {
                    key: "Értékelés",
                    label: "",
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
