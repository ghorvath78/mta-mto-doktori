import { registerInputField, useFieldValue } from "@repo/form-engine";
import { getMinTotalI } from "@/requirements";
import { invertedText } from "@repo/form-engine";

export const IScoreSummary = () => {
    const category = useFieldValue(
        "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória"
    );
    const iScore = parseInt(useFieldValue("Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|I-szám") || "0");

    const minIScore = getMinTotalI(category);

    return <div className="font-bold">A kérelmező teljesítette az I ≥ Imin követelményt: {invertedText(iScore >= minIScore ? "IGEN" : "NEM")}</div>;
};

registerInputField("iScoreSummary", {
    component: IScoreSummary,
    printer: () => []
});
