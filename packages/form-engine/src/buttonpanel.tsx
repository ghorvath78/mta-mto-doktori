import { Info } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { formInfoAtom, infoPanelOpenAtom } from "./atoms.ts";
import { useMemo, useState } from "react";
import { Button, Spinner, AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@repo/ui";

export const ButtonPanel = () => {
    const formInfo = useAtomValue(formInfoAtom);
    const [infoOpen, setInfoOpen] = useAtom(infoPanelOpenAtom);
    const [dialogText, setDialogText] = useState("");

    const buttons = useMemo(() => {
        if (formInfo.buttons) {
            return formInfo.buttons.map((button, ix) => (
                <Button
                    key={ix}
                    variant="outline"
                    onClick={async () => {
                        await button.onClick(formInfo.data, (message) => {
                            setDialogText(message);
                        });
                    }}
                >
                    {button.icon}
                    {button.label}
                </Button>
            ));
        }
        return null;
    }, [formInfo]);

    return (
        <div className="w-full bg-background flex items-center p-4 border-b-1 border-primary">
            <div className="flex items-center space-x-2">{buttons}</div>
            <div className="flex-grow" />
            <Button variant={infoOpen ? "default" : "outline"} onClick={() => setInfoOpen((i) => !i)}>
                Súgó
                <Info />
            </Button>
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
