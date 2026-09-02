import { createRoot } from "react-dom/client";
import "@repo/ui/index.css";
import "@repo/form-engine/index.css";
import { registerInputField } from "@repo/form-engine";
import { MTMTCitationInput, MTMTItemFieldPrinter, MTMTPubInput, MTMTUserFieldPrinter, MTMTUserInput } from "@repo/mtmt-tools";
import { createForm } from "@repo/form-engine";
import { eloterjesztoiFormDescriptor } from "./eloterjesztoiform.tsx";

registerInputField("mtmtUser", { component: MTMTUserInput, printer: MTMTUserFieldPrinter });
registerInputField("mtmtPub", { component: MTMTPubInput, printer: MTMTItemFieldPrinter });
registerInputField("mtmtCitation", { component: MTMTCitationInput, printer: MTMTItemFieldPrinter });

const rootComponent = createForm(eloterjesztoiFormDescriptor);

createRoot(document.getElementById("root")!).render(rootComponent);
