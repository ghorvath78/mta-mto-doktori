import type { FormData, GroupDescriptor } from "@repo/form-engine";
import { invertedText } from "@repo/form-engine";
import { atom, useAtomValue } from "jotai";
import { useMemo } from "react";

const emptyAtom = atom([""]);

const activityRequirementSectionKeys = [
    "TDK témavezetés",
    "Részvétel graduális és doktori képzésben",
    "Doktori fokozatot szerzett hallgatók",
    "Részvétel tudományos zsűriben, kuratóriumban, bírálatokban",
    "Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében",
    "Tisztség, kiemelt/választott tagság tudományos szervezetben",
    "Folyóirat-szerkesztőbizottsági tagság legalább 2 évig",
    "Részvétel tudományos minősítésben",
    "Elnyert tudományos pályázat",
    "Külföldi tartózkodás",
    "Állami vagy MTA által adományozott tudományos díj, kitüntetés"
] as const;

export const PublicActivitySummary = ({ formData }: { group: GroupDescriptor; formData: FormData; keyPrefix: string; index: number }) => {
    const minimumRequired = useAtomValue(
        formData["Előterjesztői|Tudományos minimumkövetelmények|A kérelmezőre vonatkozó minimumkövetelmények|Minimumkövetelmények|Tud. köz. szempontok"] ||
            emptyAtom
    )[0];

    const actualCountAtom = useMemo(
        () =>
            atom((get) => {
                let count = 0;

                for (const sectionKey of activityRequirementSectionKeys) {
                    const key = `Előterjesztői|Tudományos közéleti tevékenység|${sectionKey}|Értékelés|Követelmény teljesül`;
                    const value = get(formData[key] || emptyAtom)[0];

                    if (value && value.toLowerCase() === "igen") {
                        count++;
                    }
                }

                return count;
            }),
        [formData]
    );

    const actualCount = useAtomValue(actualCountAtom);

    return (
        <div>
            <div>
                Teljesítendő tudományos közéleti szempontok száma: <span className="font-bold">{minimumRequired}</span>
            </div>
            <div>
                Teljesített tudományos közéleti szempontok száma: <span className="font-bold">{invertedText("" + actualCount)}</span>
            </div>
            {/*<div className="font-bold">A minimumkövetelmény teljesült: {invertedText(actualCount >= minimimRequired ? "IGEN" : "NEM")}</div>*/}
        </div>
    );
};
