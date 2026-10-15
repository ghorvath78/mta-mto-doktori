import type { GroupDescriptor, PageDescriptor } from "@repo/form-engine";
import { MAX_NOMINATORS, nominatorLoadedKey, nominatorNameKey, nominatorPrefix } from "./nominators";

function nominatorHabitusOpinionGroup(index: number): GroupDescriptor {
    const prefix = nominatorPrefix(index);
    return {
        key: `${index}. előterjesztő habitusvéleménye`,
        conditionKey: nominatorLoadedKey(index),
        readonly: true,
        noPersist: true,
        fields: [
            {
                key: "Előterjesztő neve",
                type: "text",
                readonly: true,
                valueSource: nominatorNameKey(index)
            },
            {
                key: "Véleménye",
                type: "text",
                readonly: true,
                valueSource: `${prefix}|Összefoglaló javaslat|Összefoglaló javaslat|Összefoglaló javaslat|Javaslat`
            },
            {
                key: "Rövid értekezéssel is",
                type: "text",
                readonly: true,
                conditionKey: "Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Formája",
                conditionValue: "rövid értekezés",
                valueSource: `${prefix}|Összefoglaló javaslat|Javaslat a rövid értekezés benyújtásáról|Javaslat a rövid értekezés benyújtásáról|Javaslat`
            }
        ]
    };
}

export const palyazoAdatai: PageDescriptor = {
    key: "Pályázó adatai",
    conditionKey: "__meta|Habitusvizsgálat lefolytatható", // = bizottsagiform.tsx: HABITUSVIZSGALAT_LEFOLYTATHATO_KEY
    conditionValue: "true",
    attribs: {
        conditionUnmetBehavior: "disable"
    },
    sections: [
        {
            key: "A pályázó személyes adatai",
            helpText: "A kérelmező személyes adatai a kérelmezői adatlapból kerülnek átvételre.",
            groups: [
                {
                    key: "A pályázó személyes adatai",
                    noPersist: true,
                    fields: [
                        {
                            key: "A doktori mű szerzője",
                            type: "text",
                            readonly: true,
                            valueSource: "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|Név"
                        },
                        {
                            key: "Születési adatok",
                            type: "birthYearPlace",
                            readonly: true,
                            valueSource: "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|Születési adatok"
                        },
                        {
                            key: "MTMT azonosító",
                            type: "mtmtUser",
                            readonly: true,
                            valueSource: "Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|MTMT azonosító"
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
                    readonly: true,
                    isArray: true,
                    noPersist: true,
                    valueSource: "Kérelmezői|A kérelmező főbb adatai|Aktuális munkahelyek|Aktuális munkahelyek",
                    fields: [
                        { key: "Intézmény", type: "text", readonly: true },
                        { key: "Szervezeti egység", type: "text", readonly: true },
                        { key: "Beosztás", type: "text", readonly: true },
                        { key: "Kezdete", type: "year", readonly: true }
                    ]
                }
            ]
        },
        {
            key: "Az előterjesztők véleménye a kérelmező doktori habitusáról",
            helpText:
                'Az egyes előterjesztők záró javaslata a kérelmező doktori habitusáról, az előterjesztői adatlapok "Javaslat" lapjáról átvéve. Ez a szekció csak megjelenít, a bizottságnak itt nem kell semmit megadnia.',
            description: "Az előterjesztők a tudományos munkássága alapján alkalmasnak tartják-e a kérelmezőt az MTA doktora cím megszerzésére",
            groups: Array.from({ length: MAX_NOMINATORS }, (_, i) => nominatorHabitusOpinionGroup(i + 1))
        }
    ]
};
