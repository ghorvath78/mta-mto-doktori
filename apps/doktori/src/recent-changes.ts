export interface ChangeEntry {
    date: string;
    description: string;
}

export const recentChanges: ChangeEntry[] = [
    {
        date: "2026-05-25",
        description:
            "A Kérelmezői és az előterjesztői űrlap a tesztelők visszajelzései alapján kis mértékben megváltoztak. Sajnos a változás miatt a korábbi verzióval készült űrlapok is átalakítást igényelnek. Ennek érdekében az alkalmazásban be kell olvasni a régi űrlapot, ki kell tölteni néhány megüresedett mezőt, majd újra le kell menteni az űrlapot. A kérelmezői űrlap esetében a nyelvvizsák, az aktuális munkahely betöltésének kezdőéve, az alkotások leírása, és a közéleti szempontok alátámasztó linkjei igényelnek újbóli megadást. Az adatok többsége a korábbi űrlap pdf nézetéről leolvasható. Az előterjesztői űrlap konverziójakor a már átkonvertált kérelmezői űrlapot is újra be kell tölteni. Erre a műveletre sajnos szükség volt, de a jövőben igyekszünk elkerülni az ilyen jellegű változtatásokat."
    }
];
