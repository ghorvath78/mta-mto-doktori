import type { InputFieldComponent, InputFieldType } from "./forms";
import { BirthDataInput } from "./inputfields/birthdatainput";
import { DecisionTextInput } from "./inputfields/decisiontext";
import { DecisionYesNoInput } from "./inputfields/decisionyesnoinput";
import { LongTextInput } from "./inputfields/longtextinput";
import { MTMTCitationInput } from "./inputfields/mtmtcitationinput";
import { MTMTPubInput } from "./inputfields/mtmtpubinput";
import { MTMTScientometrics } from "./inputfields/mtmtscientometrics";
import { MTMTUserInput } from "./inputfields/mtmtuserinput";
import { NumberInput } from "./inputfields/numberinput";
import { SelectOrAddInput } from "./inputfields/selectoraddinput";
import { TextInput } from "./inputfields/textinput";
import { YearInput } from "./inputfields/yearinput";
import { YearRangeInput } from "./inputfields/yearrangeinput";

export const inputFieldStore = new Map<string, InputFieldComponent>();

export function registerInputField(fieldType: InputFieldType, component: InputFieldComponent): void {
    inputFieldStore.set(fieldType, component);
}

export function getInputFieldComponent(fieldType: InputFieldType): InputFieldComponent | undefined {
    return inputFieldStore.get(fieldType);
}

const builtInInputFields: Array<[InputFieldType, InputFieldComponent]> = [
    ["text", TextInput],
    ["number", NumberInput],
    ["year", YearInput],
    ["yearRange", YearRangeInput],
    ["select", SelectOrAddInput],
    ["selectAddOther", SelectOrAddInput],
    ["longtext", LongTextInput],
    ["birthYearPlace", BirthDataInput],
    ["mtmtUser", MTMTUserInput],
    ["mtmtPub", MTMTPubInput],
    ["mtmtCitation", MTMTCitationInput],
    ["link", TextInput],
    ["mtmtTable", MTMTScientometrics],
    ["decisionText", DecisionTextInput],
    ["decisionYesNo", DecisionYesNoInput]
];

for (const [fieldType, component] of builtInInputFields) {
    registerInputField(fieldType, component);
}
