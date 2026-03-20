import type { FormData, PageDescriptor } from "./forms";
import { Section } from "./section";

export const Page = ({ descriptor, formData, keyPrefix }: { descriptor: PageDescriptor; formData: FormData; keyPrefix: string }) => {
    return (
        <section className="flex-grow pl-4">
            {descriptor.sections
                .filter((section) => !section.hidden)
                .map((section) => (
                    <Section key={section.key} section={section} formData={formData} keyPrefix={`${keyPrefix}|${section.key}`} />
                ))}
        </section>
    );
};
