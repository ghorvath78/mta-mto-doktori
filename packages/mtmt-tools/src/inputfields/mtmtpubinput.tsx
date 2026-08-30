import { getEffectiveFieldKey, useFieldWithValueSource, useValueStore } from "@repo/form-engine";
import type { FieldInputProps } from "@repo/form-engine";
import { getFieldLabel, getIndexFromKey, isFieldReadonly } from "@repo/form-engine";
import { Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from "@repo/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMTMTAuthorValue, useMTMTPubList } from "../publist";
import { getPubRating } from "../pubitem";
import { useMTMTPubListMinimal } from "../publistminimal";
import { processMTMTTemplateLinks } from "../mtmtutils";

type PubChoice = { mtid: string; title: string; template: string };

const rankingAtLeast = (ranking: string, minRank: number | string): boolean => {
    if (minRank === "D1" && ranking === "D1") return true;
    if (minRank === "Q1" && ["D1", "Q1"].includes(ranking)) return true;
    if (minRank === "Q2" && ["D1", "Q1", "Q2"].includes(ranking)) return true;
    if (minRank === "Q3" && ["D1", "Q1", "Q2", "Q3"].includes(ranking)) return true;
    if (minRank === "Q4" && ["D1", "Q1", "Q2", "Q3", "Q4"].includes(ranking)) return true;
    return false;
};

export const MTMTPubInput = ({ fieldKey, fieldDescr }: FieldInputProps) => {
    const store = useValueStore();
    const [value, setValue] = useFieldWithValueSource(fieldKey, fieldDescr.valueSource);
    const label = getFieldLabel(fieldDescr);
    const readonly = isFieldReadonly(fieldDescr);
    const attribs = fieldDescr.attribs;
    const [choices, setChoices] = useState<PubChoice[]>([]);
    const [_, mtmtPubList] = useMTMTPubList();
    const pubItem = useMemo(() => mtmtPubList.find((c) => String(c.mtid) === value), [mtmtPubList, value]);
    const mtmtPubSummaryCache = useMTMTPubListMinimal();
    const pubItemSummary = useMemo(() => {
        if (!value) return null;
        return mtmtPubSummaryCache[value] ?? null;
    }, [mtmtPubSummaryCache, value]);

    useEffect(() => {
        let filtered = mtmtPubList;
        if (attribs?.type === "journal") {
            filtered = filtered.filter((c) => "journal" in c);
            if (attribs?.minRank) {
                filtered = filtered.filter((c) => rankingAtLeast(getPubRating(c), String(attribs.minRank)));
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

        // megnézzük, hogy a value egy tömb csoportban van-e, és kiszűrjük a már kiválasztott értékeket
        const key = getEffectiveFieldKey(fieldKey, fieldDescr.valueSource, store);
        const ix = getIndexFromKey(key);
        if (ix >= 0) {
            // a tömb hosszát a store-ból nézzük meg
            const keyParts = key.split("|");
            const lengthKey = [...keyParts.slice(0, -1), "_length"].join("|");
            const arrayLength = parseInt(store.data[lengthKey]) || 0;
            // összeszedjük az összes tömb indexet (kivéve a saját indexünket), és kiszűrjük a már kiválasztott értékeket
            const selectedByOthers = new Set(
                Array.from({ length: arrayLength }, (_, i) => i)
                    .filter((i) => i !== ix)
                    .map((i) => {
                        const otherKey = `$${keyParts.slice(0, -1).join("|")}[[${i}]]|${keyParts[keyParts.length - 1]}`;
                        return store.getField(otherKey);
                    })
                    .filter((v) => v !== "")
                    .map((v) => String(v))
            );
            return choices.filter((c) => !selectedByOthers.has(String(c.mtid)));
        } else {
            return choices;
        }
    }, [choices, value, attribs?.unique]);

    const template = useCallback(
        (node: HTMLDivElement | null) => {
            // A template-hez az összes choices-ból keressük (a kiválasztott érték megjelenítéséhez)
            const inner = pubItemSummary?.template ?? choices.find((c) => String(c.mtid) === value)?.template ?? "";
            if (inner && node) {
                node.innerHTML = inner;
                processMTMTTemplateLinks(node);
            }
        },
        [choices, value, pubItemSummary]
    );

    const rating = useMemo(() => {
        return pubItemSummary?.rating ?? getPubRating(pubItem ?? { mtid: "", title: "", template: "" });
    }, [mtmtPubList, value, pubItemSummary, pubItem]);

    const independentCitationCount = useMemo(() => {
        return pubItemSummary?.independentCitationCount ?? pubItem?.independentCitationCount ?? 0;
    }, [mtmtPubList, value, pubItemSummary, pubItem]);

    const description = (
        <div className="w-3/4 px-2 text-sm mtmt-publication">
            <div ref={template} />
            {rating && <div className="mt-1 italic text-gray-500">SJR: {rating}</div>}
            {independentCitationCount !== undefined && <div className="mt-1 italic text-gray-500">Független hivatkozások: {independentCitationCount}</div>}
        </div>
    );

    return (
        <>
            <div className="flex items-center space-x-2">
                <div className={`text-end w-1/4 font-medium leading-[0.95em] ${readonly ? "self-start" : ""}`}>{label}</div>
                {!readonly && (
                    <PubSelectField
                        className="flex flex-grow"
                        value={value ?? ""}
                        choices={availableChoices as PubChoice[]}
                        allChoices={choices as PubChoice[]}
                        onChange={(newValue) => {
                            setValue(newValue);
                        }}
                    />
                )}
                {readonly && value && <>{description}</>}
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
    const activeUser = useMTMTAuthorValue();

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
