import { getMinCommunityCount } from "@/requirements";
import { invertedText, useFieldValue } from "@repo/form-engine";

export const activityRequirementSectionKeys = [
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

export const PublicActivitySummary = () => {
    const minimumRequired = getMinCommunityCount();
    let count = 0;
    for (const sectionKey of activityRequirementSectionKeys) {
        const value = useFieldValue(`Bizottsági|Tudományos közéleti tevékenység|${sectionKey}|Bizottsági értékelés|Bizottsági vélemény`);
        if (value && value.toLowerCase() === "igen") {
            count++;
        }
    }

    return (
        <div>
            <div>
                Teljesítendő tudományos közéleti szempontok száma: <span className="font-bold">{minimumRequired}</span>
            </div>
            <div>
                A bizottság megítélése szerint teljesített tudományos közéleti szempontok száma:{" "}
                <span className="font-bold">{invertedText("" + count)}</span>
            </div>
        </div>
    );
};
