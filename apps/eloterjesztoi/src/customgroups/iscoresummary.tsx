import type { FieldDescriptor, FormData } from "@repo/form-engine";
import { getMinTotalI } from "@/requirements";
import { invertedText } from "@repo/form-engine";
import { useAtomValue } from "jotai";

export const IScoreSummary = ({ formData }: { field: FieldDescriptor; formData: FormData; keyPrefix: string; index: number }) => {
    const category = useAtomValue(
        formData[
            "Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Kategória"
        ] || [""]
    )[0];
    const iScore = parseInt(useAtomValue(formData["Előterjesztői|Tudományos minimumkövetelmények|I-szám|I-szám|I-szám"] || [0])[0]);
    const minIScore = getMinTotalI(category);

    console.log("IScoreSummary: category =", category, "iScore =", iScore, "minIScore =", minIScore);

    return <div className="font-bold">A kérelmező teljesítette az I ≥ Imin követelményt: {invertedText(iScore >= minIScore ? "IGEN" : "NEM")}</div>;
};
