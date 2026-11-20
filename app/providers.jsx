
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { store } from "../store/store";
import ScrollToTop from "../components/common/ScrollTop";
import NavigationPerformance from "@/components/common/NavigationPerformance";

function AppEffects() {
    const pathname = usePathname();

    useEffect(() => {
        let bootstrapInstance;

        const initialize = async () => {
            await import("bootstrap/dist/js/bootstrap");
            bootstrapInstance = true;
        };

        initialize();

        return () => {
            bootstrapInstance = null;
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const initializeAos = async () => {
            const Aos = (await import("aos")).default;
            if (!mounted) return;

            Aos.init({
                duration: 1400,
                once: true
            });

            Aos.refresh();
        };

        initializeAos();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const refreshAos = async () => {
            const Aos = (await import("aos")).default;
            Aos.refresh();
        };

        refreshAos();
    }, [pathname]);

    return null;
}

export default function Providers({ children }) {
    return (
        <Provider store={store}>
            <AppEffects />
            <NavigationPerformance />
            <div className="page-wrapper">
                {children}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    draggable
                    theme="light"
                    rtl={false}
                    pauseOnFocusLoss
                    style={{ zIndex: 999999 }}
                />
                <ScrollToTop />
            </div>
        </Provider>
    );
}
