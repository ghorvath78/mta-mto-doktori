import { Button, Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@repo/ui";
import type { AttribType, FormData } from "../forms";
import { loadMTMTCitations, mtmtPubListAtom, processMTMTTemplateLinks } from "../mtmt";
import { atom, useAtom, useAtomValue } from "jotai";
import { Eraser } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PubChoice = { mtid: string; title: string; template: string };

const emptyConditionAtom = atom(new Array(100).fill(""));

export const MTMTCitationInput = ({
    label,
    fieldKey,
    formData,
    index,
    readonly,
    attribs
}: {
    label: string;
    fieldKey: string;
    formData: FormData;
    index: number;
    readonly?: boolean;
    attribs?: AttribType;
}) => {
    const [value, setValue] = useAtom(formData[fieldKey]);
    const [choices, setChoices] = useState<PubChoice[]>([]);
    const mtmtPubList = useAtomValue(mtmtPubListAtom);
    const pubMTMT = useAtomValue(attribs?.pubKey ? (formData[String(attribs.pubKey)] ?? emptyConditionAtom) : emptyConditionAtom);
    const [loading, setLoading] = useState(false);
    const activePub = useRef<string>("");

    useEffect(() => {
        let mounted = true;
        const toLoad = pubMTMT[index];
        if (toLoad !== activePub.current) {
            console.log("Selected publication changed, loading citations for mtid:", toLoad);
            async function fetchCitations() {
                if (!toLoad) {
                    // no publication selected, clear choices
                    if (mounted) {
                        setChoices([]);
                        const newValue = [...value];
                        newValue[index] = "";
                        setValue(newValue);
                        setLoading(false);
                    }
                    activePub.current = "";
                    return;
                }
                try {
                    const citations = toLoad ? await loadMTMTCitations(toLoad) : [];
                    if (mounted) {
                        console.log("Loaded citations:", citations);
                        setChoices(citations);
                        // if the current value is not in the new choices, clear it
                        if (!citations.find((c) => String(c.mtid) === value[index])) {
                            const newValue = [...value];
                            newValue[index] = "";
                            setValue(newValue);
                        }
                        activePub.current = toLoad;
                        setLoading(false);
                    }
                    return;
                } catch (e) {
                    if (mounted) {
                        setChoices([]);
                        const newValue = [...value];
                        newValue[index] = "";
                        setValue(newValue);
                        setLoading(false);
                    }
                    activePub.current = "";
                }
            }
            setLoading(true);
            fetchCitations();
        }
        return () => {
            mounted = false;
        };
    }, [mtmtPubList, pubMTMT, index, value, setValue]);

    const template = useCallback(
        (node: HTMLDivElement | null) => {
            const inner = choices.find((c) => String(c.mtid) === value[index])?.template ?? "";
            if (inner && node) {
                node.innerHTML = inner;
                processMTMTTemplateLinks(node);
            }
        },
        [choices, value, index]
    );

    const rating = useMemo(() => {
        const pub = mtmtPubList.find((c) => String(c.mtid) === value[index]);
        if (!pub) return null;
        if (pub["journal"] && pub["ratings"]) {
            const sjr = pub["ratings"].find((r) => r["otype"] === "SjrRating");
            if (sjr) return sjr["ranking"];
        }
        return null;
    }, [mtmtPubList, value, index]);

    const description = (
        <div className="w-3/4 px-2 text-sm mtmt-publication">
            <div ref={template} />
            {rating && <div className="mt-1 italic text-gray-500">SJR: {rating}</div>}
        </div>
    );

    return (
        <>
            <div className="flex items-center space-x-2">
                <div className={`text-end w-1/4 font-medium leading-[0.95em] ${readonly ? "self-start" : ""}`}>{label}</div>
                {!readonly && (
                    <div className="flex flex-1 items-center">
                        <PubSelectField
                            className="flex flex-1"
                            value={value[index] ?? ""}
                            choices={choices as PubChoice[]}
                            onChange={(newValue) => {
                                const newValues = [...value];
                                newValues[index] = newValue;
                                setValue(newValues);
                            }}
                            parentSelected={pubMTMT[index] ?? ""}
                            loading={loading}
                        />
                        {attribs?.clearable && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="ml-2 hover:bg-background"
                                onClick={() => {
                                    const newValues = [...value];
                                    newValues[index] = "";
                                    setValue(newValues);
                                }}
                            >
                                <Eraser />
                            </Button>
                        )}
                    </div>
                )}
                {readonly && value[index] && <>{description}</>}
                {readonly && !value[index] && <div className="w-3/4 px-2 italic text-gray-500">Nincs megadva</div>}
            </div>
            {!readonly && value[index] && choices.length > 0 && (
                <div className="flex items-center space-x-2 m-2">
                    <div className="w-1/4" />
                    {description}
                </div>
            )}
        </>
    );
};

export const PubSelectField = ({
    value,
    choices,
    onChange,
    className,
    parentSelected,
    loading
}: {
    value: string;
    choices: PubChoice[];
    onChange: (newData: string) => void;
    className?: string;
    parentSelected: string;
    loading: boolean;
}) => {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const q = (search || "").trim().toLowerCase();
        if (!q) return choices;
        const flt = choices.filter((c: PubChoice) => {
            const title = (c.title ?? "").toString().toLowerCase();
            return title.includes(q);
        });
        return flt;
    }, [choices, search]);

    // Use a combined value "title:::mtid" so filtering (by title) still works
    // but selection contains the unique mtid even when multiple items share the same title.
    const SEP = ":::"; // choose a separator unlikely to appear in titles
    const data = filtered.map((c: PubChoice) => ({ value: `${c.title ?? ""}${SEP}${c.mtid}`, label: c.title }));

    // Convert parent's stored mtid -> combobox internal value (title:::mtid) for controlled display
    const comboboxValue = (() => {
        const found = (choices as PubChoice[]).find((c) => String(c.mtid) === String(value));
        return found ? `${found.title ?? ""}${SEP}${found.mtid}` : "";
    })();

    return (
        <Combobox
            data={data}
            onValueChange={(v: string) => {
                // v is "title:::mtid" — extract unique mtid and send to parent
                const mtid = String(v).split(SEP).slice(-1)[0] ?? "";
                onChange(mtid || "");
                setSearch("");
            }}
            type={"publikáció"}
            value={comboboxValue}
        >
            <ComboboxTrigger className={`${className} rounded bg-transparent border-gray-300 hover:bg-background justify-start`}>
                {!parentSelected ? (
                    <span className="italic font-normal">Válassza ki a közlemény azonosítót a fenti listából</span>
                ) : loading ? (
                    <span className="italic font-normal">Betöltés...</span>
                ) : value ? (
                    value
                ) : choices.length === 0 ? (
                    <span className="italic font-normal">Nincs elérhető hivatkozás az adott közleményhez</span>
                ) : (
                    <span className="italic font-normal">Válasszon a listából...</span>
                )}
            </ComboboxTrigger>
            <ComboboxContent>
                <ComboboxInput placeholder="Keresés..." value={search} onValueChange={setSearch} />
                <ComboboxList>
                    <ComboboxGroup>
                        {filtered.map((choice) => (
                            // item value is "title:::mtid" so the internal filter still matches title
                            <ComboboxItem key={choice.mtid} value={`${choice.title ?? ""}${SEP}${choice.mtid}`} className="block">
                                <span>{choice.title}</span> <span className="text-sm text-gray-500">({choice.mtid})</span>
                            </ComboboxItem>
                        ))}
                    </ComboboxGroup>
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
};
