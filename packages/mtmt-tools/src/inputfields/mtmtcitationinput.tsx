import { getEffectiveFieldKey, useFieldValue, useFieldWithValueSource, useValueStore } from "@repo/form-engine";
import type { FieldInputProps } from "@repo/form-engine/types";
import { getFieldLabel, getIndexFromKey, isFieldReadonly } from "@repo/form-engine";
import { Button, Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@repo/ui";
import { Eraser } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMTMTPubList } from "../publist";
import { useMTMTPubListMinimal } from "../publistminimal";
import { loadMTMTCitations } from "../citations";
import { processMTMTTemplateLinks } from "../mtmtutils";
import { getPubRating, type PubItem } from "../pubitem";

type PubChoice = { mtid: string; title: string; template: string };

export const MTMTCitationInput = ({ fieldKey, fieldDescr }: FieldInputProps) => {
    const store = useValueStore();
    const [value, setValue] = useFieldWithValueSource(fieldKey, fieldDescr.valueSource);
    const label = getFieldLabel(fieldDescr);
    const readonly = isFieldReadonly(fieldDescr);
    const attribs = fieldDescr.attribs;
    const [choices, setChoices] = useState<PubChoice[]>([]);
    const [_, mtmtPubList] = useMTMTPubList();

    const pubKey = useMemo(() => {
        let pubKey = "";
        if (attribs?.pubKey) {
            pubKey = attribs.pubKey;
            // check if field is inside an array, and if so, adjust the pubKey to point to the correct array index
            const key = getEffectiveFieldKey(fieldKey, fieldDescr.valueSource, store);
            const ix = getIndexFromKey(key);
            if (ix >= 0) {
                // create indexed key from pubKey, e.g. $parent[[ix]]|pubKey
                const keyParts = pubKey.split("|");
                pubKey = `$${keyParts.slice(0, -1).join("|")}[[${ix}]]|${keyParts[keyParts.length - 1]}`;
            }
        }
        return pubKey;
    }, [fieldKey, fieldDescr.valueSource, store, attribs?.pubKey]);

    const pubMTMT = useFieldValue(pubKey);
    const [loading, setLoading] = useState(false);
    const activePub = useRef<string>("");
    const mtmtPubSummaryCache = useMTMTPubListMinimal();

    useEffect(() => {
        let mounted = true;
        const toLoad = pubMTMT;
        if (toLoad !== activePub.current) {
            if (readonly && mtmtPubSummaryCache[toLoad]) return;
            // console.log("cache:", mtmtPubSummaryCache);
            // console.log("readonly:", readonly, "mtmt:", toLoad, "cache hit:", Boolean(mtmtPubSummaryCache[toLoad]));
            // console.log("Selected publication changed, loading citations for mtid:", toLoad);
            async function fetchCitations() {
                if (!toLoad) {
                    // no publication selected, clear choices
                    if (mounted) {
                        setChoices([]);
                        setValue("");
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
                        if (!citations.find((c) => String(c.mtid) === value)) {
                            setValue("");
                        }
                        activePub.current = toLoad;
                        setLoading(false);
                    }
                    return;
                } catch (e) {
                    if (mounted) {
                        setChoices([]);
                        setValue("");
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
    }, [mtmtPubList, pubMTMT, value, setValue]);

    const cachedSummary = useMemo(() => {
        const mtid = value;
        if (!mtid) return null;
        return mtmtPubSummaryCache[mtid] || null;
    }, [mtmtPubSummaryCache, value]);

    const template = useCallback(
        (node: HTMLDivElement | null) => {
            // A template-hez az összes choices-ból keressük (a kiválasztott érték megjelenítéséhez)
            const inner = cachedSummary?.template ?? choices.find((c) => String(c.mtid) === value)?.template ?? "";
            if (inner && node) {
                node.innerHTML = inner;
                processMTMTTemplateLinks(node);
            }
        },
        [choices, value, cachedSummary]
    );

    const rating = useMemo(() => {
        if (cachedSummary?.rating) {
            return cachedSummary.rating;
        } else {
            const activeChoice = choices.find((c) => String(c.mtid) === value);
            if (activeChoice) {
                return getPubRating(activeChoice as PubItem);
            }
            return "";
        }
    }, [choices, value, cachedSummary]);

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
                            value={value ?? ""}
                            choices={choices as PubChoice[]}
                            onChange={(newValue) => {
                                setValue(newValue);
                            }}
                            parentSelected={pubMTMT ?? ""}
                            loading={loading}
                        />
                        {attribs?.clearable && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="ml-2 hover:bg-background"
                                onClick={() => {
                                    setValue("");
                                }}
                            >
                                <Eraser />
                            </Button>
                        )}
                    </div>
                )}
                {readonly && value && <>{loading ? <span className="w-3/4 px-2 italic text-gray-500">Betöltés alatt...</span> : description}</>}
                {readonly && !value && <div className="w-3/4 px-2 italic text-gray-500">Nincs megadva</div>}
            </div>
            {!readonly && value && choices.length > 0 && (
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
