import { EmptyFieldPrinter, registerInputField } from "@repo/form-engine";
import { PubListMinimal } from "./publistminimal";
import { PubList } from "./publist";
import { Scientometrics } from "./scientometrics";
import { MTMTItemFieldPrinter, MTMTUserFieldPrinter } from "./inputfieldprinters";
import { MTMTPubInput } from "./inputfields/mtmtpubinput";
import { MTMTCitationInput } from "./inputfields/mtmtcitationinput";
import { MTMTScientometrics } from "./inputfields/mtmtscientometrics";
import { MTMTUserInput } from "./inputfields/mtmtuserinput";

export function createMTMTTools() {
    registerInputField("mtmtUser", { component: MTMTUserInput, printer: MTMTUserFieldPrinter });
    registerInputField("mtmtPub", { component: MTMTPubInput, printer: MTMTItemFieldPrinter });
    registerInputField("mtmtCitation", { component: MTMTCitationInput, printer: MTMTItemFieldPrinter });
    registerInputField("mtmtTable", { component: MTMTScientometrics, printer: EmptyFieldPrinter });

    return { mtmtPubList: new PubList(), mtmtPubListMinimal: new PubListMinimal(), mtmtScientometrics: new Scientometrics() };
}
