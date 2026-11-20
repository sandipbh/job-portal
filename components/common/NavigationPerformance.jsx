
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "ratin_navigation_start";

export default function NavigationPerformance() {
    const pathname = usePathname();

    useEffect(() => {
        const handleClick = (event) => {
            const link = event.target.closest("a[href]");
            if (!link || link.target === "_blank" || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

            const url = new URL(link.href, window.location.origin);
            if (url.origin !== window.location.origin || url.pathname === pathname) return;

            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                from: pathname,
                to: url.pathname,
                start: performance.now(),
                time: Date.now()
            }));
        };

        document.addEventListener("click", handleClick, true);
        return () => document.removeEventListener("click", handleClick, true);
    }, [pathname]);

    useEffect(() => {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const navigation = JSON.parse(raw);
        if (navigation.to !== pathname) return;

        const duration = Date.now() - navigation.time;

        console.log("========== PAGE NAVIGATION PERFORMANCE ==========");
        console.log("From:", navigation.from);
        console.log("To:", pathname);
        console.log("Navigation + page mount:", `${duration} ms`);

        sessionStorage.removeItem(STORAGE_KEY);
    }, [pathname]);

    return null;
}
