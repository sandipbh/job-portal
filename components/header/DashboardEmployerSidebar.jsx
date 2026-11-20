
"use client";

import { memo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import employerMenuData from "../../data/employerMenuData";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { menuToggle } from "../../features/toggle/toggleSlice";
import useEmployerMenuAccess from "../../data/useEmployerMenuAccess";

const DashboardEmployerSidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const menu = useSelector((state) => state.toggle.menu);

    const { filteredMenu, loading } = useEmployerMenuAccess();

    const menuToggleHandler = useCallback(() => {
        dispatch(menuToggle());
    }, [dispatch]);

    const handlePrefetch = useCallback((routePath) => {
        if (routePath !== "/" && routePath !== "/logout") {
            router.prefetch(routePath);
        }
    }, [router]);

    // Do not render the menu until permissions are loaded.
    const visibleMenu = loading ? [] : filteredMenu(employerMenuData);

    return (
        <div className={`user-sidebar ${menu ? "sidebar_open" : ""}`}>
            <div className="pro-header text-end pb-0 mb-0 show-1023">
                <div
                    className="fix-icon"
                    onClick={menuToggleHandler}
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            menuToggleHandler();
                        }
                    }}
                >
                    <span className="flaticon-close"></span>
                </div>
            </div>

            <div className="sidebar-inner">
                <ul className="navigation">
                    {visibleMenu.map((item) => {
                        const active = isActiveLink(item.routePath, pathname);

                        return (
                            <li
                                className={`${active ? "active" : ""} mb-1`}
                                key={item.id}
                            >
                                <Link
                                    href={item.routePath}
                                    onMouseEnter={() => handlePrefetch(item.routePath)}
                                    onFocus={() => handlePrefetch(item.routePath)}
                                    onClick={menuToggleHandler}
                                    aria-current={active ? "page" : undefined}
                                >
                                    <i className={`la ${item.icon}`}></i>{" "}
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default memo(DashboardEmployerSidebar);
