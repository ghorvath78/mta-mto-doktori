import { cD, tagText, useField, useSetInfoState, type CustomGroupComponent } from "@repo/form-engine";

// A minősített titkos szavazás lehetséges pontértékei, a megjelenítés (képernyő és PDF) sorrendjében.
export const SECRET_VOTE_POINTS = [5, 4, 3, 2, 1, 0] as const;
const MAX_POINTS_PER_VOTE = 5;

/** Az adott pontértékű szavazatok számát tároló mező kulcsa a szavazócsoporton belül. */
export const secretVoteFieldKey = (points: number) => `${points} pontos szavazatok száma`;

export type SecretVoteResult = {
    totalVotes: number;
    points: number;
    maxPoints: number;
    // a kapott pontszám a megkapható összes pont százalékában, két tizedesjeggyel ("90,00"); null, ha nincs szavazat
    percent: string | null;
};

// A pontértékenkénti szavazatszámokból (SECRET_VOTE_POINTS sorrendben) számolja az összesítést.
// A képernyő és a PDF-export (pdfsaver.ts) egyaránt ezt használja.
export function computeSecretVote(counts: number[]): SecretVoteResult {
    const totalVotes = counts.reduce((sum, n) => sum + n, 0);
    const points = counts.reduce((sum, n, i) => sum + n * SECRET_VOTE_POINTS[i], 0);
    const maxPoints = totalVotes * MAX_POINTS_PER_VOTE;
    const percent =
        maxPoints > 0 ? ((points / maxPoints) * 100).toLocaleString("hu-HU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;
    return { totalVotes, points, maxPoints, percent };
}

// Egy pontérték cellája: felirat ("5 pont"), alatta a szavazatszám mezője "db" utótaggal.
const VoteCountCell = ({ fieldKey, points }: { fieldKey: string; points: number }) => {
    const [value, setValue] = useField(fieldKey);
    return (
        <label className="flex flex-col items-center gap-1 min-w-0">
            <span className="font-medium text-primary-foreground">{points} pont</span>
            <span className="flex items-center gap-1 w-full rounded bg-primary-foreground h-9 px-2">
                <input
                    type="text"
                    inputMode="numeric"
                    className="w-full min-w-0 text-center font-bold text-primary bg-transparent outline-none"
                    value={value ?? ""}
                    placeholder="0"
                    onChange={(e) => setValue(e.target.value.replaceAll(/\D+/g, ""))}
                />
                <span className="text-sm text-gray-500">db</span>
            </span>
        </label>
    );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
    <>
        <div className="text-end font-medium leading-[0.95em]">{label}</div>
        <div>{tagText(value)}</div>
    </>
);

// A bizottság minősített titkos (0-5 pontos) szavazásának eredménye. A pontértékenkénti
// szavazatszámok a csoport mezőiben tárolódnak (ld. evaluationgroups.ts secretVotingResultGroup),
// a szavazatok száma, a kapott és a megkapható pontszám, valamint a százalék számított. A csoport
// attribs.helpText-je a szavazás tárgyát fogalmazza meg (a súgópanelen jelenik meg).
export const SecretVotingResult: CustomGroupComponent = ({ group, keyPrefix }) => {
    const setInfo = useSetInfoState();
    const counts = SECRET_VOTE_POINTS.map((p) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks -- SECRET_VOTE_POINTS fix konstans
        const [value] = useField(`${keyPrefix}|${secretVoteFieldKey(p)}`);
        return cD(value);
    });
    const { totalVotes, points, maxPoints, percent } = computeSecretVote(counts);

    return (
        <div
            className="text-primary-foreground space-y-3 p-1"
            onMouseEnter={() => setInfo({ field: group.attribs?.helpText ?? "" })}
            onMouseLeave={() => setInfo({ field: "" })}
        >
            <div className="font-medium">A minősített titkos szavazáson leadott szavazatok száma pontértékenként:</div>
            {/* auto-fit: annyi oszlop, amennyi kifér - keskeny ablakban több sorba törik */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] gap-2">
                {SECRET_VOTE_POINTS.map((p) => (
                    <VoteCountCell key={p} points={p} fieldKey={`${keyPrefix}|${secretVoteFieldKey(p)}`} />
                ))}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,3fr)] items-center gap-x-2 gap-y-2 pt-2 border-t border-primary-foreground/40">
                <SummaryRow label="Leadott szavazatok száma" value={String(totalVotes)} />
                <SummaryRow label="Kapott pontszám" value={String(points)} />
                <SummaryRow label="Megkapható összes pont" value={String(maxPoints)} />
                <SummaryRow label="Eredmény" value={percent ? `${percent}%` : "-"} />
            </div>
        </div>
    );
};
