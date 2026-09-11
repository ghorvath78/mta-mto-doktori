import { getFromObjectByKey, useFieldArrayValue, useFieldValue, type CustomGroupComponent } from "@repo/form-engine";

const NOMINATORS_PREFIX = "Bizottsági|Bizottság|Előterjesztők|Előterjesztők";

// Generikus, csak-olvasható komponens, amely az összes betöltött előterjesztő RawJSON adatából
// kiolvas egy-egy "Előterjesztői|..."-vel kezdődő teljes kulcsot (igen/nem és/vagy szöveges
// vélemény), és névvel/fokozattal együtt megjeleníti. A konkrét kulcsokat a group.attribs adja meg:
//   attribs: { yesNoPath?: string; textPath?: string }
// Ha yesNoPath nincs megadva (mert az adott előterjesztői mezőnek nincs igen/nem párja), csak a
// szöveg jelenik meg.
export const NominatorOpinions: CustomGroupComponent = ({ group }) => {
    const yesNoPath = group.attribs?.yesNoPath as string | undefined;
    const textPath = group.attribs?.textPath as string | undefined;

    const length = parseInt(useFieldValue(`${NOMINATORS_PREFIX}|_length`)) || 0;
    const names = useFieldArrayValue(`${NOMINATORS_PREFIX}|Előterjesztő neve`);
    const fokozatok = useFieldArrayValue(`${NOMINATORS_PREFIX}|Tudományos fokozat`);
    const rawJsons = useFieldArrayValue(`${NOMINATORS_PREFIX}|RawJSON`);

    if (length === 0) {
        return <div className="italic text-gray-500">Nincs betöltött előterjesztői vélemény.</div>;
    }

    return (
        <div className="space-y-2">
            {Array.from({ length }).map((_, i) => {
                const raw = rawJsons[i];
                let json: unknown = null;
                try {
                    json = raw ? JSON.parse(raw) : null;
                } catch {
                    json = null;
                }
                const yesNo = yesNoPath && json ? ((getFromObjectByKey(json, yesNoPath) as string) ?? "") : "";
                const text = textPath && json ? ((getFromObjectByKey(json, textPath) as string) ?? "") : "";

                return (
                    <div key={i} className="border-b border-dotted border-primary pb-1">
                        <div className="font-semibold flex items-center gap-2">
                            <span>
                                {names[i] || `${i + 1}. előterjesztő`}
                                {fokozatok[i] ? ` (${fokozatok[i]})` : ""}
                            </span>
                            {yesNoPath && <span className="uppercase">{yesNo || "Nincs megadva"}</span>}
                        </div>
                        {textPath && (
                            <div className="whitespace-pre-wrap">{text || <span className="italic text-gray-500">Nincs megadva</span>}</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
