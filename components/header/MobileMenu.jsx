
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MobileSidebar from "./mobile-sidebar";
import Image from "next/image";
import { useRouter } from "next/navigation";

const MobileMenu = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [loginUqid, setLoginUqid] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [markingRead, setMarkingRead] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getCookiesValue = async () => {
      try {
        const response = await fetch("/api/cookies-details", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          setUserRole("");
          setLoginUqid("");
          setIsLoggedIn(false);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || `Unable to fetch user details. Status: ${response.status}`);
        }

        const role = data?.role ?? "";
        const uqid = data?.uqid ?? "";

        setUserRole(role);
        setLoginUqid(uqid);
        setIsLoggedIn(Boolean(role && uqid));
      } catch (error) {
        console.error("MOBILE MENU COOKIE ERROR:", error);
        setUserRole("");
        setLoginUqid("");
        setIsLoggedIn(false);
      }
    };

    getCookiesValue();
  }, []);

  useEffect(() => {
    if (!loginUqid || userRole.toLowerCase() !== "candidate") {
      setNotificationCount(0);
      return;
    }

    let isMounted = true;

    const getNotificationCount = async () => {
      try {
        const response = await fetch("/api/candi-notification-count", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        const result = await response.json();

        if (isMounted && response.ok && result?.isSuccess) {
          const count = Number(result?.data?.totalCount ?? 0);
          setNotificationCount(Number.isFinite(count) ? count : 0);
        }
      } catch (error) {
        console.error("MOBILE NOTIFICATION COUNT ERROR:", error);
      }
    };

    getNotificationCount();
    const intervalId = window.setInterval(getNotificationCount, 60 * 60 * 1000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [loginUqid, userRole]);

  const handleNotificationClick = async (event) => {
    event.preventDefault();

    if (markingRead) return;

    setMarkingRead(true);

    try {
      const response = await fetch("/api/candi-notification-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        cache: "no-store",
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
    <header className="main-header main-header-mobile">
      <div className="auto-container">
        <div className="inner-box">
          <div className="nav-outer">
            <div className="logo-box">
              <div className="logo">
                <Link href="/">
                  <Image
                    width={154}
                    height={50}
                    src="/images/logo.svg"
                    alt="brand"
                  />
                </Link>
              </div>
            </div>
            <MobileSidebar />
          </div>

          <div className="outer-box">
            <div className="login-box">
              {isLoggedIn ? (
                <Link
                  href={
                    userRole.toLowerCase() === "employer"
                      ? "/employers-dashboard/dashboard"
                      : "/candidates-dashboard/dashboard"
                  }
                  aria-label="Dashboard"
                >
                  <span className="icon la la-home"></span>
                </Link>
              ) : (
                <Link href="/login" className="call-modal" aria-label="Login">
                  <span className="icon icon-user"></span>
                </Link>
              )}

              {isLoggedIn && userRole.toLowerCase() === "candidate" && (
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
              )}
            </div>

            <a
              href="#"
              className="mobile-nav-toggler"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasMenu"
              aria-label="Open menu"
              onClick={(event) => event.preventDefault()}
            >
              <span className="flaticon-menu-1"></span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MobileMenu;
