
'use client'
import { useEffect, useState } from "react";
import Link from "next/link";

import HeaderNavContent from "../header/HeaderNavContent";
import Image from "next/image";

const Header = () => {
  const [navbar, setNavbar] = useState(false);

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



  const changeBackground = () => {
    if (window.scrollY >= 10) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
  }, []);

  return (
    // <!-- Main Header-->
    <header
      className={`main-header header-style-four  ${navbar ? "fixed-header animated slideInDown" : ""
        }`}
    >
      <div className="container-fluid">
        {/* <!-- Main box --> */}
        <div className="main-box">
          {/* <!--Nav Outer --> */}
          <div className="nav-outer">
            <div className="logo-box">
              <div className="logo">
                <Link href="/">
                  <Image
                    width={154}
                    height={50}
                    src="/images/logo-2.svg"
                    alt="brand"
                  />
                </Link>
              </div>
            </div>
            {/* End .logo-box */}

            <HeaderNavContent />
            {/* <!-- Main Menu End--> */}
          </div>
          {/* End .nav-outer */}

          <div className="outer-box">
            <div className="btn-box">
              {isLoggedIn ? (
                <Link
                  href={
                    userRole === "employer"
                      ? "/employers-dashboard/dashboard"
                      : "/candidates-dashboard/dashboard"
                  }
                  className="theme-btn btn-style-six"
                >
                  Dashboard
                </Link>
              ) : (
                <a
                  href="#"
                  className="theme-btn btn-style-six call-modal"
                  data-bs-toggle="modal"
                  data-bs-target="#loginPopupModal"
                >
                  Login / Register
                </a>
              )}

              <Link
                href="/employers-dashboard/post-jobs"
                className="theme-btn btn-style-five"
              >
                Job Post
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
