import { store } from "@repo/form-engine";
import type { InputFieldPrinter } from "@repo/form-engine";
import { removeSpecialUtf8KeepAccents } from "@repo/form-engine";
import { getPubItemSummary, loadMTMTCitations, mtmtPubListAtom, mtmtPubSummaryCacheAtom, type PubItemSummary } from "./mtmt";

export const MTMTUserFieldPrinter: InputFieldPrinter = (label, value) => {
    return [[{ text: label }, { text: value || "-", link: value ? `https://m2.mtmt.hu/api/author/${value}` : undefined, style: value ? "link" : undefined }]];
};

export const MTMTItemFieldPrinter: InputFieldPrinter = async (label, value, fieldDescr, options) => {
    const mtmt = String(value);
    const pubSummaries = store.get(mtmtPubSummaryCacheAtom);
    let pubSummary: PubItemSummary | null = pubSummaries[mtmt] ?? null;
    if (!pubSummary) {
        const pub = store.get(mtmtPubListAtom).find((item) => String(item.mtid) === mtmt);
        pubSummary = pub ? getPubItemSummary(pub) : null;
    }
    if (fieldDescr.type === "mtmtCitation" && !pubSummary && mtmt) {
        const fieldContext = options.fieldContext;
        const pubKey = String(fieldDescr.attribs?.pubKey ?? "");
        const pubMTMT = fieldContext?.formData[pubKey] ? store.get(fieldContext.formData[pubKey])[fieldContext.index] : "";
        const citations = pubMTMT ? await loadMTMTCitations(pubMTMT) : [];
        const pub = citations.find((item) => String(item.mtid) === mtmt);
        pubSummary = pub ? getPubItemSummary(pub) : null;
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
                          text: mtmt,
                          link: `https://m2.mtmt.hu/api/publication/${mtmt}`,
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
                      text: mtmt || "nincs megadva",
                      link: mtmt ? `https://m2.mtmt.hu/api/publication/${mtmt}` : undefined,
                      style: mtmt ? "link" : undefined
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
