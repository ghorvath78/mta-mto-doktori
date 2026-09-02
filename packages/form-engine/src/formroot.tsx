import { StrictMode, type ReactNode } from "react";
import { MainScreen } from "./mainscreen.tsx";
import type { FormDescriptor } from "./types.ts";
import { FormDescriptorContext, StoreContext } from "./hooks.ts";

export function FormProvider({ descriptor, children }: { descriptor: FormDescriptor; children: ReactNode }) {
    return (
        <FormDescriptorContext.Provider value={descriptor}>
            <StoreContext.Provider value={descriptor.valueStore}>{children}</StoreContext.Provider>
        </FormDescriptorContext.Provider>
    );
}

export function createForm(formDescriptor: FormDescriptor) {
    return <FormRoot formDescriptor={formDescriptor} />;
}

export const FormRoot = ({ formDescriptor }: { formDescriptor: FormDescriptor }) => (
    <StrictMode>
        <FormProvider descriptor={formDescriptor}>
            <MainScreen />
        </FormProvider>
    </StrictMode>
);
