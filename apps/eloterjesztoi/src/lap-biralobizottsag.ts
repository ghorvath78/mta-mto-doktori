import { type PageDescriptor, type FieldDescriptor, getAuthorRecord, store, type FormData } from "@repo/form-engine";
import { applicantDataLoaded } from "./atoms";

const bizottsagiTagFields: FieldDescriptor[] = [
    {
        key: "MTMT azonosító",
        type: "mtmtUser",
        attribs: {
            onMTMTIdChange: (id: string, formData: FormData, fieldKey: string, index: number) => {
                console.log(`MTMT ID changed: ${id} (field: ${fieldKey})`);
                getAuthorRecord(id)
                    .then((data) => {
                        console.log("MTMT user data:", data);
                        const baseKey = fieldKey.split("|").slice(0, -1).join("|");
                        const newNames = [...store.get(formData[`${baseKey}|Név`])];
                        newNames[index] = data.name as string;
                        store.set(formData[`${baseKey}|Név`], newNames);
                        const newAffil = [...store.get(formData[`${baseKey}|Munkahely`])];
                        newAffil[index] = data.affiliations ? (data.affiliations as string[]).join(", ") : "";
                        store.set(formData[`${baseKey}|Munkahely`], newAffil);
                        const newDegrees = [...store.get(formData[`${baseKey}|Tudományos fokozat`])];
                        newDegrees[index] = data.degrees ? (data.degrees as string[]).join(", ") : "";
                        store.set(formData[`${baseKey}|Tudományos fokozat`], newDegrees);
                        const newDisciplines = [...store.get(formData[`${baseKey}|Szakterület`])];
                        newDisciplines[index] = data.disciplines ? (data.disciplines as string[]).join(", ") : "";
                        store.set(formData[`${baseKey}|Szakterület`], newDisciplines);
                        return data;
                    })
                    .catch((error) => {
                        console.error("Error fetching MTMT user data:", error);
                        return null;
                    });
            }
        }
    },
    {
        key: "Név",
        type: "text"
    },
    {
        key: "Tudományos fokozat",
        type: "selectAddOther",
        helpText: "Az előterjesztő tudományos fokozata (PhD, MTA doktora, MTA levelező tagja, MTA rendes tagja).",
        attribs: {
            type: "fokozat",
            options: ["PhD", "MTA doktora", "MTA levelező tagja", "MTA rendes tagja"]
        }
    },
    {
        key: "Szakterület",
        type: "text"
    },
    {
        key: "Munkahely",
        type: "text"
    }
];

export const biraloBizottsag: PageDescriptor = {
    key: "Bíráló bizottság",
    enabledAtom: applicantDataLoaded,
    sections: [
        {
            key: "Hivatalos bírálók",
            groups: [
                {
                    key: "Hivatalos bírálók",
                    isArray: true,
                    arrayMin: 3,
                    arrayMax: 3,
                    arrayAddLabel: "Új bíráló hozzáadása",
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Tartalék bírálók",
            groups: [
                {
                    key: "Tartalék bírálók",
                    isArray: true,
                    arrayMin: 3,
                    arrayMax: 3,
                    arrayAddLabel: "Új bíráló hozzáadása",
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Bíráló bizottság elnöke",
            groups: [
                {
                    key: "Bíráló bizottság elnöke",
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Bíráló bizottság titkára",
            groups: [
                {
                    key: "Bíráló bizottság titkára",
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Bíráló bizottság tartalék elnöke",
            groups: [
                {
                    key: "Bíráló bizottság tartalék elnöke",
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Bíráló bizottság tartalék titkára",
            groups: [
                {
                    key: "Bíráló bizottság tartalék titkára",
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Bíráló bizottság tagjai",
            groups: [
                {
                    key: "Bíráló bizottság tagjai",
                    isArray: true,
                    arrayMin: 5,
                    arrayMax: 5,
                    arrayAddLabel: "Új tag hozzáadása",
                    fields: [...bizottsagiTagFields]
                }
            ]
        },
        {
            key: "Bíráló bizottság tartalék tagjai",
            groups: [
                {
                    key: "Bíráló bizottság tartalék tagjai",
                    isArray: true,
                    arrayMin: 5,
                    arrayMax: 5,
                    arrayAddLabel: "Új tag hozzáadása",
                    fields: [...bizottsagiTagFields]
                }
            ]
        }
    ]
};
