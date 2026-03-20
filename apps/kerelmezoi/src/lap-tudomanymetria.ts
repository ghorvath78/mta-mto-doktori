import type { PageDescriptor } from "@/forms";

export const tudomanymetria: PageDescriptor = {
    key: "Tudománymetria",
    sections: [
        {
            key: "Tudománymetriai táblázat",
            helpText:
                "A tudománymetriai táblázat adatai automatikusan töltődnek az MTMT-ben megadott publikációs lista alapján. Ha az MTMT azonosító megadása óta változott a publikációs lista, kérjük, frissítse az adatokat a gombra kattintva.",
            groups: [
                {
                    key: "Tudománymetriai táblázat",
                    fields: [
                        {
                            key: "Tudománymetriai táblázat",
                            type: "mtmtTable"
                        }
                    ]
                }
            ]
        }
    ]
};
