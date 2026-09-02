import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, Spinner, AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@repo/ui";
import type { FormDescriptor } from "./index.ts";
import { useInfoState, useSetPanelOpen } from "./infostate.ts";

export const ButtonPanel = ({ formDescriptor }: { formDescriptor: FormDescriptor }) => {
    const { panelOpen: infoOpen } = useInfoState();
    const setInfoOpen = useSetPanelOpen();

    const [dialogText, setDialogText] = useState("");

    const buttons = useMemo(() => {
        if (formDescriptor.buttons) {
            return formDescriptor.buttons.map((button: any, ix: number) => (
                <Button
                    key={ix}
                    variant="outline"
                    onClick={async () => {
                        await button.onClick(formDescriptor, (message: string) => {
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
    }, [formDescriptor]);

    return (
        <div className="w-full bg-background flex items-center p-4 border-b-1 border-primary">
            <div className="flex items-center space-x-2">{buttons}</div>
            <div className="flex-grow" />
            <Button variant={infoOpen ? "default" : "outline"} onClick={() => setInfoOpen(!infoOpen)}>
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
