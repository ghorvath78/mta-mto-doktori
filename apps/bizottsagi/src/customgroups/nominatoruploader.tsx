import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, Button } from "@repo/ui";
import { Dropzone, DropZoneArea, DropzoneTrigger, useDropzone } from "@repo/ui";
import { Spinner } from "@repo/ui";
import { readJsonFromPdf, getFromObjectByKey, type CustomGroupComponent } from "@repo/form-engine";
import { registerNominator, removeNominator, MIN_NOMINATORS } from "../bizottsagiform.tsx";
import { MAX_NOMINATORS, useNominatorSlots } from "../nominators.ts";
import { UploadIcon, Trash } from "lucide-react";
import { useState } from "react";

export const NominatorUploader: CustomGroupComponent = () => {
    const [dialogText, setDialogText] = useState("");
    const slots = useNominatorSlots();
    const length = slots.length;

    const dropzone = useDropzone({
        onDropFile: async (file: File) => {
            setDialogText("Előterjesztői adatlap feldolgozása");
            try {
                const eloText = await readJsonFromPdf(file, "eloterjeszto_form.json");
                if (!eloText) {
                    const message = "A kiválasztott PDF nem tartalmaz érvényes előterjesztői adatlapot. Kérem, az előterjesztő által mentett PDF-et töltse fel.";
                    alert(message);
                    return { status: "error", error: message };
                }
                const kerText = await readJsonFromPdf(file, "kerelmezo_form.json");
                if (!kerText) {
                    const message = "A kiválasztott PDF-ben nem található a beágyazott kérelmezői adatlap.";
                    alert(message);
                    return { status: "error", error: message };
                }
                const mtmtText = await readJsonFromPdf(file, "kerelmezo_mtmt.json");

                const eloJson = JSON.parse(eloText);
                const kerJson = JSON.parse(kerText);
                const mtmtJson = mtmtText ? JSON.parse(mtmtText) : {};

                const name = String(
                    getFromObjectByKey(eloJson, "Előterjesztői|Előterjesztő adatai|Előterjesztő adatai|Adatok|Előterjesztő neve") || ""
                );
                if (!name) {
                    const message = "A kiválasztott PDF-ben nem található az előterjesztő neve - kérem ellenőrizze, hogy a megfelelő fájlt választotta-e.";
                    alert(message);
                    return { status: "error", error: message };
                }

                const result = registerNominator({ eloJson, kerJson, mtmtJson });
                if (!result.ok) {
                    alert(result.error);
                    return { status: "error", error: result.error };
                }

                return { status: "success", result: URL.createObjectURL(file) };
            } finally {
                setDialogText("");
            }
        },
        validation: {
            accept: { "application/pdf": [".pdf"] },
            // react-dropzone sizes are in bytes; 128 * 1024 is only 128KB (most PDFs are larger)
            maxSize: 10 * 1024 * 1024,
            maxFiles: 1
        },
        shiftOnMaxFiles: true
    });

    return (
        <div className="space-y-2">
            {length > 0 && (
                <table className="form-table">
                    <tbody>
                        <tr className="form-table-head">
                            <td>#</td>
                            <td>Előterjesztő neve</td>
                            <td>Tudományos fokozat</td>
                            <td></td>
                        </tr>
                        {slots.map((slot) => (
                            <tr key={slot.index}>
                                <td>{slot.index}.</td>
                                <td>{slot.name || <span className="italic text-gray-500">(nincs név)</span>}</td>
                                <td>{slot.fokozat || ""}</td>
                                <td>
                                    <Button
                                        className="has-[>svg]:px-1"
                                        variant="ghost"
                                        size="sm"
                                        title="Előterjesztő eltávolítása"
                                        onClick={() => removeNominator(slot.index)}
                                    >
                                        <Trash />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {length < MIN_NOMINATORS && (
                <div className="text-sm italic">
                    Legalább {MIN_NOMINATORS} előterjesztői adatlap feltöltése szükséges (jelenleg {length} van feltöltve).
                </div>
            )}
            {length < MAX_NOMINATORS && (
                <Dropzone {...dropzone}>
                    <DropZoneArea>
                        <DropzoneTrigger className="flex flex-col items-center gap-4 bg-transparent p-10 text-center text-sm">
                            <UploadIcon className="size-8" />
                            <div>
                                <p className="font-semibold">
                                    {length === 0 ? "Előterjesztői adatlap feltöltése" : "További előterjesztői adatlap feltöltése"}
                                </p>
                                <p className="text-sm text-muted-foreground">Kattintson ide vagy húzza ide a PDF fájlt a feltöltéshez</p>
                            </div>
                        </DropzoneTrigger>
                    </DropZoneArea>
                </Dropzone>
            )}
            {dialogText && (
                <AlertDialog open={dialogText !== ""} onOpenChange={() => setDialogText("")}>
                    <AlertDialogContent>
                        <AlertDialogTitle>{dialogText}</AlertDialogTitle>
                        <AlertDialogDescription className="flex items-center">
                            <Spinner className="mr-2" />
                            {dialogText} folyamatban, kérjük várjon...
                        </AlertDialogDescription>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
};
