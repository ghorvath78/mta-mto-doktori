import { createRoot } from "react-dom/client";
import "@repo/ui/index.css";
import "@repo/form-engine/index.css";
import { EmptyFieldPrinter, registerInputField } from "@repo/form-engine";
import { MTMTCitationInput, MTMTItemFieldPrinter, MTMTPubInput, MTMTScientometrics, MTMTUserFieldPrinter, MTMTUserInput } from "@repo/mtmt-tools";
import { createForm } from "@repo/form-engine";
import { kerelmezoiFormInfo } from "./kerelmezoiform";

const rootComponent = createForm(kerelmezoiFormInfo);

createRoot(document.getElementById("root")!).render(rootComponent);
