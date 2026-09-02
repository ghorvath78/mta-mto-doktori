import { FormStore } from "./formstore";
import type { FormDescriptor, HeaderButtonDescriptor, PageDescriptor } from "./types";

export function createFormDescriptor({
    formName,
    title,
    subtitle,
    pages,
    buttons,
    extra
}: {
    formName: string;
    title: string;
    subtitle?: string;
    pages: PageDescriptor[];
    buttons?: HeaderButtonDescriptor[];
    extra: object;
}): FormDescriptor {
    return {
        formName,
        title,
        subtitle,
        pages,
        valueStore: new FormStore(formName, pages),
        buttons,
        ...extra
    };
}
