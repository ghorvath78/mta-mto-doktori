import type { GroupDescriptor } from "@repo/form-engine";
import { NominatorOpinions } from "./customgroups/nominatoropinions";
import "./customgroups/votepercentage";

// A bizottság nyílt szavazásának eredménye (igen/nem szavazatok + számított támogatottság). A
// helpText az "Igen szavazatok száma" mezőhöz kerül, a szavazás tárgyát fogalmazza meg.
// A PDF-ben a támogatottság sorát a pdfsaver.ts addVotePercentageRow függvénye illeszti be.
export function votingResultGroup(key: string, helpText: string): GroupDescriptor {
    return {
        key,
        label: "Szavazás eredménye",
        attribs: {
            important: true
        },
        fields: [
            {
                key: "Igen szavazatok száma",
                type: "number",
                attribs: { primaryBackground: true },
                helpText
            },
            {
                key: "Nem szavazatok száma",
                type: "number",
                attribs: { primaryBackground: true }
            },
            {
                key: "Támogatottság",
                type: "votePercentage",
                attribs: { primaryBackground: true },
                noPersist: true
            }
        ]
    };
}

// Csak-olvasható csoport, amely a betöltött előterjesztők véleményét jeleníti meg egy adott,
// "Előterjesztői|..."-vel kezdődő teljes kulcsra vonatkozóan (igen/nem és/vagy szöveges vélemény).
export function nominatorOpinionsGroup(opts: { key: string; label?: string; yesNoPath?: string; textPath?: string }): GroupDescriptor {
    return {
        key: opts.key,
        label: opts.label ?? "Az előterjesztők véleménye",
        noPersist: true,
        customComponent: NominatorOpinions,
        attribs: {
            yesNoPath: opts.yesNoPath,
            textPath: opts.textPath
        },
        fields: []
    };
}

// A bizottság saját, szerkesztendő (important) véleménye: igen/nem + szöveges indoklás.
export function bizottsagiOpinionGroup(opts: { key: string; yesNoLabel: string; textLabel: string; maxLength?: number; rows?: number }): GroupDescriptor {
    return {
        key: opts.key,
        label: "A bizottság véleménye",
        attribs: {
            important: true
        },
        fields: [
            {
                key: "Bizottsági vélemény",
                label: opts.yesNoLabel,
                type: "decisionYesNo"
            },
            {
                key: "Bizottsági indoklás",
                label: opts.textLabel,
                type: "decisionText",
                attribs: {
                    maxLength: opts.maxLength ?? 1500,
                    rows: opts.rows ?? 6
                }
            }
        ]
    };
}
