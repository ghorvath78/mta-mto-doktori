import { useAtomValue } from "jotai";
import type { GroupDescriptor, FormData } from "@repo/form-engine";
import { cD } from "@repo/form-engine";

export const SciScoringTable = ({ formData }: { group: GroupDescriptor; formData: FormData; keyPrefix: string; index: number }) => {
    const rawData = useAtomValue(formData["Kérelmezői|Tudománymetria|Tudománymetriai táblázat|Tudománymetriai táblázat|Tudománymetriai táblázat"] || []);
    const data = JSON.parse(rawData[0] || "[]");

    const empty = "h-4";
    return (
        <>
            <table className="form-table">
                <tbody>
                    <tr className="form-table-head">
                        <td>Tudományos folyóiratcikk</td>
                        <td className="text-center">darab</td>
                        <td className="text-center">pontszám</td>
                    </tr>
                    <tr>
                        <td className="form-table-fcol">Lektorált folyóiratcikk</td>
                        <td>{cD(data[1][0]) + cD(data[1][2]) + cD(data[1][4])}</td>
                        <td>{cD(data[1][6])}</td>
                    </tr>
                    <tr>
                        <td className="form-table-fcol">Lektorál folyóirat cikk IF-ral</td>
                        <td>{cD(data[2][0]) + cD(data[2][2]) + cD(data[2][4])}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td className="form-table-fcol">Lektorál folyóirat egyszerzős IF-os cikk</td>
                        <td>{cD(data[3][0]) + cD(data[3][2]) + cD(data[3][4])}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td className="form-table-fcol">Konferenciacikk konferenciakötetben, folyóiratban, könyvrészletben</td>
                        <td>{cD(data[4][0]) + cD(data[4][2]) + cD(data[4][4])}</td>
                        <td>{cD(data[4][6])}</td>
                    </tr>
                    <tr>
                        <td className="form-table-fcol font-semibold" colSpan={2}>
                            Tudományos folyóirat és konferenciacikk Q érték
                        </td>
                        <td className={`font-semibold`}>{cD(data[1][6]) + cD(data[4][6])}</td>
                    </tr>
                    <tr>
                        <td className={empty} colSpan={5}></td>
                    </tr>
                    <tr className="form-table-head">
                        <td>Tudományos könyv, könyvrészlet szerzőként</td>
                        <td className="text-center">darab</td>
                        <td className="text-center">pontszám</td>
                    </tr>
                    <tr>
                        <td className="form-table-fcol">Könyv</td>
                        <td>{cD(data[6][0]) + cD(data[6][2]) + cD(data[6][4])}</td>
                        <td>{cD(data[6][6])}</td>
                    </tr>
                    <tr>
                        <td className="form-table-fcol">Könyvrészlet</td>
                        <td>{cD(data[7][0]) + cD(data[7][2]) + cD(data[7][4])}</td>
                        <td>{cD(data[7][6])}</td>
                    </tr>
                    <tr>
                        <td className="form-table-fcol font-semibold" colSpan={2}>
                            Tudományos könyv és könyvrészlet Q érték
                        </td>
                        <td className={`font-semibold`}>{cD(data[6][6]) + cD(data[7][6])}</td>
                    </tr>
                </tbody>
            </table>
        </>
    );
};
