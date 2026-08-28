import { Fragment } from "react";
import { Section } from "./section";
import type { PageDescriptor } from "./types";

export const Page = ({ descriptor, keyPrefix }: { descriptor: PageDescriptor; keyPrefix: string }) => {
    const Wrapper = descriptor.wrapperComponent ?? Fragment;
    return (
        <section className="flex-grow pl-4 min-w-0">
            <Wrapper>
                {descriptor.sections
                    .filter((section) => !section.hidden)
                    .map((section) => (
                        <Section key={section.key} section={section} keyPrefix={`${keyPrefix}|${section.key}`} />
                    ))}
            </Wrapper>
        </section>
    );
};
