export interface SampleDownload {
    title: string;
    description: string;
    path: string;
}

export const sampleDownloads: SampleDownload[] = [
    {
        title: "kerelmezoi-teszt-teljes.pdf",
        description: "Kitalált adatokkal kitöltött példa a kérelmezői adatlaphoz, teljes értekezéses pályázat esetén",
        path: "./mintak/kerelmezoi-teszt-teljes.pdf"
    },
    {
        title: "kerelmezoi-teszt-rovid.pdf",
        description: "Kitalált adatokkal kitöltött példa a kérelmezői adatlaphoz, rövid értekezéses pályázat esetén",
        path: "./mintak/kerelmezoi-teszt-rovid.pdf"
    },
    {
        title: "eloterjesztoi-teszt-1-teljes.pdf",
        description: "Kitalált adatokkal kitöltött példa az előterjesztői adatlaphoz, teljes értekezéses pályázat esetén",
        path: "./mintak/eloterjesztoi-teszt-1-teljes.pdf"
    },
    {
        title: "eloterjesztoi-teszt-2-teljes.pdf",
        description: "Más kitalált adatokkal kitöltött példa az előterjesztői adatlaphoz, teljes értekezéses pályázat esetén",
        path: "./mintak/eloterjesztoi-teszt-2-teljes.pdf"
    },
    {
        title: "eloterjesztoi-teszt-rovid-1.pdf",
        description: "Kitalált adatokkal kitöltött példa az előterjesztői adatlaphoz, rövid értekezéses pályázat esetén",
        path: "./mintak/eloterjesztoi-teszt-rovid-1.pdf"
    },
    {
        title: "eloterjesztoi-teszt-rovid-2.pdf",
        description: "Más kitalált adatokkal kitöltött példa az előterjesztői adatlaphoz, rövid értekezéses pályázat esetén",
        path: "./mintak/eloterjesztoi-teszt-rovid-2.pdf"
    },
    {
        title: "bizottsagi-teszt-teljes.pdf",
        description:
            "Kitalált adatokkal kitöltött példa a bizottsági adatlaphoz, teljes értekezéses pályázat esetén (a két teljes értekezéses előterjesztői példára épül)",
        path: "./mintak/bizottsagi-teszt-teljes.pdf"
    },
    {
        title: "bizottsagi-teszt-rovid.pdf",
        description:
            "Kitalált adatokkal kitöltött példa a bizottsági adatlaphoz, rövid értekezéses pályázat esetén (a két rövid értekezéses előterjesztői példára épül)",
        path: "./mintak/bizottsagi-teszt-rovid.pdf"
    }
];
