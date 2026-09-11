import { useEffect } from "react";
import { getFromObjectByKey, useField, useFieldArrayValue, useFieldValue, useValueStore, type CustomGroupComponent } from "@repo/form-engine";

const KERELMEZO_ALKOTAS_PREFIX = "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása";
const NOMINATORS_PREFIX = "Bizottsági|Bizottság|Előterjesztők|Előterjesztők";

function sanitizeScore(raw: string): string {
    let result = "";
    let foundDecimal = false;
    for (const char of raw.replaceAll(",", ".")) {
        if (/[0-9]/.test(char)) {
            result += char;
        } else if (char === "." && !foundDecimal) {
            result += char;
            foundDecimal = true;
        }
    }
    const num = parseFloat(result);
    if (!isNaN(num) && num > 1) {
        result = "1";
    }
    return result;
}

const WorkRow = ({
    index,
    keyPrefix,
    description,
    type,
    nominatorNames,
    nominatorRawJsons
}: {
    index: number;
    keyPrefix: string;
    description: string;
    type: string;
    nominatorNames: string[];
    nominatorRawJsons: string[];
}) => {
    const [score, setScore] = useField(`${keyPrefix}[[${index}]]|Bizottsági pontszám`);

    const getNominatorScore = (nominatorIndex: number): string => {
        const raw = nominatorRawJsons[nominatorIndex];
        if (!raw) return "";
        try {
            const json = JSON.parse(raw);
            const value = getFromObjectByKey(
                json,
                `Előterjesztői|Tudományos minimumkövetelmények|Q-szám|A kérelmező alkotási teljesítménye[[${index}]]|Pontszám`
            );
            return value !== undefined && value !== null ? String(value) : "";
        } catch {
            return "";
        }
    };

    return (
        <tr>
            <td className="form-table-fcol">{description}</td>
            <td>{type}</td>
            {nominatorNames.map((_, ni) => (
                <td key={ni} className="text-center">
                    {getNominatorScore(ni)}
                </td>
            ))}
            <td className="text-center">
                <input
                    type="text"
                    inputMode="decimal"
                    className="w-16 border-primary border-2 rounded py-1 px-2 text-center"
                    value={score ?? ""}
                    onChange={(e) => setScore(sanitizeScore(e.target.value))}
                />
            </td>
        </tr>
    );
};

// Az előterjesztői "A kérelmező alkotási teljesítménye" táblázat bizottsági megfelelője: a
// kérelmező által megadott alkotások leírását a kérelmezői adatból veszi át, minden betöltött
// előterjesztő saját pontszámát (RawJSON-jukból kiolvasva) csak megjeleníti, és egy önálló,
// szerkeszthető "Bizottsági pontszám" oszlopot ad hozzá.
export const WorksScoringTable: CustomGroupComponent = ({ keyPrefix }) => {
    const store = useValueStore();
    const length = parseInt(useFieldValue(`${KERELMEZO_ALKOTAS_PREFIX}|_length`)) || 0;
    const descriptions = useFieldArrayValue(`${KERELMEZO_ALKOTAS_PREFIX}|Műszaki alkotás leírása`);
    const types = useFieldArrayValue(`${KERELMEZO_ALKOTAS_PREFIX}|Műszaki alkotás típusa`);

    const nominatorCount = parseInt(useFieldValue(`${NOMINATORS_PREFIX}|_length`)) || 0;
    const nominatorNames = useFieldArrayValue(`${NOMINATORS_PREFIX}|Előterjesztő neve`);
    const nominatorRawJsons = useFieldArrayValue(`${NOMINATORS_PREFIX}|RawJSON`);

    // A "Bizottsági pontszám" saját tömbünk hosszát a kérelmező alkotás-listájának hosszához
    // igazítjuk, hogy pl. a QScoreSummary useFieldArrayValue-val helyesen tudja összegezni.
    useEffect(() => {
        const currentLength = parseInt(store.getField(`${keyPrefix}|_length`)) || 0;
        if (currentLength !== length) {
            store.setField(`${keyPrefix}|_length`, String(length));
        }
    }, [length, store, keyPrefix]);

    if (length === 0) {
        return <div className="italic text-gray-500">A kérelmező nem adott meg műszaki alkotást.</div>;
    }

    const displayedNominatorNames = Array.from({ length: nominatorCount }, (_, i) => nominatorNames[i] || `${i + 1}. előterjesztő`);

    return (
        <table className="form-table">
            <tbody>
                <tr className="form-table-head">
                    <td>Alkotás leírása</td>
                    <td>Típus</td>
                    {displayedNominatorNames.map((name, i) => (
                        <td key={i} className="text-center">
                            {name} pontszáma
                        </td>
                    ))}
                    <td className="text-center">Bizottsági pontszám</td>
                </tr>
                {Array.from({ length }).map((_, wi) => (
                    <WorkRow
                        key={wi}
                        index={wi}
                        keyPrefix={keyPrefix}
                        description={descriptions[wi]}
                        type={types[wi]}
                        nominatorNames={displayedNominatorNames}
                        nominatorRawJsons={nominatorRawJsons}
                    />
                ))}
            </tbody>
        </table>
    );
};
