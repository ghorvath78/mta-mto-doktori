export type PubItem = {
    mtid: string;
    title: string;
    template: string;
    journal?: object;
    book?: object;
    type?: { otypeName: string };
    subType?: { name: string };
    authorships?: object[];
    ratings?: { otype: string; ranking: string }[];
    independentCitationCount?: number;
};

export const getPubRating = (pubItem: PubItem): string => {
    if (pubItem.journal && pubItem.ratings) {
        const sjr = pubItem.ratings.find((r) => r.otype === "SjrRating");
        if (sjr) return sjr.ranking;
    }
    return "";
};
