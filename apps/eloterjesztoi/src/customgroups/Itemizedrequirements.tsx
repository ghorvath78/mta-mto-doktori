import { useAtomValue } from "jotai";
import type { GroupDescriptor, FormData } from "@repo/form-engine";
import { getMaxBookQ, getMaxAchievementQ, getMinPaperQ, getMinTotalI, getMinHIndex, getMinTotalQ } from "@/requirements";
import { cD, invertedText } from "@repo/form-engine";

export const ItemizedRequirements = ({ formData }: { group: GroupDescriptor; formData: FormData; keyPrefix: string; index: number }) => {
    const achievementQ = useAtomValue(formData["Előterjesztői|Tudományos minimumkövetelmények|Q-szám|A kérelmező alkotási teljesítménye|Pontszám"] || []);
    const category = useAtomValue(
        formData[
            "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória"
        ] || [""]
    )[0];
    const rawData = useAtomValue(formData["Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat"] || []);
    const data = JSON.parse(rawData[0] || "[]");
    const iScore = parseInt(useAtomValue(formData["Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|I-szám"] || [0])[0]);

    const achievementQValue = Math.round(10000 * achievementQ.reduce((sum, val) => sum + cD(val), 0)) / 10000;
    const paperQValue = cD(data[1][6]) + cD(data[4][6]);
    const bookQValue = cD(data[6][6]) + cD(data[7][6]);

    const minPaperQ = getMinPaperQ(category);
    const maxBookQ = getMaxBookQ();
    const maxAchievementQ = getMaxAchievementQ(category);
    const minIScore = getMinTotalI(category);
    const minTotalQ = getMinTotalQ(category);

    const hunPapers = cD(data[13][0] || 0);
    const minHunPapers = 1;

    const asIfPapers = cD(data[14][0] || 0);
    const phdStudents = cD(
        useAtomValue(
            formData["Kérelmezői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók|Összes|Fokozatott szerzett doktoranduszok száma"] || [0]
        )[0]
    );
    const minSaIfPhdSum = 2;

    const ifPapers = cD(data[15][0] || 0);
    const relIf = cD(data[16][0] || 0);
    const wosCitations = cD(data[11][0] || 0);
    const hIndex = cD(data[12][0] || 0);
    const minHIndex = getMinHIndex(category);

    const optionalSatisfied =
        paperQValue >= minPaperQ * 1.5 || bookQValue >= maxBookQ * 1.5 || achievementQValue >= maxAchievementQ * 1.5 || iScore >= 1.5 * minIScore;

    const allSatisfied =
        paperQValue >= minPaperQ &&
        optionalSatisfied &&
        hunPapers >= minHunPapers &&
        asIfPapers + phdStudents >= minSaIfPhdSum &&
        ifPapers >= minTotalQ * 0.5 &&
        relIf >= minTotalQ * 0.25 &&
        hIndex >= minHIndex &&
        wosCitations >= minIScore * 0.5;

    return (
        <>
            <table className="form-table [&_td]:px-2">
                <tbody>
                    <tr className="form-table-head">
                        <td></td>
                        <td>Tételes publikációs elvárások</td>
                        <td className="text-center">Saját</td>
                        <td className="text-center">Minimum</td>
                        <td className="text-center">Teljesül</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>1.</td>
                        <td className="text-left">A Q érték cikkekre külön is érje el a cikkekre előírt minimumot</td>
                        <td>{paperQValue}</td>
                        <td>{minPaperQ}</td>
                        <td>{paperQValue >= minPaperQ ? "✓" : "✗"}</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>2.a.</td>
                        <td className="text-left">Cikkekre érjen el szignifikánsan (≥ 50%-kal) nagyobb Q értéket</td>
                        <td>{paperQValue}</td>
                        <td>{minPaperQ * 1.5}</td>
                        <td rowSpan={4}>{optionalSatisfied ? "✓" : "✗"}</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>2.b.</td>
                        <td className="text-left">Könyvekre érjen el szignifikánsan ( ≥ 50%-kal) nagyobb Q értéket</td>
                        <td>{bookQValue}</td>
                        <td>{maxBookQ * 1.5}</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>2.c.</td>
                        <td className="text-left">Alkotásokra érjen el szignifikánsan ( ≥ 50%-kal) nagyobb Q értéket</td>
                        <td>{achievementQValue}</td>
                        <td>{maxAchievementQ * 1.5}</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>2.d.</td>
                        <td className="text-left">Idézettségre érjen el szignifikánsan ( ≥ 50%-kal) nagyobb értéket</td>
                        <td>{iScore}</td>
                        <td>{minIScore * 1.5}</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>3.</td>
                        <td className="text-left">A magyar állampolgároknak legyen magyar nyelvű publikációja is</td>
                        <td>{hunPapers}</td>
                        <td>{minHunPapers}</td>
                        <td>{hunPapers >= minHunPapers ? "✓" : "✗"}</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>4.</td>
                        <td className="text-left">
                            Az egyszerzős IF-os cikkeinek és a sikeresen védett PhD/DLA hallgatói darabszámainak összege legyen legalább 2
                        </td>
                        <td>{asIfPapers + phdStudents}</td>
                        <td>{minSaIfPhdSum}</td>
                        <td>{asIfPapers + phdStudents >= minSaIfPhdSum ? "✓" : "✗"}</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>5.</td>
                        <td className="text-left">Az IF-os cikkeinek száma (a szerzők számával nem kell osztani) legyen legalább 0,5 Qmin</td>
                        <td>{ifPapers}</td>
                        <td>{minTotalQ * 0.5}</td>
                        <td>{ifPapers >= minTotalQ * 0.5 ? "✓" : "✗"}</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>6.</td>
                        <td className="text-left">A viszonyított IF-számok összege legyen legalább 0,25 Qmin</td>
                        <td>{relIf}</td>
                        <td>{minTotalQ * 0.25}</td>
                        <td>{relIf >= minTotalQ * 0.25 ? "✓" : "✗"}</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>7.</td>
                        <td className="text-left">A WoS-ben megjelent hivatkozásainak darabszáma legyen legalább 0,5 Imin</td>
                        <td>{wosCitations}</td>
                        <td>{minIScore * 0.5}</td>
                        <td>{wosCitations >= minIScore * 0.5 ? "✓" : "✗"}</td>
                    </tr>
                    <tr className="border-b border-primary border-dotted">
                        <td>8.</td>
                        <td className="text-left">MTMT-ben szereplő független hivatkozásokból számolt Hirsch-indexe</td>
                        <td>{hIndex}</td>
                        <td>{minHIndex}</td>
                        <td>{hIndex >= minHIndex ? "✓" : "✗"}</td>
                    </tr>
                </tbody>
            </table>
            <div className="w-full mt-2 pt-2 font-semibold">
                A kérelmező maradéktalanul teljesítette a tételes publikációs elvárásokat: {invertedText(allSatisfied ? "IGEN" : "NEM")}
            </div>
        </>
    );
};
