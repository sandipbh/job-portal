
'use client'
import { useEffect, useState } from "react";
import Link from "next/link";
import MobileSidebar from "./mobile-sidebar";
import Image from "next/image";

const MobileMenu = () => {



  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");


  useEffect(() => {
    getCookiesValue();
  }, []);

  const getCookiesValue = async () => {
    try {
      const response = await fetch("/api/cookies-details", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      const data = await response.json();
      const role = data?.role ?? "";

      if (role != "") {
        setUserRole(role);
        setIsLoggedIn(true);
      }
      else {
        setUserRole("");
        setIsLoggedIn(false);
      }

    } catch (error) {
      console.error(error);
      setUserRole("");
      setIsLoggedIn(false);
    }
  };


  return (
    // <!-- Main Header-->
    <header className="main-header main-header-mobile">
      <div className="auto-container">
        {/* <!-- Main box --> */}
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
            {/* End .logo-box */}

            <MobileSidebar />
            {/* <!-- Main Menu End--> */}
          </div>
          {/* End .nav-outer */}

          <div className="outer-box">
            <div className="login-box">
              {isLoggedIn ? (
                <Link
                  href={
                    userRole === "employer"
                      ? "/employers-dashboard/dashboard"
                      : "/candidates-dashboard/dashboard"
                  }
                >
                  <span className="icon la la-home"></span>
                </Link>
              ) : (
                <a
                  href="#"
                  className="call-modal"
                  data-bs-toggle="modal"
                  data-bs-target="#loginPopupModal"
                >
                  <span className="icon icon-user"></span>
                </a>
              )}
            </div>
            {/* login popup end */}

            <a
              href="#"
              className="mobile-nav-toggler"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasMenu"
            >
              <span className="flaticon-menu-1"></span>
            </a>
            {/* right humberger menu */}
          </div>
        </div>
      </div >
    </header >
  );
};

export default MobileMenu;
