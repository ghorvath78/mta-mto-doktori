import type { JSX } from "react";
import type { TableCell } from "pdfmake/interfaces";
import type { FormStore } from "./formstore";

export type HeaderButtonDescriptor = {
    label: string;
    icon: JSX.Element;
    onClick: (formDescriptor: FormDescriptor, setDialogMessage: (message: string) => void) => Promise<void>;
};

export type FormDescriptor = {
    formName: string;
    title: string;
    subtitle?: string;
    pages: PageDescriptor[];
    valueStore: FormStore;
    buttons?: HeaderButtonDescriptor[];
    [key: string]: any;
};

export type CustomGroupComponent = ({ group, keyPrefix, index }: { group: GroupDescriptor; keyPrefix: string; index: number }) => JSX.Element;

// export type AttribType = { [key: string]: string | number | boolean | string[] | any };
export type AttribType = { [key: string]: any };

export type InputFieldType = "text" | "number" | "year" | "yearRange" | "select" | "selectAddOther" | "longtext" | "birthYearPlace" | "link" | (string & {});

export type FieldDescriptor = {
    type: InputFieldType;
    value?: string;
    helpText?: string;
    noPersist?: boolean;
    readonly?: boolean;
    valueSource?: string;
} & FormComponentDescriptor;

export type SectionDescriptor = {
    hidden?: boolean;
    helpText?: string;
    groups: GroupDescriptor[];
    noPersist?: boolean;
    readonly?: boolean;
} & FormComponentDescriptor;

export type GroupDescriptor = {
    isArray?: boolean;
    arrayMin?: number;
    arrayMax?: number;
    arrayAddLabel?: string;
    fields: FieldDescriptor[];
    hidden?: boolean;
    customComponent?: CustomGroupComponent;
    noPersist?: boolean;
    readonly?: boolean;
    valueSource?: string;
    lengthSource?: string;
} & FormComponentDescriptor;

export type PageWrapperComponent = ({ children }: { children: React.ReactNode }) => JSX.Element;

export type PageDescriptor = {
    sections: SectionDescriptor[];
    wrapperComponent?: PageWrapperComponent;
} & FormComponentDescriptor;

export type ConditionalDescriptor = {
    conditionKey?: string;
    conditionValue?: string;
};

export type FormComponentDescriptor = {
    label?: string;
    key: string;
    attribs?: AttribType;
} & ConditionalDescriptor;

export type PdfPrintingContext = {
    formDescriptor: FormDescriptor;
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
