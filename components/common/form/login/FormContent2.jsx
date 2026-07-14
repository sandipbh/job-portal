"use client";
import Link from "next/link";
import LoginWithSocial from "./LoginWithSocial";
import globalData from "@/lib/global";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OtpReg from "./OtpReg";


const FormContent2 = () => {

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("candidate");

  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);


  const openOtpModal = () => {
    if (typeof window === "undefined") return;

    // Ensure OTP component is mounted, then open the modal.
    setShowOtp(true);

    setTimeout(() => {
      const registerModalEl = document.getElementById("loginPopupModal");
      const otpModalEl = document.getElementById("otpModal");
      const otpTrigger = document.querySelector(
        '[data-bs-toggle="modal"][data-bs-target="#otpModal"]'
      );

      const showOtpModal = () => {
        if (window.bootstrap && otpModalEl) {
          const otpModal =
            window.bootstrap.Modal.getInstance(otpModalEl) ||
            new window.bootstrap.Modal(otpModalEl);
          otpModal.show();
          return;
        }

        if (otpTrigger) {
          otpTrigger.click();
          return;
        }

        if (otpModalEl) {
          otpModalEl.classList.add("show");
          otpModalEl.style.display = "block";
          otpModalEl.setAttribute("aria-modal", "true");
          otpModalEl.removeAttribute("aria-hidden");
        }
      };

      if (window.bootstrap && registerModalEl) {
        const registerModal =
          window.bootstrap.Modal.getInstance(registerModalEl) ||
          new window.bootstrap.Modal(registerModalEl);

        const onHidden = () => {
          registerModalEl.removeEventListener("hidden.bs.modal", onHidden);
          showOtpModal();
        };

        registerModalEl.addEventListener("hidden.bs.modal", onHidden);
        registerModal.hide();
        return;
      }

      const registerClose = registerModalEl?.querySelector(
        '[data-bs-dismiss="modal"]'
      );
      if (registerClose) {
        registerClose.click();
        setTimeout(showOtpModal, 300);
        return;
      }

      if (registerModalEl) {
        registerModalEl.classList.remove("show");
        registerModalEl.style.display = "none";
        registerModalEl.setAttribute("aria-hidden", "true");
      }
      showOtpModal();
    }, 50);
  };

  // Unmount OTP component when modal is hidden
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!showOtp) return;

    const modalEl = document.getElementById("otpModal");
    if (!modalEl) return;

    const onHidden = () => {
      setShowOtp(false);
    };

    modalEl.addEventListener("hidden.bs.modal", onHidden);

    // fallback: close button
    const closeBtn = modalEl.querySelector(".closed-modal");
    const onClickClose = () => setShowOtp(false);
    closeBtn?.addEventListener("click", onClickClose);

    return () => {
      modalEl.removeEventListener("hidden.bs.modal", onHidden);
      closeBtn?.removeEventListener("click", onClickClose);
    };
  }, [showOtp]);
  const handleLogin = async (e) => {

    e.preventDefault();


    setError("");

    if (!email) {
      setError("Please enter email address");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter valid email address");
      return false;
    }
    if (!password) {
      setError("Please enter password");
      return false;

    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),

      });

      const data = await res.json();

      console.log(data)

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }


      if (!data.status) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      //check is verified or not
      console.log(data.isVefity)

      if (data.isVefity == false) {
        openOtpModal();
        return;
      }

      if (data.isActive == false) {
        setError("Contact to support team");
        setLoading(false);
        return;
      }

      const roleType = data.roleType?.trim().toLowerCase();
      // console.log("roleType :", data.roleType);

      // console.log("Login success roleType:", roleType);

      if (roleType === "employer") {
        window.location.href = "/employers-dashboard/dashboard";
        return;
      } else if (roleType === "candidate") {
        window.location.href = "/candidates-dashboard/dashboard";
        return;
      } else {
        window.location.href = "/home-10";
      }

    } catch (err) {
      setError("Something went wrong");
    }

    setLoading(false);
  };


  const handleLogout = async () => {
    const res = await fetch("/api/logout", {
      method: "POST",
      credentials: "include", // IMPORTANT
    });

    if (res.ok) {
      window.location.href = "/login";
    }
  };

  const logoutAllDevices = async () => {
    await fetch("/api/logout-all", {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/login";
  };

  return (
    <div className="form-inner">
      <h3>Login to {globalData.DisplayName}</h3>

      {/* <!--Login Form--> */}
      <form method="post"  >
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="form-group register-dual">
          <div className="btn-box row">
            <div className="col-lg-6">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={`theme-btn btn-style-four ${role === "candidate" ? "active-btn" : ""}`}
              >
                Candidate
              </button>
            </div>

            <div className="col-lg-6">
              <button
                type="button"
                onClick={() => setRole("employer")}
                className={`theme-btn btn-style-four ${role === "employer" ? "active-btn" : ""}`}
              >
                Employer
              </button>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={30}
            className="w-full border rounded-lg   focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>
        {/* name */}

        <div className="form-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={12}
              style={{ paddingRight: "40px" }}
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >

              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

        </div>
        {/* password */}

        <div className="form-group">
          <div className="field-outer">
            <div className="input-group checkboxes square">
              <input type="checkbox" name="remember-me" id="remember" />
              <label htmlFor="remember" className="remember">
                <span className="custom-checkbox"></span> Remember me
              </label>
            </div>
            <a href="/getPassword" className="pwd">
              Forgot password?..
            </a>
          </div>
        </div>
        {/* forgot password */}

        <div className="form-group ">

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="theme-btn btn-style-one"
          >
            {loading ? "Logging in..." : "Signin"}
          </button>


          {/* <button type="button"
            onClick={handleLogout}
            className="btheme-btn btn-style-two"
          > Logout </button> */}

          {/* <button type="button"
            onClick={logoutAllDevices}
            className="btheme-btn btn-style-two"
          > Logout All Devices </button>  */}



        </div>
        {/* login */}
      </form>
      {/* End form */}

      <div className="bottom-box">
        <div className="text">
          Don&apos;t have an account? <Link href="/register">Signup</Link>
        </div>
        <div className="divider" style={{ width: "100%" }}>
          <span>or</span>
        </div>

        <LoginWithSocial />
      </div>
      {/* End bottom-box LoginWithSocial */}
      {showOtp && (
        <div>
          <div className="modal fade" id="otpModal" data-bs-backdrop="static" data-bs-keyboard="false" style={{ background: "#212529a3" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered login-modal  ">
              <div className="modal-content">
                <button
                  type="button"
                  className="closed-modal"
                  data-bs-dismiss="modal"
                ></button>
                {/* End close modal btn */}
                <div className="modal-body">
                  {/* <!-- Login modal --> */}
                  <div id="login-modal">
                    {/* <!-- Login Form --> */}
                    <div className="login-form default-form">
                      <OtpReg />
                    </div>
                    {/* <!--End Login Form --> */}
                  </div>
                  {/* <!-- End Login Module --> */}
                </div>
                {/* En modal-body */}
              </div>
              {/* End modal-content */}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FormContent2;
