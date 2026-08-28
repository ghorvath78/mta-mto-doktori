import { baseURL } from "./mtmtfetch";

export const isValidMTMTId = (s: string): boolean => {
    return s.length > 0 && /^\d+$/.test(s.trim());
};

export const processMTMTTemplateLinks = (node: HTMLDivElement) => {
    const anchors = node.querySelectorAll("a");
    anchors.forEach((a) => {
        const href = a.getAttribute("href") || "";
        // ignore empty, anchors, protocol-relative and absolute (scheme:) URLs
        if (!href || href.startsWith("#") || href.startsWith("//") || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)) return;
        try {
            a.style.color = "revert";
            if (href.includes("type=authors")) {
                const match = href.match(/sel=(\d+)/);
                if (match) {
                    const id = match[1];
                    a.setAttribute("href", new URL(`api/author/${id}`, baseURL).toString());
                    return;
                }
            }
            if (href.includes("params=publication")) {
                const match = href.match(/publication;(\d+)/);
                if (match) {
                    const id = match[1];
                    a.setAttribute("href", new URL(`api/publication/${id}`, baseURL).toString());
                    return;
                }
            }
            a.setAttribute("href", new URL(href, baseURL).toString());
        } catch {
            // invalid href — ignore or handle
            console.error("Invalid URL in MTMT template:", href);
        }
    });
};
