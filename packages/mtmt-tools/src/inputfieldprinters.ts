import { removeSpecialUtf8KeepAccents } from "@repo/form-engine";
import type { InputFieldPrinter } from "@repo/form-engine/types";
import { getPubItemMinimal, type PubItemMinimal, type PubListMinimal } from "./publistminimal";
import type { PubList } from "./publist";
import { loadMTMTCitations } from "./citations";

export const MTMTUserFieldPrinter: InputFieldPrinter = (label, value) => {
    return [[{ text: label }, { text: value || "-", link: value ? `https://m2.mtmt.hu/api/author/${value}` : undefined, style: value ? "link" : undefined }]];
};

export const MTMTItemFieldPrinter: InputFieldPrinter = async (label, value, fieldDescr, options) => {
    const fieldContext = options.fieldContext;
    const formDescriptor = fieldContext?.formDescriptor;
    if (!fieldContext || !formDescriptor) return [];
    const pubListMinimal = formDescriptor["mtmtPubListMinimal"] as PubListMinimal;
    const mtid = String(value);
    let pubSummary: PubItemMinimal | null = pubListMinimal?.getPublication?.(mtid) ?? null;
    if (!pubSummary) {
        const pubList = formDescriptor["mtmtPubList"] as PubList;
        const pub = pubList?.getPublication?.(mtid) ?? null;
        pubSummary = pub ? getPubItemMinimal(pub) : null;
    }
    if (fieldDescr.type === "mtmtCitation" && !pubSummary && mtid) {
        let pubKey = String(fieldDescr.attribs?.pubKey ?? "");
        if (formDescriptor.valueStore.isFieldinArrayGroup(pubKey)) {
            pubKey = formDescriptor.valueStore.getFieldKeyForArrayItem(pubKey, fieldContext.index ?? 0);
        }
        const pubMTMT = formDescriptor.valueStore.getField(pubKey) || "";
        const citations = pubMTMT ? await loadMTMTCitations(pubMTMT) : [];
        const pub = citations.find((item) => String(item.mtid) === mtid);
        pubSummary = pub ? getPubItemMinimal(pub) : null;
    }

    const el = document.createElement("div");
    el.innerHTML = pubSummary?.template ?? "";
    const authors = Array.from(el.getElementsByClassName("author-name"))
        .map((element) => removeSpecialUtf8KeepAccents(element.textContent ?? ""))
        .join(", ");
    const title = el.getElementsByClassName("title")[0]?.textContent ?? "";
    const info = el.getElementsByClassName("pub-info")[0]?.textContent ?? "";
    const category = el.getElementsByClassName("pub-category")[0]?.textContent ?? "";
    const type = el.getElementsByClassName("pub-type")[0]?.textContent ?? "";
    const ranking = pubSummary ? pubSummary.rating : "N/A";
    const citations = pubSummary ? (pubSummary.independentCitationCount ?? "N/A") : "N/A";
    const fieldName = fieldDescr.label || fieldDescr.key;
    const baseLabel =
        options.bibLabel !== undefined
            ? String(options.bibLabel)
            : options.bibLabels && typeof options.bibLabels === "object" && fieldName in options.bibLabels
              ? String(options.bibLabels[fieldName])
              : label;
    const baseIndex = options.bibIndex && fieldDescr.type === "mtmtPub" ? [{ text: `[${(options.fieldContext?.index ?? 0) + 1}]`, bold: true }] : [];
    const pubBody = pubSummary
        ? [
              [
                  [...baseIndex, { text: String(baseLabel) }],
                  [
                      {
                          text: mtid,
                          link: `https://m2.mtmt.hu/api/publication/${mtid}`,
                          style: "link"
                      },
                      { text: authors, style: "authors" },
                      { text: title, style: "title" },
                      { text: info, style: "info" },
                      { text: `${category} ${type}, SJR: ${ranking}, Független idézők: ${citations}`, style: "info" }
                  ]
              ]
          ]
        : [
              [
                  { text: String(baseLabel) },
                  {
                      text: mtid || "nincs megadva",
                      link: mtid ? `https://m2.mtmt.hu/api/publication/${mtid}` : undefined,
                      style: mtid ? "link" : undefined
                  }
              ]
          ];
    const indexColWidth = options.indexColWidth ? parseInt(String(options.indexColWidth)) : 24;

    return [
        [
            {
                colSpan: 2,
                layout: {
                    defaultBorder: false,
                    paddingBottom: () => 0,
                    paddingTop: () => 0,
                    paddingLeft: () => 0,
                    paddingRight: () => 0
                },
                table: { widths: [indexColWidth, "*"], body: pubBody, dontBreakRows: true },
                margin: [0, 0, 0, 0]
            },
            { text: "" }
        ]
    ];
};
