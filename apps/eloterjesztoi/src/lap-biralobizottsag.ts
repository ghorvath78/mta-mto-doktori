import { type PageDescriptor, type FieldDescriptor } from "@repo/form-engine";
import { applicantDataLoaded } from "./atoms";
import { CommitteeTable, CommitteeDndProvider } from "./customgroups/committeetable";

const bizottsagiTagFields: FieldDescriptor[] = [
    {
        key: "MTMT azonosító",
        type: "mtmtUser",
        attribs: { noPrint: true }
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
    wrapperComponent: CommitteeDndProvider,
    sections: [
        {
            key: "Hivatalos bírálók",
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
        }
    ]
};
