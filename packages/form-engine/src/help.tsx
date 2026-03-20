import { useAtomValue } from "jotai";
import { infoFieldAtom, infoSectionAtom } from "./atoms";
import { Info } from "lucide-react";

const generalHelpText = `Űrlap mentése / betöltése\n\nAz Űrlap mentése” gomb egy PDF-et készít és tölt le, amelyet kétféleképpen használhat:\n• Csatolható a doktori pályázathoz.\n• Később visszatölthető („Űrlap betöltése” gomb), és folytatható a kitöltés és szerkesztés.\n\nFontos: csak azt a PDF-et lehet betölteni, amit ez a program készített (más forrásból származó PDF-ekből a kitöltött adatok nem tölthetők vissza megbízhatóan).\n\nTipp: őrizze meg a mentett PDF-et, ez a szerkeszthető „munkapéldány”.`;

const hoverHelpText = `Mezősúgó\n\nMozgassa az egeret egy adatbeviteli mező vagy szakasz fölé, hogy a részletes súgó megjelenjen a panelen.`;

const InfoBlock = ({ text }: { text: string }) => {
    return (
        <div className="flex rounded border p-4 gap-4 shadow-md">
            <div className="text-primary">
                <Info size={20} />
            </div>
            <div className="flex-1 whitespace-pre-wrap">{text}</div>
        </div>
    );
};

export const Help = () => {
    const infoField = useAtomValue(infoFieldAtom);
    const infoSection = useAtomValue(infoSectionAtom);

    return (
        <div className="flex-1 border-l p-4 max-w-[480px] bg-background border-l-1 border-primary space-y-4 overflow-y-auto">
            {/*<div className="bg-secondary p-4 rounded">*/}
            <h3 className="font-bold">Súgó</h3>
            {!infoField && !infoSection ? (
                <>
                    <InfoBlock text={generalHelpText} />
                    <InfoBlock text={hoverHelpText} />
                </>
            ) : (
                <>
                    {infoSection && <InfoBlock text={infoSection} />}
                    {infoField && <InfoBlock text={infoField} />}
                </>
            )}
            {/*</div>*/}
        </div>
    );
};
