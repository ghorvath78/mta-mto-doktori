import { cD, getFieldLabel, registerInputField, tagText, useFieldValue, type FieldInputProps } from "@repo/form-engine";

// A támogatottság (igen / összes szavazat) százalékos formában, magyar tizedesvesszővel ("77,8%").
// Ha még nincs leadott szavazat, null. A képernyő és a PDF-export (pdfsaver.ts) egyaránt ezt használja.
export function formatVotePercentage(igen: number, nem: number): string | null {
    const total = igen + nem;
    if (total <= 0) return null;
    return `${(Math.round((igen / total) * 1000) / 10).toLocaleString("hu-HU")}%`;
}

// Csak-olvasható, számított mező: a szavazócsoport testvér-mezőiből ("Igen szavazatok száma" /
// "Nem szavazatok száma", ugyanabban a csoportban) számolja ki a támogatottság százalékát. A
// fieldKey saját utolsó szegmensét levágva kapjuk meg a csoport prefixét, amiből a testvér-mezők
// kulcsai összeállíthatók. attribs.primaryBackground: világos címke primary (piros) hátterű csoportban.
const VotePercentage = ({ fieldKey, fieldDescr }: FieldInputProps) => {
    const groupPrefix = fieldKey.split("|").slice(0, -1).join("|");
    const igen = cD(useFieldValue(`${groupPrefix}|Igen szavazatok száma`));
    const nem = cD(useFieldValue(`${groupPrefix}|Nem szavazatok száma`));
    const percent = formatVotePercentage(igen, nem);
    const primaryBackground = fieldDescr.attribs?.primaryBackground === true;

    return (
        <div className="flex items-center space-x-2">
            <div className={`text-end w-1/4 font-medium leading-[0.95em] ${primaryBackground ? "text-primary-foreground" : ""}`}>
                {getFieldLabel(fieldDescr)}
            </div>
            <div className="py-1 px-0 flex-3">
                {percent ? (
                    tagText(percent)
                ) : (
                    <span className={`italic ${primaryBackground ? "text-primary-foreground" : "text-gray-500"}`}>Nincs megadva</span>
                )}
            </div>
        </div>
    );
};

registerInputField("votePercentage", {
    component: VotePercentage,
    printer: () => []
});
