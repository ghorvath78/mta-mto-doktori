import type { JSX } from "react";
import type { TableCell } from "pdfmake/interfaces";
import type { PrimitiveAtom } from "jotai";
import type { FormStore } from "./formstore";

export type FormInfo = {
    name: string;
    title: string;
    subtitle?: string;
    descriptor: FormDescriptor;
    valueStore: FormStore;
    buttons?: { label: string; icon: JSX.Element; onClick: (formInfo: FormInfo, setDialogMessage: (message: string) => void) => Promise<void> }[];
    [key: string]: any;
};

export type CustomGroupComponent = ({ group, keyPrefix, index }: { group: GroupDescriptor; keyPrefix: string; index: number }) => JSX.Element;

// export type AttribType = { [key: string]: string | number | boolean | string[] | any };
export type AttribType = { [key: string]: any };

export type InputFieldType = "text" | "number" | "year" | "yearRange" | "select" | "selectAddOther" | "longtext" | "birthYearPlace" | "link" | (string & {});

export type FieldDescriptor = {
    label?: string;
    key: string;
    type: InputFieldType;
    attribs?: AttribType;
    value?: string;
    helpText?: string;
    noPersist?: boolean;
    readonly?: boolean;
    valueSource?: string;
} & ConditionalDescriptor;

export type SectionDescriptor = {
    label?: string;
    key: string;
    hidden?: boolean;
    helpText?: string;
    groups: GroupDescriptor[];
    attribs?: AttribType;
    noPersist?: boolean;
    readonly?: boolean;
} & ConditionalDescriptor;

export type GroupDescriptor = {
    label?: string;
    key: string;
    isArray?: boolean;
    arrayMin?: number;
    arrayMax?: number;
    arrayAddLabel?: string;
    fields: FieldDescriptor[];
    hidden?: boolean;
    attribs?: AttribType;
    customComponent?: CustomGroupComponent;
    noPersist?: boolean;
    readonly?: boolean;
    valueSource?: string;
    lengthSource?: string;
} & ConditionalDescriptor;

export type PageWrapperComponent = ({ children }: { children: React.ReactNode }) => JSX.Element;

export type PageDescriptor = {
    label?: string;
    key: string;
    sections: SectionDescriptor[];
    attribs?: AttribType;
    enabledAtom?: PrimitiveAtom<boolean>;
    wrapperComponent?: PageWrapperComponent;
};

export type FormDescriptor = {
    [pageKey: string]: PageDescriptor;
};

export type ConditionalDescriptor = {
    conditionKey?: string;
    conditionValue?: string;
};

export type PdfPrintingContext = {
    formInfo: FormInfo;
    index: number;
};

export type PdfPrintingOptions = {
    nolabel?: string;
    bibLabel?: string;
    bibLabels?: { [key: string]: string };
    bibIndex?: string;
    indexColWidth?: string | number;
    firstColWidth?: string | number;
    sectionIndex?: string | boolean;
    useGroupLabelAsHeader?: string | boolean;
    hideEmptyGroup?: string;
    fieldContext?: PdfPrintingContext;
    [key: string]: string | number | boolean | PdfPrintingContext | { [key: string]: string } | undefined;
};

export type FieldInputProps = {
    fieldKey: string;
    fieldDescr: FieldDescriptor;
};

export type InputFieldComponent = (props: FieldInputProps) => JSX.Element;

export type InputFieldPrinter = (
    label: string,
    value: string,
    fieldDescr: FieldDescriptor,
    options: PdfPrintingOptions
) => TableCell[][] | Promise<TableCell[][]>;

export type InputFieldRegistration = {
    component: InputFieldComponent;
    printer: InputFieldPrinter;
};
