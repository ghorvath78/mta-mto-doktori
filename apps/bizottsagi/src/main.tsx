import { createRoot } from "react-dom/client";
import "@repo/ui/index.css";
import "@repo/form-engine/index.css";
import { createForm } from "@repo/form-engine";
import { bizottsagiFormDescriptor } from "./bizottsagiform.tsx";

const rootComponent = createForm(bizottsagiFormDescriptor);

createRoot(document.getElementById("root")!).render(rootComponent);
