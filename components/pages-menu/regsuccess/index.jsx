import Breadcrumb from "../../common/Breadcrumb";
import LoginPopup from "../../common/form/login/LoginPopup";
import FooterDefault from "../../footer/common-footer";
import DefaulHeader from "../../header/DefaulHeader";
import MobileMenu from "../../header/MobileMenu";
import FormContent2 from "../../common/form/register/Register2";
import globalData from "@/lib/global";
import Header from "./Header";
import Link from "next/link";
const index = () => {
  return (
    <>
      <Header />
      {/* <!--End Main Header -->  */}

      <MobileMenu />
      {/* End MobileMenu */}


      <div className="login-section">
        <div
          className="image-layer"
          style={{ backgroundImage: "url(/images/background/12.jpg)" }}
        ></div>
        <div className="outer-box">
          {/* <!-- Login Form --> */}
          <div className="login-form default-form">

            <div className="form-inner">

              <div
                className="d-flex align-items-center justify-content-center bg-light"
                style={{ minHeight: "100vh" }}
              >
                <div
                  className="card border-0 shadow-sm text-center p-4"
                  style={{
                    maxWidth: "450px",
                    width: "100%",
                    borderRadius: "18px",
                  }}
                >
                  {/* Success Icon */}
                  <div className="mb-4">
                    <div
                      className="mx-auto d-flex align-items-center justify-content-center"
                      style={{
                        width: "95px",
                        height: "95px",
                        borderRadius: "50%",
                        backgroundColor: "#19c37d",
                        boxShadow: "0 0 0 8px rgba(25,195,125,0.15)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "42px",
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      >
                        ✓
                      </span>
                    </div>
                  </div>

                  {/* Heading */}
                  <h1
                    className="fw-bold mb-3"
                    style={{
                      fontSize: "2.2rem",
                      color: "#111827",
                    }}
                  >
                    Congratulations
                  </h1>

                  {/* Message */}
                  <p
                    className="text-secondary mb-4"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.7",
                    }}
                  >
                    Your {globalData.DisplayName}  account  has been successfully created.
                    <br />
                    Welcome aboard! Start exploring all features now.
                  </p>

                  {/* Button */}
                  <Link
                    className="btn btn-primary fw-semibold py-3"
                    style={{
                      borderRadius: "12px",
                      fontSize: "1rem",
                    }}
                    href="/login"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default index;
