import { Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@repo/ui";
import type { AttribType, FormData } from "../forms";
import { activeMTMTUserIdAtom, getRanking, getRating, mtmtPubListAtom, mtmtPubSummaryCacheAtom, processMTMTTemplateLinks } from "../mtmt";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";

type PubChoice = { mtid: string; title: string; template: string };

const rankingAtLeast = (ranking: string, minRank: number | string): boolean => {
    if (minRank === "D1" && ranking === "D1") return true;
    if (minRank === "Q1" && ["D1", "Q1"].includes(ranking)) return true;
    if (minRank === "Q2" && ["D1", "Q1", "Q2"].includes(ranking)) return true;
    if (minRank === "Q3" && ["D1", "Q1", "Q2", "Q3"].includes(ranking)) return true;
    if (minRank === "Q4" && ["D1", "Q1", "Q2", "Q3", "Q4"].includes(ranking)) return true;
    return false;
};

export const MTMTPubInput = ({
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
    const mtmtPubSummaryCache = useAtomValue(mtmtPubSummaryCacheAtom);

    useEffect(() => {
        let filtered = mtmtPubList;
        if (attribs?.type === "journal") {
            filtered = filtered.filter((c) => "journal" in c);
            if (attribs?.minRank) {
                filtered = filtered.filter((c) => rankingAtLeast(getRanking(c), String(attribs.minRank)));
            }
            if (attribs?.maxAuthors) {
                filtered = filtered.filter((c) => (c.authorships ? c.authorships.length <= Number(attribs.maxAuthors) : false));
            }
        } else if (attribs?.type === "book") {
            filtered = filtered.filter(
                (c) => c["type"] && "otypeName" in c["type"] && c["type"]["otypeName"] === "Book" && c["subType"] && c["subType"]["name"] === "Szakkönyv"
            );
        } else if (attribs?.type === "patent") {
            filtered = filtered.filter((c) => c["type"] && "otypeName" in c["type"] && c["type"]["otypeName"] === "Patent");
        } else if (attribs?.type === "achievement") {
            filtered = filtered.filter((c) => c["type"] && "otypeName" in c["type"] && c["type"]["otypeName"] === "Achievement");
        }
        setChoices(filtered);
    }, [mtmtPubList, attribs]);

    // Ha unique=true, akkor kiszűrjük a már kiválasztott értékeket (kivéve a saját értékünket)
    const availableChoices = useMemo(() => {
        if (!attribs?.unique) return choices;
        const selectedByOthers = new Set(value.filter((v, i) => i !== index && v !== "").map((v) => String(v)));
        return choices.filter((c) => !selectedByOthers.has(String(c.mtid)));
    }, [choices, value, index, attribs?.unique]);

    const cachedSummary = useMemo(() => {
        const mtid = value[index];
        if (!mtid) return null;
        return mtmtPubSummaryCache[mtid] || null;
    }, [mtmtPubSummaryCache, value, index]);

    const template = useCallback(
        (node: HTMLDivElement | null) => {
            // A template-hez az összes choices-ból keressük (a kiválasztott érték megjelenítéséhez)
            const inner = cachedSummary?.template ?? choices.find((c) => String(c.mtid) === value[index])?.template ?? "";
            if (inner && node) {
                node.innerHTML = inner;
                processMTMTTemplateLinks(node);
            }
        },
        [choices, value, index, cachedSummary]
    );

    const rating = useMemo(() => {
        return cachedSummary?.rating ?? getRating(mtmtPubList, value[index]);
    }, [mtmtPubList, value, index, cachedSummary]);

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
                    <PubSelectField
                        className="flex flex-grow"
                        value={value[index] ?? ""}
                        choices={availableChoices as PubChoice[]}
                        allChoices={choices as PubChoice[]}
                        onChange={(newValue) => {
                            const newValues = [...value];
                            newValues[index] = newValue;
                            setValue(newValues);
                        }}
                    />
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
    allChoices,
    onChange,
    className
}: {
    value: string;
    choices: PubChoice[];
    allChoices?: PubChoice[]; // Az összes lehetőség (unique szűrés nélkül) - a kiválasztott érték megjelenítéséhez
    onChange: (newData: string) => void;
    className?: string;
}) => {
    const [search, setSearch] = useState("");
    const activeUser = useAtomValue(activeMTMTUserIdAtom);

    // A lookup-hoz használjuk az allChoices-t ha van, egyébként a choices-t
    const lookupChoices = allChoices ?? choices;

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
    // Fontos: a lookupChoices-ból keressük, mert unique esetén a choices-ból már kiszűrtük
    const comboboxValue = (() => {
        const found = lookupChoices.find((c) => String(c.mtid) === String(value));
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
                {activeUser.length === 0 ? (
                    <span className="italic font-normal">Adja meg az MTMT azonosítót a "Főbb adatok" között</span>
                ) : choices.length === 0 ? (
                    <span className="italic font-normal">Nincs elérhető közlemény az adott MTMT azonosítóhoz</span>
                ) : value ? (
                    value
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
