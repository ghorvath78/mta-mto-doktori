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
        title: "eloterjesztoi-teszt-rovid.pdf",
        description: "Kitalált adatokkal kitöltött példa az előterjesztői adatlaphoz, rövid értekezéses pályázat esetén",
        path: "./mintak/eloterjesztoi-teszt-rovid.pdf"
    },
    {
        title: "bizottsagi-teszt-teljes.pdf",
        description: "Kitalált adatokkal kitöltött példa a bizottsági adatlaphoz",
        path: "./mintak/bizottsagi-teszt-teljes.pdf"
    }
];
