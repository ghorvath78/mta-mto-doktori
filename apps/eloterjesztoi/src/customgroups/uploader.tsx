import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@repo/ui";
import { Dropzone, DropZoneArea, DropzoneTrigger, useDropzone } from "@repo/ui";
import { Spinner } from "@repo/ui";
import { loadApplicantDataFromForm } from "../eloterjesztoiform.tsx";
import { readJsonFromPdf } from "@repo/form-engine";
import { useAtomValue } from "jotai";
import { UploadIcon } from "lucide-react";
import { useState } from "react";
import { applicantDataLoaded } from "@/atoms";

export const ApplicationPdfUploader = () => {
    const dataLoaded = useAtomValue(applicantDataLoaded);
    const [dialogText, setDialogText] = useState("");
    const dropzone = useDropzone({
        onDropFile: async (file: File) => {
            const formContent = await readJsonFromPdf(file, "kerelmezo_form.json");
            if (!formContent) {
                alert("Nem található érvényes kérelmezői adatlap a PDF-ben.");
                return { status: "error", error: "Nem található érvényes kérelmezői adatlap a PDF-ben." };
            }
            const mtmtContent = await readJsonFromPdf(file, "kerelmezo_mtmt.json");
            if (!mtmtContent) {
                alert("Nem található érvényes publikációs adat a kérelmezői PDF-ben.");
                return { status: "error", error: "Nem található érvényes publikációs adat a kérelmezői a PDF-ben." };
            }

            setDialogText("Publikációk és hivatkozások betöltése");
            await loadApplicantDataFromForm(formContent, mtmtContent);
            setDialogText("");

            return {
                status: "success",
                result: URL.createObjectURL(file)
            };
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
        <div>
            <Dropzone {...dropzone}>
                <DropZoneArea>
                    <DropzoneTrigger className="flex flex-col items-center gap-4 bg-transparent p-10 text-center text-sm">
                        <UploadIcon className="size-8" />
                        <div>
                            <p className="font-semibold">Kérelmezői adatlap feltöltése</p>
                            <p className="text-sm text-muted-foreground">Kattintson ide vagy húzza ide a PDF fájlt a feltöltéshez</p>
                        </div>
                    </DropzoneTrigger>
                </DropZoneArea>
            </Dropzone>
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
            {dataLoaded && (
                <div className="mt-2 text-sm">Kérelmezői adatlap sikeresen betöltve. A bal oldali menüben elérhetőek az űrlap kitöltendő lapjai.</div>
            )}
        </div>
    );
};
