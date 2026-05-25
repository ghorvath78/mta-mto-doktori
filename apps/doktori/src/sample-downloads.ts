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
        title: "eloterjesztoi-teszt-teljes.pdf",
        description: "Kitalált adatokkal kitöltött példa az előterjesztői adatlaphoz, teljes értekezéses pályázat esetén",
        path: "./mintak/eloterjesztoi-teszt-teljes.pdf"
    },
    {
        title: "eloterjesztoi-teszt-rovid.pdf",
        description: "Kitalált adatokkal kitöltött példa az előterjesztői adatlaphoz, rövid értekezéses pályázat esetén",
        path: "./mintak/eloterjesztoi-teszt-rovid.pdf"
    }
];
