import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export function useCollapsibleState(key: string, defaultValue = true, cookieOptions = { expires: 365 }): [boolean, (value: boolean) => void] {
    // 1. Kezdőérték kiolvasása a cookie-ból vagy fallback a defaultValue-ra
    const [value, setValue] = useState(() => {
        const savedCookie = Cookies.get(key);
        if (savedCookie !== undefined) {
            try {
                return JSON.parse(savedCookie);
            } catch (e) {
                return savedCookie === "true";
            }
        }
        return defaultValue;
    });

    // 2. Változáskor a cookie frissítése
    useEffect(() => {
        if (value === undefined || value === null) {
            Cookies.remove(key);
        } else {
            Cookies.set(key, JSON.stringify(value), cookieOptions);
        }
    }, [key, value, cookieOptions]);

    return [value, setValue];
}
