import { StrictMode, type ReactNode } from "react";
import { MainScreen } from "./mainscreen.tsx";
import type { FormDescriptor } from "./types.ts";
import { FormInfoContext, StoreContext } from "./hooks.ts";

export function FormProvider({ info, children }: { info: FormDescriptor; children: ReactNode }) {
    return (
        <FormInfoContext.Provider value={info}>
            <StoreContext.Provider value={info.valueStore}>{children}</StoreContext.Provider>
        </FormInfoContext.Provider>
    );
}

export function createForm(formInfo: FormDescriptor) {
    return <FormRoot formInfo={formInfo} />;
}

export const FormRoot = ({ formInfo }: { formInfo: FormDescriptor }) => (
    <StrictMode>
        <FormProvider info={formInfo}>
            <MainScreen />
        </FormProvider>
    </StrictMode>
);
