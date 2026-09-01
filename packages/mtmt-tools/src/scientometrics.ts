import { useFormInfo } from "@repo/form-engine";
import { useCallback, useMemo, useSyncExternalStore } from "react";

type Listener = () => void;
type Status = "uninitialized" | "loading" | "error" | "done";
type ScientometricsData = (number | string)[][];
export class Scientometrics {
    scientometrics: ScientometricsData = [];
    status: Status = "uninitialized";

    private listeners: Set<() => void> = new Set();

    async load(userId: string) {
        this.status = "loading";
        this.notifyListeners();
        const link = "https://support.mtmt.hu/doktori_minimum/256_backend.php?author=" + userId;
        try {
            const response = await fetch(link);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Scientometrics fetched:", data);
            if (data.length >= 29 && data[0].length >= 2) {
                data[0][2] = new Date().toLocaleString("hu-HU");
                this.scientometrics = data;
                this.status = "done";
                this.notifyListeners();
            } else {
                throw new Error("Invalid scientometrics data format");
            }
        } catch (error) {
            console.error("Error fetching scientometrics:", error);
            this.status = "error";
            this.notifyListeners();
        }
    }

    set(scientometrics: ScientometricsData) {
        this.scientometrics = scientometrics;
        this.status = "done";
        this.notifyListeners();
    }

    subscribe: (listener: () => void) => () => boolean = (listener) => {
        this.listeners.add(listener);
        return (): boolean => this.listeners.delete(listener);
    };

    notifyListeners(): void {
        for (const listener of this.listeners) {
            listener();
        }
    }
}

/*export function useMTMTScientometricsStatus(): Status {
    const formInfo = useFormInfo();
    if (!formInfo || "mtmtScientometrics" in formInfo === false) throw new Error("useMTMTScientometricsStatus csak <FormProvider> alatt használható");
    const pubList = formInfo["mtmtScientometrics"] as Scientometrics;
    const subscribe = useCallback((fn: Listener) => pubList.subscribe(fn), [pubList]);
    const getSnapshot = useCallback(() => pubList.status, [pubList]);

    const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return value;
}*/

export function useMTMTScientometrics(): [Status, ScientometricsData, Scientometrics] {
    const formInfo = useFormInfo();
    if (!formInfo || "mtmtScientometrics" in formInfo === false) throw new Error("useMTMTScientometrics csak <FormProvider> alatt használható");
    const scientometrics = formInfo["mtmtScientometrics"] as Scientometrics;

    const subscribe = useCallback((fn: Listener) => scientometrics.subscribe(fn), [scientometrics]);

    const getSnapshot = useMemo(() => {
        let lastStatus: Status | undefined;
        let lastScientometricsData: ScientometricsData | undefined;
        let lastScientometrics: Scientometrics | undefined;
        let lastResult: [Status, ScientometricsData, Scientometrics];

        return (): [Status, ScientometricsData, Scientometrics] => {
            if (scientometrics.status !== lastStatus || scientometrics.scientometrics !== lastScientometricsData || scientometrics !== lastScientometrics) {
                lastStatus = scientometrics.status;
                lastScientometricsData = scientometrics.scientometrics;
                lastScientometrics = scientometrics;
                lastResult = [lastStatus, lastScientometricsData, lastScientometrics];
            }
            return lastResult;
        };
    }, [scientometrics]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
