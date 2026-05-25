import type { InputFieldPrinter, InputFieldRegistration, InputFieldType } from "./forms";
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
import {
    BirthYearPlaceFieldPrinter,
    DecisionTextFieldPrinter,
    DecisionYesNoFieldPrinter,
    EmptyFieldPrinter,
    LinkFieldPrinter,
    LongTextFieldPrinter,
    MTMTItemFieldPrinter,
    MTMTUserFieldPrinter,
    SimpleFieldPrinter,
    YearRangeFieldPrinter
} from "./inputfieldprinters.ts";

export const inputFieldStore = new Map<string, InputFieldRegistration>();

export function registerInputField(fieldType: InputFieldType, registration: InputFieldRegistration): void {
    inputFieldStore.set(fieldType, registration);
}

export function getInputFieldComponent(fieldType: InputFieldType) {
    return inputFieldStore.get(fieldType)?.component;
}

export function getInputFieldPrinter(fieldType: InputFieldType): InputFieldPrinter | undefined {
    return inputFieldStore.get(fieldType)?.printer;
}

const builtInInputFields: Array<[InputFieldType, InputFieldRegistration]> = [
    ["text", { component: TextInput, printer: SimpleFieldPrinter }],
    ["number", { component: NumberInput, printer: SimpleFieldPrinter }],
    ["year", { component: YearInput, printer: SimpleFieldPrinter }],
    ["yearRange", { component: YearRangeInput, printer: YearRangeFieldPrinter }],
    ["select", { component: SelectOrAddInput, printer: SimpleFieldPrinter }],
    ["selectAddOther", { component: SelectOrAddInput, printer: SimpleFieldPrinter }],
    ["longtext", { component: LongTextInput, printer: LongTextFieldPrinter }],
    ["birthYearPlace", { component: BirthDataInput, printer: BirthYearPlaceFieldPrinter }],
    ["mtmtUser", { component: MTMTUserInput, printer: MTMTUserFieldPrinter }],
    ["mtmtPub", { component: MTMTPubInput, printer: MTMTItemFieldPrinter }],
    ["mtmtCitation", { component: MTMTCitationInput, printer: MTMTItemFieldPrinter }],
    ["link", { component: TextInput, printer: LinkFieldPrinter }],
    ["mtmtTable", { component: MTMTScientometrics, printer: EmptyFieldPrinter }],
    ["decisionText", { component: DecisionTextInput, printer: DecisionTextFieldPrinter }],
    ["decisionYesNo", { component: DecisionYesNoInput, printer: DecisionYesNoFieldPrinter }]
];

for (const [fieldType, registration] of builtInInputFields) {
    registerInputField(fieldType, registration);
}
