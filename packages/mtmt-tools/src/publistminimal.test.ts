import { describe, expect, it } from "vitest";
import { countAuthorsInTemplate, getPubItemMinimal, withAuthorCounts, withAuthorCountsInMtmtData, type PubItemMinimal } from "./publistminimal";
import type { PubItem } from "./pubitem";
import { listEmbeddedMtmtData } from "../../../test-fixtures/fixtures";

// Az MTMT "short-list" sablonjának szerzőlistája (rövidítve, valódi mentett adat alapján)
const template = (authors: string) =>
    `<div class="JournalArticle Publication short-list"> <div class="authors">${authors}</div ><div class="title"><a mtid="1">Cím</a></div></div>`;
const withMtid = (name: string) =>
    ` <span class="author-name" mtid="10042440"> <a href="/gui2/?type=authors&mode=browse&sel=10042440" target="_blank">${name}</a> </span> <span class="author-type"> </span> `;
const withoutMtid = (name: string) => ` <span class="author-name" > ${name} </span> <span class="author-type"> </span> `;

describe("countAuthorsInTemplate", () => {
    it("az MTMT-azonosító nélküli szerzőket is megszámolja", () => {
        expect(countAuthorsInTemplate(template([withMtid("Esztergár-Kiss, D."), withoutMtid("Kerényi, T.")].join(";")))).toBe(2);
        expect(countAuthorsInTemplate(template([withMtid("A"), withoutMtid("B"), withMtid("C"), withMtid("D")].join(";")))).toBe(4);
    });

    it("szerzőlista nélküli sablonra undefined", () => {
        expect(countAuthorsInTemplate('<div class="title">Cím</div>')).toBeUndefined();
        expect(countAuthorsInTemplate("")).toBeUndefined();
    });
});

describe("authorCount", () => {
    it("mentéskor az authorships hosszából származik", () => {
        const pub = { mtid: "1", title: "", template: "", authorships: [{}, {}, {}] } as PubItem;
        expect(getPubItemMinimal(pub).authorCount).toBe(3);
    });

    it("betöltéskor csak a hiányzó értéket pótolja a sablonból", () => {
        const summaries: Record<string, PubItemMinimal> = {
            régi: { template: template([withMtid("A"), withoutMtid("B")].join(";")), rating: "D1" },
            új: { template: template(withMtid("A")), rating: "Q1", authorCount: 5 }
        };
        expect(withAuthorCounts(summaries)).toEqual({
            régi: { ...summaries.régi, authorCount: 2 },
            új: summaries.új
        });
        expect(withAuthorCountsInMtmtData({ Társszerzők: {} })).toEqual({ Társszerzők: {} });
    });
});

// A minta PDF-ekbe ágyazott (authorCount nélküli) gyorsítótárakon: minden publikációnak van
// sablonból kinyerhető szerzőszáma, és az sosem kevesebb az MTMT-azonosítós társszerzők számánál.
const samples = await listEmbeddedMtmtData();

describe("szerzőszám a mentett minták sablonjaiból", () => {
    it("vannak minták", () => {
        expect(samples.length).toBeGreaterThan(0);
    });

    it.each(samples)("$label", ({ data }) => {
        const pubs = withAuthorCountsInMtmtData(data)["Adatlapon szereplő publikációk"] as Record<string, PubItemMinimal>;
        const coAuthors = data["Társszerzők"] as Record<string, string[]>;
        for (const [mtid, pub] of Object.entries(pubs)) {
            expect(pub.authorCount, mtid).toBeGreaterThanOrEqual(Math.max(1, coAuthors[mtid]?.length ?? 0));
        }
    });
});
