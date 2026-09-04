import { createRoot } from "react-dom/client";
import "@repo/ui/index.css";
import "@repo/form-engine/index.css";
import { createForm } from "@repo/form-engine";
import { eloterjesztoiFormDescriptor } from "./eloterjesztoiform.tsx";

const rootComponent = createForm(eloterjesztoiFormDescriptor);

createRoot(document.getElementById("root")!).render(rootComponent);
