'use client';
import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import Link from "next/link";
import LoginWithSocial from "./LoginWithSocial";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { tr } from "@faker-js/faker";

import OtpReg from "./OtpReg";

const FormContent = () => {


  const router = useRouter();
  const [role, setRole] = useState("candidate");

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  // useEffect(() => {
  //   getlogout();
  // }, []);

  // const getlogout = async () => {
  //   try {
  //     const res = await fetch("/api/logout", {
  //       method: "POST",
  //       credentials: "include", // IMPORTANT
  //     });
  //   } catch (error) {
  //   }
  // };


  useEffect(() => {
    if (typeof window === "undefined") return;

    const modalEl = document.getElementById("loginPopupModal");
    const handleModalShow = () => {
      setFormData({ email: "", password: "" });
      setErrors({ email: "", password: "" });
      setShowPassword(false);
    };
    modalEl?.addEventListener("show.bs.modal", handleModalShow);
    return () => {
      modalEl?.removeEventListener("show.bs.modal", handleModalShow);
    };
  }, []);

  // ✅ HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // email VALIDATION
    if (name === "email") {
      let error = "";

      if (!value) {
        error = "email is required";
      } else if (/\s/.test(value)) {
        error = "Spaces are not allowed";
      }

      setErrors((prev) => ({
        ...prev,
        email: error
      }));
    }

    // PASSWORD VALIDATION
    if (name === "password") {
      let error = "";

      if (!value) {
        error = "Password is required";
      }
      else if (/\s/.test(value)) {
        error = "Spaces are not allowed";
      }
      else if (value.length < 8) {
        error = "";
      }
      else if (value.length > 16) {
        error = "Maximum 16 characters allowed";
      }
      else if (!/[A-Z]/.test(value)) {
        error = "At least one uppercase letter required";
      }
      else if (!/[a-z]/.test(value)) {
        error = "At least one lowercase letter required";
      }
      else if (!/[0-9]/.test(value)) {
        error = "At least one number required";
      }
      else if (!/[@$!%*?&]/.test(value)) {
        error = "At least one special character required";
      }

      setErrors((prev) => ({
        ...prev,
        password: error
      }));
    }
  };
  const openOtpModal = () => {
    if (typeof window === "undefined") return;

    const registerModalEl = document.getElementById("registerModal");
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
  };
  // ✅ HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();


    let newErrors = {};

    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors((prev) => ({
      ...prev,
      ...newErrors
    }));

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please filled required fields");
      return;
    }

    try {

      // const users = [
      //   { email: "candidate", password: "Candidate@12", role: "candidate" },
      //   { email: "employer", password: "Employer@12", role: "employer" }
      // ];

      // const user = users.find(
      //   (u) =>
      //     u.email === formData.email &&
      //     u.password === formData.password
      // );

      setLoading(true);
      let email = formData.email;
      let password = formData.password;

      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),

      });

      try {
        const user = await res.json();

        console.log(user)

        if (!res.ok) {
          toast.error(user.message || "Login failed1");
          setLoading(false);
          return;
        }

        if (!user.status) {
          toast.error(user.message || "Login failed2");
          setLoading(false);
          return;
        }


        //check is verified or not
        if (user.isVefity == false) {
          openOtpModal();
          return;
        }

        if (user.isActive == false) {
          toast.error("Contact to support team");
          setLoading(false);
          return;
        }

        if (user) {

          //console.log("Login successful, user role:", user );

          const roleType = user.roleType?.trim().toLowerCase();
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", user.roleType);

          toast.success(`Signin successful, redirecting... as ${user.roleType} `);
          document.cookie.includes("isLoggedIn=true")

          document.querySelector(".closed-modal").click();
          if (roleType === "candidate") {
            window.location.href = "/candidates-dashboard/dashboard";
          } else if (roleType === "employer") {
            window.location.href = "/employers-dashboard/dashboard";
          }
          else {
            window.location.href = "/";
          }
          return;
        }
      } catch (err) {
        toast.error("Login failed");
        setLoading(false);
        return;
      }
      toast.error("Invalid email or password");

    } catch (error) {
      console.error(error);
      toast.error("Login Failed. Please try again.");
    }
  };

  return (

    <div className="form-inner">

      <h3>Login to {process.env.NEXT_PUBLIC_APP_NAME} </h3>

      {/* <!--Login Form--> */}
      <form onSubmit={handleSubmit}>
        {/* ROLE */}
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
          <label>Email </label>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          {errors.email && (
            <p style={{ color: "red" }}>{errors.email}</p>
          )}
        </div>
        {/* name */}

        <div className="form-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              maxLength={12}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();

                  setErrors((prev) => ({
                    ...prev,
                    password: "Spaces are not allowed"
                  }));
                }
              }}
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

          {errors.password && (
            <p style={{ color: "red" }}>{errors.password}</p>
          )}
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
              Forgot password?
            </a>
          </div>
        </div>
        {/* forgot password */}

        <div className="form-group">

          <button
            type="submit"
            disabled={loading}
            className="theme-btn btn-style-one"
          >
            {loading ? "Logging in..." : "Signin"}
          </button>

          {/* <button
            className="theme-btn btn-style-one"
            type="submit"
            name="log-in"
          >
            Log In
          </button> */}
        </div>
        {/* login */}
      </form>
      {/* End form */}

      <div className="bottom-box">
        <div className="text">
          Don&apos;t have an account?{" "}
          <Link
            href="#"
            className="call-modal signup"
            data-bs-toggle="modal"
            data-bs-target="#registerModal"
          >
            Signup
          </Link>
        </div>



        <div className="divider" style={{ width: "100%" }}>
          <span className="text-center">or  </span>
        </div>

        <LoginWithSocial />
      </div>
      {/* End bottom-box LoginWithSocial */}
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

    </div>
  );
};

export default FormContent;
