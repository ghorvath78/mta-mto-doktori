import type { PageDescriptor } from "@/forms";

export const alkotasok: PageDescriptor = {
    key: "Műszaki alkotások",
    sections: [
        {
            key: "Műszaki alkotások megadása",
            helpText:
                "A pályázónak lehetősége van megadni maximum 5 jelentős műszaki alkotását, amelyek között az alábbiak szerepeltethetők:\n1. Elfogadott hazai és nemzetközi szabadalmak - kérjük adja meg a szabadalom MTMT linkjét, ahol megtekinthetők a társalkotók, a szabadalom lajstromszáma, címe.\n2. Jelentős építészeti alkotások (az Építészeti Tudományos bizottsághoz tartozó C kategóriánál) - kérjük, adja meg a társalkotóit, az alkotás címét, jelentős minősítését (pl. Nívódíj, nemzetközi elismerés, stb.), MTMT linkjét.\n3. Egyéb alkotások - az alkotásban megvalósult tudományos eredményről a pályázónak legalább egy lektorált folyóiratcikkben be kell számolnia, melyre legalább két komoly hivatkozást is kapott.",
            groups: [
                {
                    key: "Műszaki alkotások megadása",
                    isArray: true,
                    arrayAddLabel: "Új műszaki alkotás hozzáadása",
                    arrayMax: 5,
                    fields: [
                        {
                            key: "Műszaki alkotás megnevezése",
                            type: "longtext",
                            helpText:
                                "A műszaki alkotás megnevezése. Csak kiemelkedő megvalósult műszaki alkotásra adható pont. Ezek jellemzője az, hogy vagy beszámolt az alkotásban megvalósult tudományos eredményről legalább egy lektorált folyóiratcikkben, melyre legalább két komoly hivatkozást is kapott, vagy megvalósított szabadalom fűződik hozzá. Szóközökkel együtt legfeljebb 750 karakter terjedelemben.",
                            attribs: {
                                maxLength: 750,
                                rows: 3
                            }
                        },
                        {
                            key: "Műszaki alkotás típusa",
                            type: "select",
                            value: "szabadalom",
                            attribs: {
                                options: ["szabadalom", "építészeti alkotás", "egyéb alkotás"]
                            }
                        },
                        {
                            key: "Kapcsolódó szabadalom",
                            type: "mtmtPub",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "szabadalom",
                            helpText:
                                'A műszaki alkotáshoz kapcsolódó szabadalom MTMT azonosítója. A listában csak a "Fő adatok" szekcióban megadott MTMT azonosítóhoz tartozó közlemények választhatók.',
                            attribs: {
                                type: "patent",
                                unique: true
                            }
                        },
                        {
                            key: "Kapcsolódó publikáció",
                            type: "mtmtPub",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "egyéb alkotás",
                            helpText:
                                'A műszaki alkotáshoz kapcsolódó publikáció MTMT azonosítója. A listában csak a "Fő adatok" szekcióban megadott MTMT azonosítóhoz tartozó közlemények választhatók.',
                            attribs: {
                                unique: true
                            }
                        },
                        {
                            key: "1. legfontosabb hivatkozás",
                            type: "mtmtCitation",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "egyéb alkotás",
                            helpText: "A műszaki alkotáshoz kapcsolódó szabadalom vagy publikáció első legfontosabb hivatkozásának MTMT azonosítója.",
                            attribs: {
                                pubKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Kapcsolódó publikáció",
                                clearable: true
                            }
                        },
                        {
                            key: "2. legfontosabb hivatkozás",
                            type: "mtmtCitation",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "egyéb alkotás",
                            helpText: "A műszaki alkotáshoz kapcsolódó szabadalom vagy publikáció második legfontosabb hivatkozásának MTMT azonosítója.",
                            attribs: {
                                pubKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Kapcsolódó publikáció",
                                clearable: true
                            }
                        },
                        {
                            key: "Egyéb alkotásra hivatkozás linkje",
                            type: "link",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "egyéb alkotás",
                            helpText:
                                "Adja meg a műszaki alkotásra vonatkozó hivatkozás linkjét, ha nincsen az MTMT-ben. A mező végén az ikonra kattintva ellenőrizheti, hogy helyesen adta-e meg a linket."
                        },
                        {
                            key: "Társalkotók",
                            type: "text",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "építészeti alkotás",
                            helpText: "Az építészeti alkotás társalkotóinak felsorolása, vesszővel elválasztva."
                        },
                        {
                            key: "Alkotás minősítése",
                            type: "text",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "építészeti alkotás",
                            helpText: "Az építészeti alkotás minősítésének megadása (pl. nívódíj, nemzetközi elismerés)."
                        },
                        {
                            key: "Alkotás MTMT azonosítója",
                            type: "mtmtPub",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "építészeti alkotás",
                            helpText:
                                'Az építészeti alkotáshoz kapcsolódó publikáció MTMT azonosítója. A listában csak a "Fő adatok" szekcióban megadott MTMT azonosítóhoz tartozó közlemények választhatók.',
                            attribs: {
                                type: "achievement",
                                unique: true
                            }
                        },
                        {
                            key: "Építészeti alkotásra hivatkozás linkje",
                            type: "link",
                            conditionKey: "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása|Műszaki alkotás típusa",
                            conditionValue: "építészeti alkotás",
                            helpText:
                                "Adja meg az építészeti alkotásra vonatkozó hivatkozás linkjét, ha nincsen az MTMT-ben. A mező végén az ikonra kattintva ellenőrizheti, hogy helyesen adta-e meg a linket."
                        }
                    ]
                }
            ]
        }
    ]
};
