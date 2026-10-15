import { describe, expect, it } from "vitest";
import { getMinCommunityCount, getMinTotalI, getShortThesisD1Share, getWosCitationCount, shortThesisNumericalRequirementsMet } from "../src/requirements";

// Rövid értekezéssel pályázók (mindhárom kategóriában): SJR D1 cikkek összegzett szerzői aránya 3,00-nál
// több, független WoS hivatkozások száma 750-nél nagyobb, közéleti követelmény: 11 területből legalább 5.
describe("rövid értekezés követelményei", () => {
    it("a határértékek szigorúan értendők", () => {
        expect(shortThesisNumericalRequirementsMet(3, 751)).toBe(false);
        expect(shortThesisNumericalRequirementsMet(3.001, 750)).toBe(false);
        expect(shortThesisNumericalRequirementsMet(3.001, 751)).toBe(true);
    });

    it("a D1 szerzői arányt és a WoS hivatkozásokat az MTMT tudománymetriai táblázatából veszi", () => {
        const sciMetrics: unknown[][] = Array.from({ length: 30 }, () => [0]);
        sciMetrics[11] = [1355];
        sciMetrics[17] = ["15,719"];
        expect(getShortThesisD1Share(sciMetrics)).toBeCloseTo(15.719);
        expect(getWosCitationCount(sciMetrics)).toBe(1355);
        expect(getShortThesisD1Share([])).toBe(0);
    });

    it("az I-szám küszöbe és a közéleti követelmény nem függ a doktori mű formájától", () => {
        expect(getMinTotalI("A")).toBe(90);
        expect(getMinTotalI("B")).toBe(200);
        expect(getMinCommunityCount()).toBe(5);
    });
});
