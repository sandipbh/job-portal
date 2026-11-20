
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const parseFlag = (value) => {
    if (value === true || value === 1) return true;
    if (value === false || value === 0 || value == null) return false;

    return ["true", "1", "yes", "y"].includes(
        String(value).trim().toLowerCase()
    );
};

const useEmployerMenuAccess = () => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const getDetails = async () => {
            try {
                const response = await fetch("/api/cookies-details", {
                    method: "GET",
                    cache: "no-store",
                    signal: controller.signal
                });

                if (!response.ok) {
                    setDetails(null);
                    return;
                }

                const data = await response.json();
                setDetails(data);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Employer menu permission error:", error);
                    setDetails(null);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        getDetails();

        return () => controller.abort();
    }, []);

    const menuAccess = useMemo(() => ({
        Advance1: parseFlag(details?.Advance1),
        Advance2: parseFlag(details?.Advance2),
        Advance3: parseFlag(details?.Advance3)
    }), [details]);

    const filteredMenu = useCallback((menuData) => {
        return menuData.filter((item) => {
            if (!item.advanceKey) return true;
            return menuAccess[item.advanceKey] === true;
        });
    }, [menuAccess]);

    return {
        details,
        menuAccess,
        filteredMenu,
        loading
    };
};

export default useEmployerMenuAccess;
