export interface ChangeEntry {
    date: string;
    description: string;
}

export const recentChanges: ChangeEntry[] = [
    {
        date: "2026-10-15",
        description:
            "Az előterjesztői és a bizottsági űrlapon a tudományági és szakterületi illetékesség, valamint a doktori mű formai alkalmasságának megállapítása a „Pályázó adatai” lapról önálló lapra került. A korábban mentett adatlapok változtatás nélkül betölthetők, az adataik automatikusan az új helyükre kerülnek. Javítottuk a rövid értekezéssel pályázókra vonatkozó követelmények ellenőrzését: az SJR D1 cikkek összegzett szerzői aránya és a téziseket alátámasztó publikációk szerzőszáma most a teljes szerzőlista alapján számolódik. A PDF-ekben megjelenik az I-szám minimuma, a bizottsági PDF szakterületi illetékességről szóló fejezete pedig az előírt tagolást követi. Elkészültek a rövid értekezéses előterjesztői és bizottsági példák is."
    },
    {
        date: "2026-09-13",
        description: "Elkészült a bizottsági űrlap, tesztelhető."
    },
    {
        date: "2026-05-25",
        description:
            "A Kérelmezői és az előterjesztői űrlap a tesztelők visszajelzései alapján kis mértékben megváltoztak. Sajnos a változás miatt a korábbi verzióval készült űrlapok is átalakítást igényelnek. Ennek érdekében az alkalmazásban be kell olvasni a régi űrlapot, ki kell tölteni néhány megüresedett mezőt, majd újra le kell menteni az űrlapot. A kérelmezői űrlap esetében a nyelvvizsák, az aktuális munkahely betöltésének kezdőéve, az alkotások leírása, és a közéleti szempontok alátámasztó linkjei igényelnek újbóli megadást. Az adatok többsége a korábbi űrlap pdf nézetéről leolvasható. Az előterjesztői űrlap konverziójakor a már átkonvertált kérelmezői űrlapot is újra be kell tölteni. Erre a műveletre sajnos szükség volt, de a jövőben igyekszünk elkerülni az ilyen jellegű változtatásokat."
    }
];
