import {
    Button,
    Input,
    InputGroup,
    InputGroupInput,
    InputGroupAddon,
    InputGroupText,
    Spinner,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    AlertDialog,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription
} from "@repo/ui";
import type { FormData } from "@/forms";
import {
    activeMTMTUserIdAtom,
    getMTMTObject,
    isValidMTMTId,
    loadMTMTPublications,
    loadScientometrics,
    mtmtPubListStatusAtom,
    mtmtScientometricsStatusAtom
} from "../mtmt";
import { useAtom, useAtomValue } from "jotai";
import { Search } from "lucide-react";
import { useRef, useState, useCallback } from "react";

export const MTMTUserInput = ({
    label,
    fieldKey,
    formData,
    index,
    readonly = false,
    onMTMTIdChange,
    onBlur
}: {
    label: string;
    fieldKey: string;
    formData: FormData;
    index: number;
    readonly?: boolean;
    onMTMTIdChange?: (id: string, formData: FormData, fieldKey: string, index: number) => void;
    onBlur?: (value: string, setValue: (value: string) => void) => void;
}) => {
    const [value, setValue] = useAtom(formData[fieldKey]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeMTMTUserId, setActiveMTMTUserId] = useAtom(activeMTMTUserIdAtom);
    const mtmtPubListStatus = useAtomValue(mtmtPubListStatusAtom);
    const mtmtScientometricsStatus = useAtomValue(mtmtScientometricsStatusAtom);

    const fieldName = `${fieldKey}-${index}`;

    return (
        <div className="flex items-baseline space-x-2">
            <label className={`block mb-1 font-medium text-end w-1/4 leading-[0.95em]`} htmlFor={fieldName}>
                {label}
            </label>
            {readonly && (
                <a
                    id={fieldName}
                    className="py-1 px-2 flex-3 formlink"
                    href={`https://m2.mtmt.hu/api/author/${value[index]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {value[index]}
                </a>
            )}
            {!readonly && (
                <>
                    <InputGroup className="border border-gray-300 rounded py-1 px-2 flex-1 h-9 mr-0">
                        <InputGroupInput
                            className="h-[unset] px-0 py-0 md:text-base"
                            disabled={mtmtPubListStatus === "loading"}
                            id={fieldName}
                            name={fieldName}
                            value={value[index] ?? ""}
                            onChange={(e) => {
                                const newValue = [...value];
                                newValue[index] = e.target.value;
                                setValue(newValue);
                            }}
                            onBlur={(e) => {
                                const id = e.target.value;
                                if (onBlur)
                                    onBlur(id, (val) => {
                                        const newValue = [...value];
                                        newValue[index] = val;
                                        setValue(newValue);
                                    });
                                if (isValidMTMTId(id)) {
                                    if (onMTMTIdChange) onMTMTIdChange(id, formData, fieldKey, index);
                                    else if (activeMTMTUserId !== id) {
                                        setActiveMTMTUserId(id);
                                        loadMTMTPublications(id).then(() => {
                                            loadScientometrics();
                                        });
                                    }
                                }
                            }}
                        />
                        <InputGroupAddon align="inline-end">
                            {mtmtPubListStatus === "loading" && (
                                <>
                                    <Spinner />
                                    <InputGroupText>MTMT import...</InputGroupText>
                                </>
                            )}
                            {mtmtPubListStatus === "error" && <InputGroupText className="text-red-600">MTMT hiba (rossz azonosító?)</InputGroupText>}
                        </InputGroupAddon>
                    </InputGroup>
                    <Button
                        className="self-center ml-1 mr-0"
                        variant="outline"
                        aria-label="Info"
                        size="default"
                        disabled={mtmtPubListStatus === "loading"}
                        onClick={() => {
                            setDialogOpen(true);
                        }}
                    >
                        <Search /> Név alapján
                    </Button>
                    <MTMTIdFinder
                        isOpen={dialogOpen}
                        onClose={() => {
                            setDialogOpen(false);
                        }}
                        onSelect={(id) => {
                            const newValue = [...value];
                            newValue[index] = id;
                            setValue(newValue);
                            setDialogOpen(false);
                            if (isValidMTMTId(id)) {
                                if (onMTMTIdChange) onMTMTIdChange(id, formData, fieldKey, index);
                                else if (activeMTMTUserId !== id) {
                                    setActiveMTMTUserId(id);
                                    loadMTMTPublications(id).then(() => {
                                        loadScientometrics();
                                    });
                                }
                            }
                        }}
                    />
                </>
            )}
            <AlertDialog open={mtmtPubListStatus === "loading" || mtmtScientometricsStatus === "loading"}>
                <AlertDialogContent>
                    <AlertDialogTitle>Adatok importálása az MTMT-ből</AlertDialogTitle>
                    <AlertDialogDescription className="flex items-center">
                        <Spinner className="mr-2" />
                        {mtmtPubListStatus === "loading"
                            ? "Publikációk betöltése..."
                            : mtmtScientometricsStatus === "loading"
                              ? "Tudománymetriai táblázat betöltése (eltarthat egy ideig)..."
                              : ""}
                    </AlertDialogDescription>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

const MTMTIdFinder = ({ onSelect, onClose, isOpen }: { onSelect: (id: string) => void; onClose: () => void; isOpen: boolean }) => {
    const [name, setName] = useState<string>("");
    const [suggestions, setSuggestions] = useState<Array<{ mtid: string; label: string }>>([]);
    const fetching = useRef<boolean>(false);
    const query = useRef<string>("");
    const listRef = useRef<HTMLUListElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const fetchNames = useCallback(async () => {
        const fetchingForName = query.current;
        if (fetchingForName.length < 3) {
            setSuggestions([]);
            fetching.current = false;
            return;
        }
        try {
            const data = await getMTMTObject(
                "/api/author",
                `size=200&depth=0&cond=label;any;${query.current}&sort=familyName,asc&sort=givenName,asc&labelLang=hun`
            );
            if (query.current.length < 3) setSuggestions([]);
            else setSuggestions("content" in data ? (data["content"] as Array<{ mtid: string; label: string }>) : []);
            if (query.current !== fetchingForName) setTimeout(() => fetchNames(), 500);
            else fetching.current = false;
        } catch (err) {
            console.log(err);
        }
    }, [setSuggestions]);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => (open ? null : onClose())}>
                <DialogTrigger> </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>MTMT azonosító keresése név alapján</DialogTitle>
                        <DialogDescription>Kérjük, kezdje el beírni az MTMT-ben használt nevét.</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="grid flex-1 gap-2 relative">
                            <Input
                                ref={inputRef}
                                value={name}
                                onChange={(e) => {
                                    query.current = e.target.value;
                                    setName(e.target.value);
                                    if (query.current.length > 3 && fetching.current === false) {
                                        fetching.current = true;
                                        setTimeout(() => fetchNames(), 500);
                                    } else if (query.current.length <= 3) {
                                        fetching.current = false;
                                        setSuggestions([]);
                                    }
                                }}
                                placeholder="Írja be a nevét (min. 3 karakter)"
                            />
                            {/* Inline dropdown — doesn't steal focus from the input.
                                Use onMouseDown to prevent the input from blurring when clicking an item.
                                Has max height + overflow so it scrolls when long. */}
                            {suggestions.length > 0 && (
                                <div className="absolute left-0 right-0 mt-9 z-50 max-h-56 overflow-auto rounded border bg-white shadow-md">
                                    <ul id="mtmt-suggestions" ref={listRef} role="listbox" aria-label="Találatok">
                                        {suggestions.map((s, idx) => (
                                            <li
                                                id={`mtmt-suggestion-${idx}`}
                                                key={s.mtid}
                                                role="option"
                                                className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-50 text-nowrap overflow-hidden"
                                                onMouseDown={(e) => {
                                                    // prevent input blur so keyboard focus remains on input
                                                    e.preventDefault();
                                                }}
                                                onClick={() => {
                                                    onSelect(String(s.mtid));
                                                }}
                                            >
                                                <span className="font-medium">{s.label}</span>
                                                <span className="text-xs text-gray-500">&nbsp; - MTMT: {s.mtid}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-end">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Bezár
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
