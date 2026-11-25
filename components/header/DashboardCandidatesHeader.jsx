
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import candidatesMenuData from "../../data/candidatesMenuData";
import HeaderNavContent from "./HeaderNavContent";
import { isActiveLink } from "../../utils/linkActiveChecker";

const DashboardCandidatesHeader = () => {
    const [navbar, setNavbar] = useState(false);
    const [fullName, setFullName] = useState("");
    const [loginType, setLoginType] = useState("");
    const [loginUqid, setLoginUqid] = useState("");
    const [logo, setLogo] = useState("");
    const [notificationCount, setNotificationCount] = useState(0);
    const [markingRead, setMarkingRead] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const changeBackground = () => setNavbar(window.scrollY >= 0);
        window.addEventListener("scroll", changeBackground);
        changeBackground();
        return () => window.removeEventListener("scroll", changeBackground);
    }, []);

    useEffect(() => {
        const getCookiesValue = async () => {
            try {
                const response = await fetch("/api/cookies-details", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    cache: "no-store"
                });

                if (!response.ok) return;

                const data = await response.json();
                setFullName(data?.fullname ?? "");
                setLoginType(data?.role ?? "");
                setLoginUqid(data?.uqid ?? "");
                setLogo(data?.logo ?? "");
            } catch (error) {
                console.error("CANDIDATE HEADER ERROR:", error);
            }
        };

        getCookiesValue();
    }, []);

    useEffect(() => {
        if (!loginUqid || loginType?.toLowerCase() !== "candidate") {
            setNotificationCount(0);
            return;
        }

        let isMounted = true;

        const getNotificationCount = async () => {
            try {
                const response = await fetch("/api/candi-notification-count", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    cache: "no-store"
                });

                const result = await response.json();

                if (isMounted && response.ok && result?.isSuccess) {
                    const count = Number(result?.data?.totalCount ?? 0);
                    setNotificationCount(Number.isFinite(count) ? count : 0);
                }
            } catch (error) {
                console.error("NOTIFICATION COUNT ERROR:", error);
            }
        };

        getNotificationCount();
        const intervalId = window.setInterval(getNotificationCount, 60 * 60 * 1000);

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
        };
    }, [loginUqid, loginType]);

    const handleNotificationClick = async (event) => {
        event.preventDefault();

        if (markingRead) return;
        setMarkingRead(true);

        try {
            const response = await fetch("/api/candi-notification-read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
                cache: "no-store"
            });

            const result = await response.json();

            if (!response.ok || result?.isSuccess === false) {
                throw new Error(result?.message || "Unable to mark notifications as read.");
            }

            setNotificationCount(0);
        } catch (error) {
            console.error("MARK NOTIFICATIONS READ ERROR:", error);
        } finally {
            setMarkingRead(false);
            router.push("/candidates-dashboard/notifications");
        }
    };

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
                        {/* <button className="menu-btn" type="button" aria-label="Wishlist">
                            <span className="count">1</span>
                            <span className="icon la la-heart-o"></span>
                        </button> */}

                        <Link
                            href="/candidates-dashboard/notifications"
                            onClick={handleNotificationClick}
                            className="menu-btn notification-menu-btn d-block"
                            aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
                            aria-busy={markingRead}
                        >
                            {notificationCount > 0 && (
                                <span className="count notification-count">
                                    {notificationCount > 99 ? "99+" : notificationCount}
                                </span>
                            )}
                            <span className="icon la la-bell"></span>
                        </Link>

                        <div className="dropdown dashboard-option">
                            <a
                                className="dropdown-toggle"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <Image
                                    alt="avatar"
                                    className="thumb"
                                    src={logo || "/images/resource/candidate-1.png"}
                                    width={50}
                                    height={50}
                                />
                                <span className="name">{fullName}</span>
                                {/* <span className="role">{loginType}</span> */}
                            </a>

                            <ul className="dropdown-menu">
                                {candidatesMenuData.map((item) => (
                                    <li
                                        className={`${isActiveLink(item.routePath, pathname) ? "active" : ""} mb-1`}
                                        key={item.id}
                                    >
                                        <Link href={item.routePath}>
                                            <i className={`la ${item.icon}`}></i>{" "}
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardCandidatesHeader;
