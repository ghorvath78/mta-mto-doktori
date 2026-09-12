import { useEffect } from "react";
import { useField, useFieldArrayValue, useFieldValue, useValueStore, type CustomGroupComponent } from "@repo/form-engine";
import { MAX_NOMINATORS, nominatorPrefix, useNominatorSlots } from "../nominators";

const KERELMEZO_ALKOTAS_PREFIX = "Kérelmezői|Műszaki alkotások|Műszaki alkotások megadása|Műszaki alkotások megadása";
const ELOTERJESZTOI_ALKOTAS_RELATIVE_PATH = "Tudományos minimumkövetelmények|Q-szám|A kérelmező alkotási teljesítménye";

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
    nominatorCount
}: {
    index: number;
    keyPrefix: string;
    description: string;
    type: string;
    nominatorCount: number;
}) => {
    const [score, setScore] = useField(`${keyPrefix}[[${index}]]|Bizottsági pontszám`);

    // Rögzített (MAX_NOMINATORS) számú hívás, hogy a hookok száma/sorrendje minden renderben azonos
    // legyen, függetlenül attól, hogy ténylegesen hány előterjesztő van betöltve.
    const nomScores: string[] = [];
    for (let i = 1; i <= MAX_NOMINATORS; i++) {
        // eslint-disable-next-line react-hooks/rules-of-hooks -- MAX_NOMINATORS fix konstans
        const value = useFieldValue(`${nominatorPrefix(i)}|${ELOTERJESZTOI_ALKOTAS_RELATIVE_PATH}[[${index}]]|Pontszám`);
        nomScores.push(value);
    }

    return (
        <tr>
            <td className="form-table-fcol">{description}</td>
            <td>{type}</td>
            {nomScores.slice(0, nominatorCount).map((value, ni) => (
                <td key={ni} className="text-center">
                    {value}
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
// előterjesztő saját pontszámát (a közös store-ba mergelt "Előterjesztő<n>|..." adatukból) csak
// megjeleníti, és egy önálló, szerkeszthető "Bizottsági pontszám" oszlopot ad hozzá.
export const WorksScoringTable: CustomGroupComponent = ({ keyPrefix }) => {
    const store = useValueStore();
    const length = parseInt(useFieldValue(`${KERELMEZO_ALKOTAS_PREFIX}|_length`)) || 0;
    const descriptions = useFieldArrayValue(`${KERELMEZO_ALKOTAS_PREFIX}|Műszaki alkotás leírása`);
    const types = useFieldArrayValue(`${KERELMEZO_ALKOTAS_PREFIX}|Műszaki alkotás típusa`);

    const nominatorSlots = useNominatorSlots();

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

    const displayedNominatorNames = nominatorSlots.map((slot) => slot.name || `${slot.index}. előterjesztő`);

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
                        nominatorCount={nominatorSlots.length}
                    />
                ))}
            </tbody>
        </table>
    );
};
