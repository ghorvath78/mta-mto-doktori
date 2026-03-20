import { atom, createStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { FormInfo } from "./forms";

export const store = createStore();

export const formInfoAtom = atom({ name: "", title: "" } as FormInfo);

export const infoPanelOpenAtom = atomWithStorage("mta-mto-doktori-infoPanelOpen", true, undefined, { getOnInit: true });
export const infoFieldAtom = atom("");
export const infoGroupAtom = atom("");
export const infoSectionAtom = atom("");
