import { atomsToJSON, getPdfDocumentStyles, getPdfSection, savePdfWithFormData, store, type FormData, type FormDescriptor } from "@repo/form-engine";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

declare const BUILD_DATE: string;

export const savePDF = async (descriptor: FormDescriptor, formData: FormData) => {
    const name = store.get(formData["Kérelmezői|A kérelmező főbb adatai|Személyes adatok|Személyes adatok|Név"])?.[0] || "Név";
    const bizottsag =
        store.get(
            formData["Kérelmezői|A doktori mű adatai|Az eljárás alapjául szolgáló doktori mű|Az eljárás alapjául szolgáló doktori mű|Illetékes bizottság"]
        )?.[0] || "Bizottság";
    const eloterjesztoNeve = store.get(formData["Előterjesztői|Előterjesztő adatai|Előterjesztő adatai|Adatok|Előterjesztő neve"])?.[0] || "";
    const eloterjesztoFokozata = store.get(formData["Előterjesztői|Előterjesztő adatai|Előterjesztő adatai|Adatok|Tudományos fokozat"])?.[0] || "";

    const docDefinition: TDocumentDefinitions = {
        ...getPdfDocumentStyles(),
        content: [
            { text: "MTA Műszaki Tudományok Osztálya", italics: true },
            { text: "ELŐTERJESZTŐI ÉRTÉKELÉS", style: "header" },
            { text: name, style: "header_center_data" },
            { text: "doktori habitusáról", style: "header_center_title" },
            { text: "az MTA Műszaki Tudományok Osztálya", style: "header_center_title" },
            { text: bizottsag, style: "header_center_data" },
            { text: "számára. Készítette:", style: "header_center_title" },
            { text: `${eloterjesztoNeve}, ${eloterjesztoFokozata}`, style: "header_center_data" },
            { text: "A. A szakterületi illetékesség megállapítása", style: "section" },
            await getPdfSection(descriptor, formData, "Előterjesztői|Pályázó adatai|A pályázó személyes adatai", "A pályázó személyes adatai:"),
            await getPdfSection(descriptor, formData, "Előterjesztői|Pályázó adatai|Aktuális munkahelyek", "Aktuális munkahelyek:"),
            await getPdfSection(descriptor, formData, "Előterjesztői|Pályázó adatai|A doktori mű", "A doktori mű:"),
            await getPdfSection(
                descriptor,
                formData,
                "Előterjesztői|Pályázó adatai|A kérelmező által megnevezett szakterület és tudományos bizottság",
                "A kérelmező által megnevezett szakterület és tudományos bizottság:"
            ),
            await getPdfSection(descriptor, formData, "Előterjesztői|Pályázó adatai|Illetékesség", "Illetékesség megállapítása:"),
            { text: "B. A benyújtott doktori mű formai alkalmassága", style: "section" },
            await getPdfSection(descriptor, formData, "Előterjesztői|Pályázó adatai|Alkalmasság", ""),
            { text: "C. A tudományos minimumkövetelmények teljesítésének ellenőrzése", style: "section" },
            { text: "4.1. TDK témavezetés", style: "subsection" },
            await getPdfSection(descriptor, formData, "Előterjesztői|Tudományos közéleti tevékenység|TDK témavezetés", "", {
                useGroupLabelAsHeader: "true"
            }),
            { text: "4.2. Részvétel graduális és doktori képzésben (tárgyelőadó, tárgyfelelős)", style: "subsection" },
            await getPdfSection(descriptor, formData, "Előterjesztői|Tudományos közéleti tevékenység|Részvétel graduális és doktori képzésben", ""),
            { text: "4.3. Részvétel doktori témavezetésben (fokozatot szerzett hallgatók)", style: "subsection" },
            await getPdfSection(descriptor, formData, "Előterjesztői|Tudományos közéleti tevékenység|Doktori fokozatot szerzett hallgatók", ""),
            { text: "4.4. Részvétel tudományos zsűriben, kuratóriumban, bírálatokban", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Előterjesztői|Tudományos közéleti tevékenység|Részvétel tudományos zsűriben, kuratóriumban, bírálatokban",
                ""
            ),
            { text: "4.5. Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében, plenáris előadások", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Előterjesztői|Tudományos közéleti tevékenység|Részvétel nemzetközi kongresszus/nemzetközi konferencia szervezésében",
                ""
            ),
            { text: "4.6. Tisztség, kiemelt/választott tagság hazai és/vagy nemzetközi tudományos szervezetben", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Előterjesztői|Tudományos közéleti tevékenység|Tisztség, kiemelt/választott tagság tudományos szervezetben",
                ""
            ),
            { text: "4.7. Folyóirat-szerkesztőbizottsági tagság legalább 2 évig", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Előterjesztői|Tudományos közéleti tevékenység|Folyóirat-szerkesztőbizottsági tagság legalább 2 évig",
                ""
            ),
            { text: "4.8. Részvétel tudományos minősítésben (bíráló, bírálóbizottsági titkár)", style: "subsection" },
            await getPdfSection(descriptor, formData, "Előterjesztői|Tudományos közéleti tevékenység|Részvétel tudományos minősítésben", "", {
                firstColWidth: "200",
                hideEmptyGroup: "true"
            }),
            { text: "4.9. Elnyert tudományos pályázat (témavezető, résztvevő)", style: "subsection" },
            await getPdfSection(descriptor, formData, "Előterjesztői|Tudományos közéleti tevékenység|Elnyert tudományos pályázat", ""),
            { text: "4.10. Külföldi tartózkodás", style: "subsection" },
            await getPdfSection(descriptor, formData, "Előterjesztői|Tudományos közéleti tevékenység|Külföldi tartózkodás", ""),
            { text: "4.11. Állami vagy MTA által adományozott tudományos díj, kitüntetés", style: "subsection" },
            await getPdfSection(
                descriptor,
                formData,
                "Előterjesztői|Tudományos közéleti tevékenység|Állami vagy MTA által adományozott tudományos díj, kitüntetés",
                ""
            ),
            { text: "5. A tudományos minimumkövetelmények teljesítésének összesítése", style: "subsection" },
            await getPdfSection(descriptor, formData, "Előterjesztői|A tudományos minimumkövetelmények teljesítésének összesítése|Összesítés", ""),
            { text: "D. Összefoglaló javaslat: A kérelmező doktori habitusának megítélése", style: "section" },
            await getPdfSection(descriptor, formData, "Előterjesztői|Összefoglaló javaslat|Összefoglaló javaslat", ""),
            { text: "E. Javaslat a bírálókra és a bíráló bizottság tagjaira", style: "section" }
        ]
    };

    savePdfWithFormData(docDefinition, "eloterjesztoi_adatlap.pdf", { "eloterjeszto_form.json": JSON.stringify(atomsToJSON(formData), null, 4) });
};
