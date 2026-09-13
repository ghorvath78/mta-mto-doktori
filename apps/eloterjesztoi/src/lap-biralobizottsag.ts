import { type PageDescriptor } from "@repo/form-engine";
import {
    COMMITTEE_PAGE_KEY,
    CommitteeChecker,
    CommitteeDndProvider,
    CommitteeRoleKey,
    CommitteeTable,
    committeeRole,
    committeeSection,
    type CommitteeCheckerDeps
} from "@repo/committee";
import { getApplicantAuthorRecord, getCommonPubsWithApplicant } from "@/eloterjesztoiform";

const extraHelp =
    "Ha lehet, az MTMT azonosító segítségével adja hozzá a javasolt személyeket, ami megkönnyíti az összeférhetetlenség ellenőrzését, valamint az adatok átvételével gyorsítja a kitöltést.\n\nAz egyetemi mukahelyet tanszéki, a kutatóhelyit csoport szinten szükséges megadni az összeférhetetlenség ellenőrzhetősége miatt. (Az MTMT azonosító alapján felvitt személyek esetében ezek az adatok általában megfelelően kitöltődnek, ha nem, manuálisan kell kiegészíteni.)";

// A bizottsági tagok táblái (szakasz- és csoportkulcsok, mezőkulcsok, DnD, MTMT-hozzáadás,
// ellenőrzés) a @repo/committee csomagból jönnek - ugyanezeket használja a bizottsági adatlap is.
const section = (roleKey: string, helpText: string) => committeeSection(committeeRole(roleKey), helpText, CommitteeTable);

const checkerDeps: CommitteeCheckerDeps = {
    getApplicantAffiliations: () => getApplicantAuthorRecord()?.affiliations ?? [],
    getCommonPubsWithApplicant
};

export const biraloBizottsag: PageDescriptor = {
    key: COMMITTEE_PAGE_KEY,
    conditionKey: "__meta|Kérelmezői adatlap betöltve", // = eloterjesztoiform.tsx: APPLICANT_DATA_LOADED_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    wrapperComponent: CommitteeDndProvider,
    sections: [
        section(
            CommitteeRoleKey.biralok,
            "Javaslat 3 hivatalos bírálóra. Maximum 1 bíráló lehet PhD vagy kandidátusi fokozatú, a többinek legalább MTA (vagy tudomány) doktora címmel kell rendelkeznie. Figyeljen arra, hogy a javasolt személyek valamennyien ne legyenek összeférhetetlenek a pályázóval, tudományterületi kompetenciájuk fedje le a pályázat tudományterületeit, és munkahely szempontjából minél sokszínűbb legyen a bírálóbizottság.\n\n" +
                extraHelp
        ),
        section(
            CommitteeRoleKey.tartalekBiralok,
            "Javaslat 3 tartalék bírálóra. Az 1. bíráló tartaléka az 1. tartalék bíráló, a 2. bíráló tartaléka a 2. tartalék bíráló, stb. A fokozati követelmények megegyeznek a hivatalos bírálókéval.\n\n" +
                extraHelp
        ),
        section(
            CommitteeRoleKey.elnok,
            "Javaslat a bíráló bizottság elnökére. Szokásosan az MTO akadémikus tagjai közül kerül ki.\n\n" + extraHelp
        ),
        section(CommitteeRoleKey.titkar, "Javaslat a bíráló bizottság titkárára. Szokásosan PhD vagy kandidátusi fokozatú személy.\n\n" + extraHelp),
        section(
            CommitteeRoleKey.tartalekElnok,
            "Javaslat a bíráló bizottság tartalék elnökére. Az MTA Doktori Tanáccsal történt megállapodás alapján a tartalék elnököt mindunképpen felkéri a DT az ülésen történő részvételre bizottsági tagként, hogy váratlan akadályoztatás esetén is biztonságosan megtartható legyen a védés.\n\n" +
                extraHelp
        ),
        section(CommitteeRoleKey.tartalekTitkar, "Javaslat a bíráló bizottság tartalék titkárára.\n\n" + extraHelp),
        section(
            CommitteeRoleKey.tagok,
            "Javaslat a bíráló bizottság 5 tagjára. Az 5 tagból maximum egy lehet PhD vagy kandidátusi fokozattal rendelkező, de csak akkor, ha a bírálók és tartalékaik mind legalább MTA (vagy tudomány) doktora címmel rendelkeznek.\n\n" +
                extraHelp
        ),
        section(
            CommitteeRoleKey.tartalekTagok,
            "Javaslat 5 tartalék bizottsági tagra. Az első helyen megjelölt bizottsági tag tartaléka az első helyen megjelölt tartalék tag, stb.\n\n" + extraHelp
        ),
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
                        noPrint: true,
                        checkerDeps
                    },
                    customComponent: CommitteeChecker,
                    fields: []
                }
            ]
        }
    ]
};
