import { type PageDescriptor, type FieldDescriptor } from "@repo/form-engine";
import { CommitteeTable, CommitteeDndProvider, CommitteeChecker } from "./customgroups/committeetable";
import { applicantDataLoaded } from "./atoms";

const bizottsagiTagFields: FieldDescriptor[] = [
    {
        key: "MTMT azonosító",
        type: "mtmtUser",
        attribs: { noPrint: true }
    },
    {
        key: "Név",
        type: "text",
        attribs: {
            colWidth: "120"
        }
    },
    {
        key: "Tudományos fokozat",
        label: "Fokozat",
        type: "selectAddOther",
        helpText: "A javasolt személy tudományos fokozata.",
        attribs: {
            type: "fokozat",
            options: ["PhD", "Kandidátus", "Tudomány doktora", "MTA doktora", "MTA levelező tagja", "MTA rendes tagja", "MTA külső tagja"],
            colWidth: "80"
        }
    },
    {
        key: "Szakterület",
        type: "text",
        attribs: {
            colWidth: "*"
        }
    },
    {
        key: "Munkahely",
        type: "text",
        attribs: {
            colWidth: "*"
        }
    }
];

export const biraloBizottsag: PageDescriptor = {
    key: "Bíráló bizottság",
    enabledAtom: applicantDataLoaded,
    wrapperComponent: CommitteeDndProvider,
    sections: [
        {
            key: "Hivatalos bírálók",
            helpText:
                "Javaslat 3 hivatalos bírálóra. Maximum 1 bíráló lehet PhD vagy kandidátusi fokozatú, a többinek legalább MTA (vagy tudomány) doktora címmel kell rendelkeznie. Figyeljen arra, hogy a javasolt személyek valamennyien ne legyenek összeférhetetlenek a pályázóval, tudományterületi kompetenciájuk fedje le a pályázat tudományterületeit, és munkahely szempontjából minél sokszínűbb legyen a bírálóbizottság.\n\nHa lehet, az MTMT azonosító segítségével adja hozzá a javasolt személyeket, ami megkönnyíti az összeférhetetlenség ellenőrzését, valamint az adatok átvételével gyorsítja a kitöltést.",
            groups: [
                {
                    key: "Hivatalos bírálók",
                    isArray: true,
                    arrayMin: 0,
                    arrayMax: 3,
                    customComponent: CommitteeTable,
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Tartalék bírálók",
            helpText:
                "Javaslat 3 tartalék bírálóra. Az 1. bíráló tartaléka az 1. tartalék bíráló, a 2. bíráló tartaléka a 2. tartalék bíráló, stb. A fokozati követelmények megegyeznek a hivatalos bírálókéval.\n\nHa lehet, az MTMT azonosító segítségével adja hozzá a javasolt személyeket, ami megkönnyíti az összeférhetetlenség ellenőrzését, valamint az adatok átvételével gyorsítja a kitöltést.",
            groups: [
                {
                    key: "Tartalék bírálók",
                    isArray: true,
                    arrayMin: 0,
                    arrayMax: 3,
                    customComponent: CommitteeTable,
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Bíráló bizottság elnöke",
            helpText:
                "Javaslat a bíráló bizottság elnökére. Szokásosan az MTO akadémikus tagjai közül kerül ki.\n\nHa lehet, az MTMT azonosító segítségével adja hozzá a javasolt személyt, ami megkönnyíti az összeférhetetlenség ellenőrzését, valamint az adatok átvételével gyorsítja a kitöltést.",
            groups: [
                {
                    key: "Bíráló bizottság elnöke",
                    isArray: true,
                    arrayMin: 0,
                    arrayMax: 1,
                    customComponent: CommitteeTable,
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Bíráló bizottság titkára",
            helpText:
                "Javaslat a bíráló bizottság titkárára. Szokásosan PhD vagy kandidátusi fokozatú személy.\n\nHa lehet, az MTMT azonosító segítségével adja hozzá a javasolt személyt, ami megkönnyíti az összeférhetetlenség ellenőrzését, valamint az adatok átvételével gyorsítja a kitöltést.",
            groups: [
                {
                    key: "Bíráló bizottság titkára",
                    isArray: true,
                    arrayMin: 0,
                    arrayMax: 1,
                    customComponent: CommitteeTable,
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Bíráló bizottság tartalék elnöke",
            helpText:
                "Javaslat a bíráló bizottság tartalék elnökére. Az MTA Doktori Tanáccsal történt megállapodás alapján a tartalék elnököt mindunképpen felkéri a DT az ülésen történő részvételre bizottsági tagként, hogy váratlan akadályoztatás esetén is biztonságosan megtartható legyen a védés.\n\nHa lehet, az MTMT azonosító segítségével adja hozzá a javasolt személyt, ami megkönnyíti az összeférhetetlenség ellenőrzését, valamint az adatok átvételével gyorsítja a kitöltést.",
            groups: [
                {
                    key: "Bíráló bizottság tartalék elnöke",
                    isArray: true,
                    arrayMin: 0,
                    arrayMax: 1,
                    customComponent: CommitteeTable,
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Bíráló bizottság tartalék titkára",
            helpText:
                "Javaslat a bíráló bizottság tartalék titkárára.\n\nHa lehet, az MTMT azonosító segítségével adja hozzá a javasolt személyt, ami megkönnyíti az összeférhetetlenség ellenőrzését, valamint az adatok átvételével gyorsítja a kitöltést.",
            groups: [
                {
                    key: "Bíráló bizottság tartalék titkára",
                    isArray: true,
                    arrayMin: 0,
                    arrayMax: 1,
                    customComponent: CommitteeTable,
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Bíráló bizottság tagjai",
            helpText:
                "Javaslat a bíráló bizottság 5 tagjára. Az 5 tagból maximum egy lehet PhD vagy kandidátusi fokozattal rendelkező, de csak akkor, ha a bírálók és tartalékaik mind legalább MTA (vagy tudomány) doktora címmel rendelkeznek.\n\nHa lehet, az MTMT azonosító segítségével adja hozzá a javasolt személyeket, ami megkönnyíti az összeférhetetlenség ellenőrzését, valamint az adatok átvételével gyorsítja a kitöltést.",
            groups: [
                {
                    key: "Bíráló bizottság tagjai",
                    isArray: true,
                    arrayMin: 0,
                    arrayMax: 5,
                    customComponent: CommitteeTable,
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Bíráló bizottság tartalék tagjai",
            helpText:
                "Javaslat 5 tartalék bizottsági tagra. Az első helyen megjelölt bizottsági tag tartaléka az első helyen megjelölt tartalék tag, stb.\n\nHa lehet, az MTMT azonosító segítségével adja hozzá a javasolt személyeket, ami megkönnyíti az összeférhetetlenség ellenőrzését, valamint az adatok átvételével gyorsítja a kitöltést.",
            groups: [
                {
                    key: "Bíráló bizottság tartalék tagjai",
                    isArray: true,
                    arrayMin: 0,
                    arrayMax: 5,
                    customComponent: CommitteeTable,
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Ellenőrzés",
            helpText:
                "Nyomja meg a gombot az ellenőrzéshez, hogy a javasolt bizottsági tagok megfelelnek-e a követelményeknek, és hogy a hivatalos bírálók és tartalékjaik között nincs-e átfedés. Az ellenőrzés eredménye megjelenik a lap alján, és ha nem felel meg a követelményeknek, akkor a hiányosságok is láthatóvá válnak. Az ellenőrzés akkor a leghatásosabb, ha a lehető legtöbb bizottsági tag az MTMT-n keresztül került hozzáadásra, de a manuálisan megadott adatok is ellenőrzésre kerülnek.",
            attribs: {
                alwaysOpen: true,
                important: true,
                noPrint: true
            },
            groups: [
                {
                    key: "Ellenőrzés",
                    attribs: {
                        noPersist: true,
                        noPrint: true
                    },
                    customComponent: CommitteeChecker,
                    fields: []
                }
            ]
        }
    ]
};
