import { cD, registerInputField, useFieldValue, type FieldInputProps } from "@repo/form-engine";

// Csak-olvasható, számított mező: a szavazócsoport testvér-mezőiből ("Igen szavazatok száma" /
// "Nem szavazatok száma", ugyanabban a csoportban) számolja ki a támogatottság százalékát. A
// fieldKey saját utolsó szegmensét levágva kapjuk meg a csoport prefixét, amiből a testvér-mezők
// kulcsai összeállíthatók.
const VotePercentage = ({ fieldKey }: FieldInputProps) => {
    const groupPrefix = fieldKey.split("|").slice(0, -1).join("|");
    const igen = cD(useFieldValue(`${groupPrefix}|Igen szavazatok száma`));
    const nem = cD(useFieldValue(`${groupPrefix}|Nem szavazatok száma`));
    const total = igen + nem;
    const percent = total > 0 ? Math.round((igen / total) * 1000) / 10 : 0;

    return (
        <div className="flex items-center space-x-2">
            <div className="text-end w-1/4 font-medium leading-[0.95em]">Támogatottság</div>
            <div className="py-1 px-2 flex-3">
                {total > 0 ? `${percent}% (igen: ${igen}, nem: ${nem})` : <span className="italic text-gray-500">Nincs megadva</span>}
            </div>
        </div>
    );
};

registerInputField("votePercentage", {
    component: VotePercentage,
    printer: () => []
});
