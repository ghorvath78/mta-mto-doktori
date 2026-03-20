import { createRoot } from "react-dom/client";
import "@repo/ui/index.css";
import "@repo/form-engine/index.css";
import { createForm } from "@repo/form-engine";
import { eloterjesztoiFormInfo } from "./eloterjesztoiform";

const rootComponent = createForm(eloterjesztoiFormInfo);

createRoot(document.getElementById("root")!).render(rootComponent);
