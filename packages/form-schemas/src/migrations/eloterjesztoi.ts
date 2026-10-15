import type { Tree } from "../envelope.ts";
import { moveSectionToPage } from "../helpers.ts";

// v1 -> v2 (2026-10): a "Pályázó adatai" lapról az illetékesség és a formai alkalmasság megállapítása
// saját lapra ("Illetékesség", "Alkalmasság") került, a szakaszok kulcsa és tartalma változatlan.
export function eloterjesztoiV1toV2(ns: Tree): Tree {
    moveSectionToPage(ns, "Pályázó adatai", "Illetékesség", "Illetékesség");
    moveSectionToPage(ns, "Pályázó adatai", "Alkalmasság", "Alkalmasság");
    return ns;
}
