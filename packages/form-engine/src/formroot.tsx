import { StrictMode, type ReactNode } from "react";
import { MainScreen } from "./mainscreen.tsx";
import type { FormInfo } from "./types.ts";
import { FormInfoContext, StoreContext } from "./hooks.ts";

export function FormProvider({ info, children }: { info: FormInfo; children: ReactNode }) {
    return (
        <FormInfoContext.Provider value={info}>
            <StoreContext.Provider value={info.valueStore}>{children}</StoreContext.Provider>
        </FormInfoContext.Provider>
    );
}

export function createForm(formInfo: FormInfo) {
    return <FormRoot formInfo={formInfo} />;
}

export const FormRoot = ({ formInfo }: { formInfo: FormInfo }) => (
    <StrictMode>
        <FormProvider info={formInfo}>
            <MainScreen />
        </FormProvider>
    </StrictMode>
);
