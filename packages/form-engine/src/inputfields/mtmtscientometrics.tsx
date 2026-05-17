import { Button, Spinner } from "@repo/ui";
import type { FormData } from "@/forms";
import { loadScientometrics, mtmtPubListStatusAtom, mtmtScientometricsAtom, mtmtScientometricsStatusAtom } from "../mtmt";
import { useAtom, useAtomValue } from "jotai";
import { ListRestart } from "lucide-react";
import { useCallback, useEffect } from "react";

export const MTMTScientometrics = ({ fieldKey, formData }: { fieldKey: string; formData: FormData }) => {
    const [value, setValue] = useAtom(formData[fieldKey]);
    const data = useAtomValue(mtmtScientometricsAtom);
    const status = useAtomValue(mtmtScientometricsStatusAtom);
    const pubListStatus = useAtomValue(mtmtPubListStatusAtom);

    useEffect(() => {
        if (status === "done") {
            setValue([JSON.stringify(data)]);
        }
    }, [status, data, setValue]);

    const refreshTable = useCallback((value: string) => {
        try {
            const data = JSON.parse(value);
            const table = document.getElementById("tabla");
            if (!table) return;

            const links: Record<string, string> = {
                plink: "https://m2.mtmt.hu/api/publication?sort=publishedYear,desc&sort=title,asc&cond=mtid;in;",
                alink: "https://m2.mtmt.hu/api/citation?cond=published;eq;true&cond=related.category;eq;1&cond=externalCitation;eq;true&cond=publication.mtid;in;",
                flink: "https://m2.mtmt.hu/api/citation?cond=published;eq;true&cond=related.category;eq;1&cond=related.type;ne;29&cond=externalCitation;eq;true&cond=publication.mtid;in;",
                wlink: "https://m2.mtmt.hu/api/citation?cond=publication.authors;eq;10002462&cond=related.identifiers.source;in;1,61&cond=related.type;ne;29&cond=related.category;eq;1&cond=externalCitation;eq;true&cond=publication.mtid;in;",
                hlink: "https://m2.mtmt.hu/api/publication?sort=independentCitationCount,desc&cond=mtid;in;"
            };
            const linkClass = "text-blue-600 underline hover:text-blue-800";

            const tds = table.querySelectorAll<HTMLTableCellElement>("td");
            tds.forEach((td) => {
                const id = td.id;
                if (!id) return;
                const parts = id.split("_");
                if (parts.length !== 2) return;
                const i = parseInt(parts[0], 10);
                const j = parseInt(parts[1], 10);
                if (Number.isNaN(i) || Number.isNaN(j)) return;
                if (data[i]) {
                    if (td.classList[0] && td.classList[0].includes("link") && links[td.classList[0]]) {
                        const pubCount = data[i][j];
                        if (pubCount !== 0) {
                            td.innerHTML = `<a href="${links[td.classList[0]]}${data[i][j + 1]}" target="_blank" class="${linkClass}">${pubCount}</a>`;
                        } else {
                            td.innerHTML = "-";
                        }
                    } else {
                        td.innerHTML = String(data[i][j]);
                    }
                    td.style.textAlign = "center";
                }
            });
        } catch {
            return;
        }
    }, []);

    useEffect(() => {
        refreshTable(value[0]);
    }, [value, refreshTable]);

    if (status !== "done" && status !== "loading") {
        if (pubListStatus === "done") {
            return (
                <div className="flex mb-1 mt-2">
                    <Button variant="outline" onClick={loadScientometrics} className="ml-auto w-64">
                        <ListRestart /> Táblázat importálása
                    </Button>
                </div>
            );
        }
        return <div className="italic text-muted-foreground">Kérem adja meg MTMT azonosítóját a "Főbb adatok" fülön.</div>;
    }
    if (status === "loading") {
        return (
            <div className="italic text-muted-foreground flex space-x-2 items-center">
                <Spinner /> <span>Kérem várjon, az adatok letöltése folyamatban van...</span>
            </div>
        );
    }

    const thead = "bg font-semibold text-left border-b border-primary";
    const thhead = "bg font-semibold text-center";
    const empty = "h-4";

    return (
        <>
            <div className="font-bold">{data[0][1]}</div>
            <div className="text-xs mb-4">Lekérdezés ideje: {data[0][2]}</div>

            <table id="tabla" className="text-sm border-collapse">
                <thead>
                    <tr className={thead}>
                        <th colSpan={5}>1. A kérelmező publikációs és alkotási teljesítménye (Q-szám)</th>
                    </tr>
                    <tr className={thhead}>
                        <th rowSpan={2} className="px-2">
                            Tudományos közlemények
                        </th>
                        <th rowSpan={2} className="px-2">
                            Külföldön megjelent
                        </th>
                        <th colSpan={2} className="px-2">
                            Magyarországon
                        </th>
                        <th rowSpan={3} className="px-2">
                            Pontszám
                        </th>
                    </tr>
                    <tr className={thhead}>
                        <th className="px-2">idegen&nbsp;nyelven</th>
                        <th className="px-2">magyarul</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td id="h1">Lektorált tudományos folyóiratcikk</td>
                        <td id="1_0" className="plink"></td>
                        <td id="1_2" className="plink"></td>
                        <td id="1_4" className="plink"></td>
                        <td id="1_6"></td>
                    </tr>
                    <tr>
                        <td id="h2" className="alfejezet">
                            - ebből IF-ral
                        </td>
                        <td id="2_0" className="plink"></td>
                        <td id="2_2" className="plink"></td>
                        <td id="2_4" className="plink"></td>
                        <td className="szurke"></td>
                    </tr>
                    <tr>
                        <td id="h3" className="alfejezet">
                            - ebből egyszerzős
                        </td>
                        <td id="3_0" className="plink"></td>
                        <td id="3_2" className="plink"></td>
                        <td id="3_4" className="plink"></td>
                        <td className="szurke"></td>
                    </tr>
                    <tr>
                        <td id="h4">Konferenciacikk (min. 4 oldal) konferenciakötetben, folyóiratban, könyvrészletben</td>
                        <td id="4_0" className="plink"></td>
                        <td id="4_2" className="plink"></td>
                        <td id="4_4" className="plink"></td>
                        <td id="4_6"></td>
                    </tr>
                    <tr>
                        <td id="h5" className="fejezet szurke">
                            Folyóirat cikkek összesen
                        </td>
                        <td colSpan={3} className="szurke"></td>
                        <td id="5_6"></td>
                    </tr>
                    <tr>
                        <td id="h6">Tudományos könyv</td>
                        <td id="6_0" className="plink"></td>
                        <td id="6_2" className="plink"></td>
                        <td id="6_4" className="plink"></td>
                        <td id="6_6"></td>
                    </tr>
                    <tr>
                        <td id="h7">Tudományos könyvrészlet</td>
                        <td id="7_0" className="plink"></td>
                        <td id="7_2" className="plink"></td>
                        <td id="7_4" className="plink"></td>
                        <td id="7_6"></td>
                    </tr>
                    <tr>
                        <td id="h8" className="fejezet szurke">
                            Könyvek összesen
                        </td>
                        <td colSpan={3} className="szurke"></td>
                        <td id="8_6"></td>
                    </tr>
                    <tr>
                        <td className={empty} colSpan={5}></td>
                    </tr>
                    <tr className={thead}>
                        <th colSpan={5}>2. A kérelmező idézettsége (I-szám)</th>
                    </tr>
                    <tr>
                        <td id="h9" colSpan={4}>
                            Független idézők száma (összes, egyéb típusúakkal együtt)
                        </td>
                        <td id="9_0" className="alink"></td>
                    </tr>
                    <tr>
                        <td id="h10" colSpan={4}>
                            Független idézők száma egyéb típusúak nélkül (I-szám)
                        </td>
                        <td id="10_0" className="flink"></td>
                    </tr>
                    <tr>
                        <td id="h11" colSpan={4}>
                            Független WoS idézők száma
                        </td>
                        <td id="11_0" className="wlink"></td>
                    </tr>
                    <tr>
                        <td id="h12" colSpan={4}>
                            H-index (független idézetekből)
                        </td>
                        <td id="12_0" className="hlink"></td>
                    </tr>
                    <tr>
                        <td className={empty} colSpan={5}></td>
                    </tr>
                    <tr className={thead}>
                        <th colSpan={5}>3. A tételes publikációs elvárások</th>
                    </tr>
                    <tr>
                        <td id="h13" colSpan={4}>
                            Magyar nyelvű publikáció
                        </td>
                        <td id="13_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h14" colSpan={4}>
                            Az egyszerzős IF-os cikkeinek száma
                        </td>
                        <td id="14_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h15" colSpan={4}>
                            Az IF-os cikkeinek száma
                        </td>
                        <td id="15_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h16" colSpan={4}>
                            A viszonyított IF-számok összege
                        </td>
                        <td id="16_0"></td>
                    </tr>
                    <tr>
                        <td className={empty} colSpan={5}></td>
                    </tr>
                    <tr className={thead}>
                        <th colSpan={5}>4. Rövid értekezéssel pályázók adatai</th>
                    </tr>
                    <tr>
                        <td id="h17" colSpan={4}>
                            D1 besorolású cikkeinek összegzett szerzői aránya
                        </td>
                        <td id="17_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td className={empty} colSpan={5}></td>
                    </tr>
                    <tr className={thead}>
                        <th colSpan={5}>5. "C" kategóriájú pályázókhoz</th>
                    </tr>
                    <tr>
                        <td id="h18" colSpan={4}>
                            Tudományos folyóiratcikk külföldi kiadású szakfolyóiratban, idegen nyelvű
                        </td>
                        <td id="18_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h19" colSpan={4}>
                            Tudományos folyóiratcikk külföldi kiadású szakfolyóiratban, magyar nyelvű
                        </td>
                        <td id="19_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h20" colSpan={4}>
                            Könyv szerzőként, idegen nyelvű
                        </td>
                        <td id="20_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h21" colSpan={4}>
                            Könyv szerzőként, magyar nyelvű
                        </td>
                        <td id="21_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h22" colSpan={4}>
                            Könyv szerkesztőként, idegen nyelvű
                        </td>
                        <td id="22_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h23" colSpan={4}>
                            Könyv szerkesztőként, magyar nyelvű
                        </td>
                        <td id="23_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h24" colSpan={4}>
                            Könyvrészlet, idegen nyelvű
                        </td>
                        <td id="24_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h25" colSpan={4}>
                            Könyvrészlet, magyar nyelvű
                        </td>
                        <td id="25_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h26" colSpan={4}>
                            Konferenciaközlemény folyóiratban vagy konferenciakötetben, idegen nyelvű
                        </td>
                        <td id="26_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h27" colSpan={4}>
                            Konferenciaközlemény folyóiratban vagy konferenciakötetben, magyar nyelvű
                        </td>
                        <td id="27_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td className={empty} colSpan={5}></td>
                    </tr>
                    <tr className={thead}>
                        <th colSpan={5}>6. Egyéb minőségi adatok</th>
                    </tr>
                    <tr>
                        <td id="h28" colSpan={4}>
                            Q1 besorolású cikkeinek összegzett szerzői aránya
                        </td>
                        <td id="28_0" className="plink"></td>
                    </tr>
                    <tr>
                        <td id="h29" colSpan={4}>
                            Q2 besorolású cikkeinek összegzett szerzői aránya
                        </td>
                        <td id="29_0" className="plink"></td>
                    </tr>
                </tbody>
            </table>

            <div className="flex mb-1 mt-2">
                <Button variant="outline" onClick={loadScientometrics} className="ml-auto w-64">
                    <ListRestart /> Táblázat frissítése
                </Button>
            </div>
        </>
    );
};
