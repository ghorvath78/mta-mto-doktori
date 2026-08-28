import { useCallback, useSyncExternalStore } from "react";
import Cookies from "js-cookie";

type Listener = () => void;
export class InfoState {
    private static instance: InfoState;
    state = {
        infoField: "",
        infoGroup: "",
        infoSection: "",
        panelOpen: true
    };
    private listeners: Set<Listener> = new Set();

    private constructor() {
        // load panelOpen state from cookie
        const savedCookie = Cookies.get("infoPanelOpen");
        if (savedCookie !== undefined) {
            try {
                this.state.panelOpen = JSON.parse(savedCookie);
            } catch (e) {
                this.state.panelOpen = savedCookie === "true";
            }
        }
    }

    public static getInstance(): InfoState {
        if (!InfoState.instance) {
            InfoState.instance = new InfoState();
        }
        return InfoState.instance;
    }

    setInfoText({ field, group, section }: { field?: string; group?: string; section?: string }) {
        const newState = {
            infoField: field ?? this.state.infoField,
            infoGroup: group ?? this.state.infoGroup,
            infoSection: section ?? this.state.infoSection,
            panelOpen: this.state.panelOpen
        };
        this.state = newState;
        this.notifyListeners();
    }

    setPanelOpen(open: boolean) {
        const newState = {
            ...this.state,
            panelOpen: open
        };
        this.state = newState;
        Cookies.set("infoPanelOpen", JSON.stringify(open), { expires: 365 });
        this.notifyListeners();
    }

    subscribe = (fn: Listener): (() => void) => {
        this.listeners.add(fn);
        return () => {
            this.listeners.delete(fn);
        };
    };

    notifyListeners() {
        this.listeners.forEach((fn) => fn());
    }
}

export function useInfoState(): {
    infoField: string;
    infoGroup: string;
    infoSection: string;
    panelOpen: boolean;
} {
    const infoState = InfoState.getInstance();
    const subscribe = useCallback((fn: Listener) => infoState.subscribe(fn), [infoState]);
    const value = useSyncExternalStore(
        subscribe,
        () => infoState.state,
        () => infoState.state
    );
    return value;
}

export function useSetInfoState(): (newState: { field?: string; group?: string; section?: string }) => void {
    const infoState = InfoState.getInstance();
    return useCallback(
        (newState: { field?: string; group?: string; section?: string }) => {
            infoState.setInfoText(newState);
        },
        [infoState]
    );
}

export function useSetPanelOpen(): (open: boolean) => void {
    const infoState = InfoState.getInstance();
    return useCallback(
        (open: boolean) => {
            infoState.setPanelOpen(open);
        },
        [infoState]
    );
}
