"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import employerMenuData from "../../data/employerMenuData";
import HeaderNavContent from "./HeaderNavContent";
import { isActiveLink } from "../../utils/linkActiveChecker";
import useEmployerMenuAccess from "../../data/useEmployerMenuAccess";

const DashboardHeader = () => {
    const [navbar, setNavbar] = useState(false);
    const pathname = usePathname();
    const { details, filteredMenu } = useEmployerMenuAccess();

    const visibleMenu = filteredMenu(employerMenuData);

    useEffect(() => {
        const changeBackground = () => setNavbar(window.scrollY >= 0);
        window.addEventListener("scroll", changeBackground);
        changeBackground();
        return () => window.removeEventListener("scroll", changeBackground);
    }, []);

    return (
        <header className={`main-header header-shaddow ${navbar ? "fixed-header" : ""}`}>
            <div className="container-fluid">
                <div className="main-box">
                    <div className="nav-outer">
                        <div className="logo-box">
                            <div className="logo">
                                <Link href="/">
                                    <Image alt="brand" src="/images/logo.svg" width={154} height={50} priority />
                                </Link>
                            </div>
                        </div>
                        <HeaderNavContent />
                    </div>
                    <div className="outer-box">
                        <Link href="/employers-dashboard/notifications" className="menu-btn" aria-label="Notifications">
                            <span className="icon la la-bell"></span>
                        </Link>
                        <div className="dropdown dashboard-option">
                            <a className="dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <Image
                                    alt="avatar"
                                    className="thumb"
                                    src={details?.logo || "/images/resource/company-6.png"}
                                    width={50}
                                    height={50}
                                />
                                <span className="name">{details?.fullname || ""}</span>
                            </a>
                            <ul className="dropdown-menu">
                                {visibleMenu.map(item => {
                                    const active = isActiveLink(item.routePath, pathname);
                                    return (
                                        <li className={`${active ? "active" : ""} mb-1`} key={item.id}>
                                            <Link href={item.routePath}>
                                                <i className={`la ${item.icon}`}></i>{" "}
                                                {item.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;