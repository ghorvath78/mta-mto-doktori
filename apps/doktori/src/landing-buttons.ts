import type { LucideIcon } from "lucide-react";
import { FileText, FileCheck, ClipboardList } from "lucide-react";

export interface LandingButton {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    tooltip: string;
    enabled: boolean;
    url: string;
}

export const landingButtons: LandingButton[] = [
    {
        icon: FileText,
        title: "Kérelmezői adatlap",
        subtitle: "A pályázó tölti ki",
        tooltip: "A kérelmezői adatlap kitöltése",
        enabled: true,
        url: "../kerelmezoi/"
    },
    {
        icon: ClipboardList,
        title: "Előterjesztői adatlap",
        subtitle: "Az előterjesztő tölti ki",
        tooltip: "Az előterjesztői adatlap kitöltése",
        enabled: true,
        url: "../eloterjesztoi/"
    },
    {
        icon: FileCheck,
        title: "Bizottsági adatlap",
        subtitle: "A tudományos bizottság elnöke vagy titkára tölti ki",
        tooltip: "A bizottsági adatlap kitöltése (hamarosan)",
        enabled: false,
        url: "#"
    }
];
