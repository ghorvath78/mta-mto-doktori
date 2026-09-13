import type { PageDescriptor } from "@repo/form-engine";
import {
    COMMITTEE_PAGE_KEY,
    CommitteeChecker,
    CommitteeRoleKey,
    CommitteeTable,
    committeeRole,
    committeeSection,
    type CommitteeCheckerDeps
} from "@repo/committee";
import { BiraloBizottsagWrapper } from "./customgroups/nominatorproposals";
import { getApplicantAffiliations, getCommonPubsWithApplicant } from "./bizottsagiform";

// A táblák, a kulcsok és az ellenőrzés a @repo/committee csomagból jönnek - pontosan ugyanazok,
// amiket az előterjesztői adatlap használ (ld. apps/eloterjesztoi/src/lap-biralobizottsag.ts),
// így az itt összeállított javaslat adatszerkezete is azonos az előterjesztőivel.
const section = (roleKey: string, helpText: string) => committeeSection(committeeRole(roleKey), helpText, CommitteeTable);

const extraHelp =
    'A lap tetején lévő "Előterjesztői javaslatok" sávból bármelyik előterjesztő teljes javaslata átvehető, illetve egy-egy név chipre kattintva (vagy a táblába húzva) egyenként is átemelhető. A sávban lévő számok azt jelzik, hányadik előterjesztő javasolta az adott személyt, a pipa pedig azt, hogy a bizottság javaslatában már szerepel.\n\nA táblák sorai a fogantyúval átrendezhetők és a szerepek között át is húzhatók. Egy sorra kattintva az adatok szerkeszthetők.';

const checkerDeps: CommitteeCheckerDeps = {
    getApplicantAffiliations,
    getCommonPubsWithApplicant
};

export const biraloBizottsag: PageDescriptor = {
    key: COMMITTEE_PAGE_KEY,
    conditionKey: "__meta|Habitusvizsgálat lefolytatható", // = bizottsagiform.tsx: HABITUSVIZSGALAT_LEFOLYTATHATO_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    wrapperComponent: BiraloBizottsagWrapper,
    sections: [
        section(
            CommitteeRoleKey.biralok,
            "A bizottság javaslata 3 hivatalos bírálóra. Maximum 1 bíráló lehet PhD vagy kandidátusi fokozatú, a többinek legalább MTA (vagy tudomány) doktora címmel kell rendelkeznie. Figyeljen arra, hogy a javasolt személyek valamennyien ne legyenek összeférhetetlenek a pályázóval, tudományterületi kompetenciájuk fedje le a pályázat tudományterületeit, és munkahely szempontjából minél sokszínűbb legyen a bírálóbizottság.\n\n" +
                extraHelp
        ),
        section(
            CommitteeRoleKey.tartalekBiralok,
            "A bizottság javaslata 3 tartalék bírálóra. Az 1. bíráló tartaléka az 1. tartalék bíráló, a 2. bíráló tartaléka a 2. tartalék bíráló, stb. A fokozati követelmények megegyeznek a hivatalos bírálókéval.\n\n" +
                extraHelp
        ),
        section(
            CommitteeRoleKey.elnok,
            "A bizottság javaslata a bíráló bizottság elnökére. Szokásosan az MTO akadémikus tagjai közül kerül ki.\n\n" + extraHelp
        ),
        section(
            CommitteeRoleKey.titkar,
            "A bizottság javaslata a bíráló bizottság titkárára. Szokásosan PhD vagy kandidátusi fokozatú személy.\n\n" + extraHelp
        ),
        section(
            CommitteeRoleKey.tartalekElnok,
            "A bizottság javaslata a bíráló bizottság tartalék elnökére. Az MTA Doktori Tanáccsal történt megállapodás alapján a tartalék elnököt mindenképpen felkéri a DT az ülésen történő részvételre bizottsági tagként, hogy váratlan akadályoztatás esetén is biztonságosan megtartható legyen a védés.\n\n" +
                extraHelp
        ),
        section(CommitteeRoleKey.tartalekTitkar, "A bizottság javaslata a bíráló bizottság tartalék titkárára.\n\n" + extraHelp),
        section(
            CommitteeRoleKey.tagok,
            "A bizottság javaslata a bíráló bizottság 5 tagjára. Az 5 tagból maximum egy lehet PhD vagy kandidátusi fokozattal rendelkező, de csak akkor, ha a bírálók és tartalékaik mind legalább MTA (vagy tudomány) doktora címmel rendelkeznek.\n\n" +
                extraHelp
        ),
        section(
            CommitteeRoleKey.tartalekTagok,
            "A bizottság javaslata 5 tartalék bizottsági tagra. Az első helyen megjelölt bizottsági tag tartaléka az első helyen megjelölt tartalék tag, stb.\n\n" +
                extraHelp
        ),
        {
            key: "Ellenőrzés",
            helpText:
                "Nyomja meg a gombot az ellenőrzéshez, hogy a javasolt bizottsági tagok megfelelnek-e a követelményeknek, és hogy a hivatalos bírálók és tartalékjaik között nincs-e átfedés. Az ellenőrzés eredménye megjelenik a lap alján, és ha nem felel meg a követelményeknek, akkor a hiányosságok is láthatóvá válnak. Az összeférhetetlenségi és a közös publikációs ellenőrzés a kanonikus (elsőként betöltött) előterjesztő adatlapjában beágyazott MTMT-adatokra épül.",
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
