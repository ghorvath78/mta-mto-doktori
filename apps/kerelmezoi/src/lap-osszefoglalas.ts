import type { PageDescriptor } from "@/forms";

export const osszefoglalas: PageDescriptor = {
    key: "Munkásság összefoglalása",
    sections: [
        {
            key: "Összefoglaló szövege",
            label: "A doktori címet megalapozó tudományos munkásság rövid összefoglalója",
            helpText:
                "Közérthetően és tömören - szóközökkel együtt legfeljebb 1500 karakter terjedelemben - adja meg azon konkrét új a doktori művében kifejtett tudományos eredményeit, amelyek alapján pályázik a doktori címre. Ez a szöveg jelenik meg a habitusvizsgálat során a bizottság előtt.",
            groups: [
                {
                    key: "Összefoglaló szövege",
                    fields: [
                        {
                            key: "Összefoglaló szövege",
                            label: "",
                            type: "longtext",
                            attribs: {
                                maxLength: 1500,
                                rows: 10
                            }
                        }
                    ]
                }
            ]
        },
        {
            key: "Egyéb közlendők",
            helpText: "Itt adhat meg egyéb, a doktori cím elnyeréséhez kapcsolódó közlendőket, szóközökkel együtt legfeljebb 750 karakter terjedelemben.",
            groups: [
                {
                    key: "Egyéb közlendők",
                    fields: [
                        {
                            key: "Egyéb közlendők",
                            label: "",
                            type: "longtext",
                            attribs: {
                                maxLength: 750,
                                rows: 5
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
