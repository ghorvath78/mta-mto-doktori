import { Provider } from "jotai";
import { StrictMode } from "react";
import type { FormInfo } from "./forms.ts";
import { formInfoAtom, store } from "./atoms.ts";
import { MainScreen } from "./mainscreen.tsx";

export function createForm(formInfo: FormInfo) {
    store.set(formInfoAtom, formInfo);
    return <FormRoot />;
}

export const FormRoot = () => (
    <StrictMode>
        <Provider store={store}>
            <MainScreen />
        </Provider>
    </StrictMode>
);
