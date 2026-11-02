import type { GroupDescriptor } from "@repo/form-engine";
import { NominatorOpinions } from "./customgroups/nominatoropinions";
import { SECRET_VOTE_POINTS, SecretVotingResult, secretVoteFieldKey } from "./customgroups/secretvoting";
import "./customgroups/votepercentage";

// Az illetékességről és a formai alkalmasságról szóló szavazás tárgya (votingResultGroup helpText-je).
export const ALLASPONT_SZAVAZAS_HELP =
    "A fentiekben kialakult álláspontot a bizottság vita után egyszerű többségi, tartózkodásmentes nyílt szavazással az alábbi szavazati eredménnyel támasztotta alá.";

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

// A bizottság minősített titkos (0-5 pontos) szavazásának eredménye: pontértékenként a leadott
// szavazatok száma (tárolt mezők), a többit a SecretVotingResult komponens számolja. A PDF-ben a
// pdfsaver.ts getSecretVotingContent függvénye nyomtatja, a képernyővel azonos mondatos formában.
export function secretVotingResultGroup(key: string, helpText: string): GroupDescriptor {
    return {
        key,
        label: "Szavazás eredménye",
        customComponent: SecretVotingResult,
        attribs: {
            important: true,
            helpText
        },
        fields: SECRET_VOTE_POINTS.map((p) => ({ key: secretVoteFieldKey(p), type: "number" }))
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
