import { createRoot } from "react-dom/client";
import "@repo/ui/index.css";
import "@repo/form-engine/index.css";
import { EmptyFieldPrinter, registerInputField } from "@repo/form-engine";
import { MTMTCitationInput, MTMTItemFieldPrinter, MTMTPubInput, MTMTScientometrics, MTMTUserFieldPrinter, MTMTUserInput } from "@repo/mtmt-tools";
import { createForm } from "@repo/form-engine";
import { kerelmezoiFormInfo } from "./kerelmezoiform";

registerInputField("mtmtUser", { component: MTMTUserInput, printer: MTMTUserFieldPrinter });
registerInputField("mtmtPub", { component: MTMTPubInput, printer: MTMTItemFieldPrinter });
registerInputField("mtmtCitation", { component: MTMTCitationInput, printer: MTMTItemFieldPrinter });
registerInputField("mtmtTable", { component: MTMTScientometrics, printer: EmptyFieldPrinter });

const rootComponent = createForm(kerelmezoiFormInfo);

createRoot(document.getElementById("root")!).render(rootComponent);
