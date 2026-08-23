import { Provider } from "jotai";
import { StrictMode } from "react";
import type { FormInfo } from "./forms.ts";
import { store } from "./atoms.ts";
import { MainScreen } from "./mainscreen.tsx";

export function createForm(formInfo: FormInfo) {
    return <FormRoot formInfo={formInfo} />;
}

export const FormRoot = ({ formInfo }: { formInfo: FormInfo }) => (
    <StrictMode>
        <Provider store={store}>
            <MainScreen formInfo={formInfo} />
        </Provider>
    </StrictMode>
);
