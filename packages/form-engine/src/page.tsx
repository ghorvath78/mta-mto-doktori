import { Fragment } from "react/jsx-runtime";
import type { FormData, PageDescriptor } from "./forms";
import { Section } from "./section";

export const Page = ({ descriptor, formData, keyPrefix }: { descriptor: PageDescriptor; formData: FormData; keyPrefix: string }) => {
    const Wrapper = descriptor.wrapperComponent ?? Fragment;
    return (
        <section className="flex-grow pl-4 min-w-0">
            <Wrapper>
                {descriptor.sections
                    .filter((section) => !section.hidden)
                    .map((section) => (
                        <Section key={section.key} section={section} formData={formData} keyPrefix={`${keyPrefix}|${section.key}`} />
                    ))}
            </Wrapper>
        </section>
    );
};
