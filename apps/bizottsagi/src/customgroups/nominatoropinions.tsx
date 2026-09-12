import { useFieldValue, type CustomGroupComponent } from "@repo/form-engine";
import { nominatorPrefix, useNominatorSlots } from "../nominators";

// Egy sor: az adott előterjesztő igen/nem és/vagy szöveges véleménye. A group.attribs-ban megadott
// yesNoPath/textPath az előterjesztői form saját mezőjének RELATÍV útvonala (a gyökér
// "Előterjesztő<n>" szegmens NÉLKÜL), pl. "Tudományos minimumkövetelmények|...|Követelmény teljesül".
const NominatorOpinionRow = ({
    index,
    name,
    fokozat,
    yesNoPath,
    textPath,
    isLast
}: {
    index: number;
    name: string;
    fokozat: string;
    yesNoPath?: string;
    textPath?: string;
    isLast: boolean;
}) => {
    const yesNo = useFieldValue(yesNoPath ? `${nominatorPrefix(index)}|${yesNoPath}` : "");
    const text = useFieldValue(textPath ? `${nominatorPrefix(index)}|${textPath}` : "");

    return (
        <div className={`pb-1 ${isLast ? "" : "border-b border-dotted border-primary"}`}>
            <div className="font-semibold flex items-center gap-2">
                <span>
                    {name || `${index}. előterjesztő`}
                    {fokozat ? ` (${fokozat})` : ""}
                </span>
                {yesNoPath && <span className="uppercase">{yesNo || "Nincs megadva"}</span>}
            </div>
            {textPath && (
                <div className="whitespace-pre-wrap">
                    {text || <span className="italic text-gray-500">Szöveges vélemény nincs megadva</span>}
                </div>
            )}
        </div>
    );
};

// Generikus, csak-olvasható komponens, amely az összes betöltött előterjesztő véleményét
// megjeleníti egy adott "Előterjesztő<n>|..." mezőre vonatkozóan (igen/nem és/vagy szöveges
// vélemény). A konkrét (relatív) kulcsokat a group.attribs adja meg:
//   attribs: { yesNoPath?: string; textPath?: string }
// Ha yesNoPath nincs megadva (mert az adott előterjesztői mezőnek nincs igen/nem párja), csak a
// szöveg jelenik meg.
export const NominatorOpinions: CustomGroupComponent = ({ group }) => {
    const yesNoPath = group.attribs?.yesNoPath as string | undefined;
    const textPath = group.attribs?.textPath as string | undefined;

    const slots = useNominatorSlots();

    if (slots.length === 0) {
        return <div className="italic text-gray-500">Nincs betöltött előterjesztői vélemény.</div>;
    }

    return (
        <div className="space-y-2">
            {slots.map((slot, i) => (
                <NominatorOpinionRow
                    key={slot.index}
                    index={slot.index}
                    name={slot.name}
                    fokozat={slot.fokozat}
                    yesNoPath={yesNoPath}
                    textPath={textPath}
                    isLast={i === slots.length - 1}
                />
            ))}
        </div>
    );
};
