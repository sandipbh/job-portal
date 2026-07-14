'use client'
import LoginWithSocial from "./LoginWithSocial";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import OtpReg from "./OtpReg";


const freeEmailProviders = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "aol.com",
  "icloud.com",
  "protonmail.com",
  "zoho.com",
  "mail.com",
  "yandex.com"
];
const officialPrefixes = [
  "admin",
  "administrator",
  "hr",
  "careers",
  "jobs",
  "recruitment",
  "hiring",
  "manager",
  "director",
  "ceo",
  "founder",
  "owner",
  "support",
  "info",
  "contact",
  "office",
  "sales",
  "team",
  "staff",
  "operations",
  "accounts",
  "finance",
  "billing",
  "legal",
  "compliance",
  "marketing",
  "hello",
  "enquiry",
  "service"
];

const Register = () => {
  const [showOtp, setShowOtp] = useState(false);
  const router = useRouter();
  const [role, setRole] = useState("candidate");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mobile: "",
    name: "",
    companyName: ""
  });

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    name: "",
    mobile: "",
    companyName: ""
  });


  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const modalEl = document.getElementById("registerModal");
    const handleModalShow = () => {
      setFormData({
        email: "",
        password: "",
        mobile: "",
        name: "",
        companyName: "",
      });
      setErrors({
        email: "",
        password: "",
        name: "",
        mobile: "",
        companyName: "",
      });
      setShowPassword(false);
      setRole("candidate");
    };

    modalEl?.addEventListener("show.bs.modal", handleModalShow);

    return () => {
      modalEl?.removeEventListener("show.bs.modal", handleModalShow);
    };
  }, []);


  const isOfficialCompanyEmail = (email) => {
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    const [prefix, domain] = email.toLowerCase().split("@");

    if (freeEmailProviders.includes(domain)) return false;

    // Check official prefix
    return officialPrefixes.includes(prefix);
  }
  const openOtpModal = () => {
    setShowOtp(true);

  };
  // const openOtpModal = () => {
  //   if (typeof window === "undefined") return;

  //   const registerModalEl = document.getElementById("registerModal");
  //   const otpModalEl = document.getElementById("otpModal");
  //   const otpTrigger = document.querySelector(
  //     '[data-bs-toggle="modal"][data-bs-target="#otpModal"]'
  //   );

  //   const showOtpModal = () => {
  //     if (window.bootstrap && otpModalEl) {
  //       const otpModal =
  //         window.bootstrap.Modal.getInstance(otpModalEl) ||
  //         new window.bootstrap.Modal(otpModalEl);
  //       otpModal.show();
  //       return;
  //     }

  //     if (otpTrigger) {
  //       otpTrigger.click();
  //       return;
  //     }

  //     if (otpModalEl) {
  //       otpModalEl.classList.add("show");
  //       otpModalEl.style.display = "block";
  //       otpModalEl.setAttribute("aria-modal", "true");
  //       otpModalEl.removeAttribute("aria-hidden");
  //     }
  //   };

  //   if (window.bootstrap && registerModalEl) {
  //     const registerModal =
  //       window.bootstrap.Modal.getInstance(registerModalEl) ||
  //       new window.bootstrap.Modal(registerModalEl);

  //     const onHidden = () => {
  //       registerModalEl.removeEventListener("hidden.bs.modal", onHidden);
  //       showOtpModal();
  //     };

  //     registerModalEl.addEventListener("hidden.bs.modal", onHidden);
  //     registerModal.hide();
  //     return;
  //   }

  //   const registerClose = registerModalEl?.querySelector(
  //     '[data-bs-dismiss="modal"]'
  //   );
  //   if (registerClose) {
  //     registerClose.click();
  //     setTimeout(showOtpModal, 300);
  //     return;
  //   }

  //   if (registerModalEl) {
  //     registerModalEl.classList.remove("show");
  //     registerModalEl.style.display = "none";
  //     registerModalEl.setAttribute("aria-hidden", "true");
  //   }
  //   showOtpModal();
  // };




  // ✅ HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    let error = "";

    // ✅ NAME VALIDATION
    if (name === "name") {
      if (!value) {
        error = "Name is required";
      } else if (!/^[A-Za-z ]+$/.test(value)) {
        error = "Only alphabets and spaces allowed";
      }
    }

    // ✅ EMAIL VALIDATION
    if (name === "email") {
      if (!value) {
        error = "Email is required";
      } else if (/\s/.test(value)) {
        error = "Spaces are not allowed";
      }
    }
    if (name === "email" && role === "employer") {
      if (!isOfficialCompanyEmail(value)) {
        error = "Please enter a valid official company email address.";
      }
    }


    // ✅ MOBILE VALIDATION
    if (name === "mobile") {
      if (!value) {
        error = "Mobile number is required";
      } else if (!/^\d+$/.test(value)) {
        error = "Only numbers allowed";
      } else if (value.length !== 10) {
        error = "Mobile number must be 10 digits";
      }
    }

    // ✅ COMPANY NAME VALIDATION
    if (name === "companyName" && role === "employer") {
      if (!value) {
        error = "Company name is required for employers";
      } else if (value.trim().length < 2) {
        error = "Enter a valid company name";
      }
    }

    // ✅ PASSWORD VALIDATION
    if (name === "password") {
      if (!value) error = "Password is required";
      else if (/\s/.test(value)) error = "Spaces are not allowed";
      else if (value.length < 8) error = "Minimum 8 characters required";
      else if (value.length > 16) error = "Maximum 16 characters allowed";
      else if (!/[A-Z]/.test(value)) error = "At least one uppercase letter required";
      else if (!/[a-z]/.test(value)) error = "At least one lowercase letter required";
      else if (!/[0-9]/.test(value)) error = "At least one number required";
      else if (!/[@$!%*?&]/.test(value)) error = "At least one special character required";
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };
  const validateForm = () => {
    let newErrors = {};

    // Name
    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 5) {
      newErrors.name = "Enter valid full name";
    } else if (!/^[A-Za-z ]+$/.test(formData.name)) {
      newErrors.name = "Only alphabets and spaces allowed";
    }

    // Company Name (Employer only)
    if (role === "employer") {
      if (!formData.companyName) {
        newErrors.companyName = "Company name is required";
      } else if (formData.companyName.trim().length < 2) {
        newErrors.companyName = "Enter a valid company name";
      }
    }

    // Email
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = "Enter valid email address";
    }

    // Mobile
    if (!formData.mobile) {
      newErrors.mobile = "Mobile is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile must be exactly 10 digits";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    } else if (formData.password.length > 20) {
      newErrors.password = "Password must not exceed 20 characters";
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^()_\-+=])[A-Za-z\d@$!%*#?&^()_\-+=]{6,20}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must contain at least one letter, one number, and one special character";
    }

    // Terms & Conditions
    if (!accepted) {
      newErrors.accepted = "Please accept Terms & Conditions";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateForm();

    setErrors(errors);

    if (!isValid) {
      // Show first error in toast
      toast.error(Object.values(errors)[0]);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      });

      const user = await res.json();

      if (!res.ok) {
        toast.error(user.message || "Registration failed");
        return;
      }

      if (typeof window !== "undefined") {
        const otpUserUqId =
          user?.user?.Uqid ??
          user?.user?.uqId ??
          user?.user?.uqid ??
          user?.user?.id ??
          "";

        localStorage.setItem("otpUserEmail", formData.email);
        localStorage.setItem("otpUserMobile", formData.mobile);
        localStorage.setItem("otpUserUqId", otpUserUqId);
        window.dispatchEvent(new Event("otpUserDataUpdated"));
      }

      toast.success("Registration successful. Please verify OTP.");
      openOtpModal();
    } catch (error) {
      console.error(error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="form-inner">
      <h3>Create a Free {process.env.NEXT_PUBLIC_APP_NAME} Account </h3>

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

        {/* NAME */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Full Name.."
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
        </div>

        {role === "employer" && (
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleChange}
            />
            {errors.companyName && (
              <p style={{ color: "red" }}>{errors.companyName}</p>
            )}
          </div>
        )}

        {/* EMAIL */}
        <div className="form-group">
          <label>{role === "employer" ? "Official Email Address" : "Email"}</label>
          <input
            type="text"
            name="email"
            placeholder={role === "employer" ? "Official Email Address" : "Email"}
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        </div>

        {/* MOBILE */}
        <div className="form-group">
          <label>Mobile</label>
          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            maxLength={10}
            onChange={handleChange}
          />
          {errors.mobile && <p style={{ color: "red" }}>{errors.mobile}</p>}
        </div>

        {/* PASSWORD */}
        <div className="form-group">
          <label>Password</label>

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              maxLength={16}
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
        </div>


        <div className="form-group">

          <label htmlFor="register-terms-and-conditions">
            <input
              type="checkbox"
              name="terms_and_conditions"
              value="on"
              id="register-terms-and-conditions"

              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            &nbsp;  You accept our{" "}
            <a href="#">
              Terms and Conditions and Privacy Policy
            </a>
          </label>
        </div>

        {/* SUBMIT */}
        <div className="form-group" style={{ marginTop: "20px !important" }}>
          <button
            type="submit"
            disabled={loading}
            className="theme-btn btn-style-one"
          >
            {loading ? "Processing..." : "Register"}
          </button>
        </div>


      </form>
      <div
        className={`modal fade ${showOtp ? "show d-block" : ""}`}
        id="otpModal"
        style={{
          background: "#212529a3",
          display: showOtp ? "block" : "none"
        }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered login-modal  ">
          <div className="modal-content">
            <button
              type="button"
              className="closed-modal"
              onClick={() => setShowOtp(false)}
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

      <div className="bottom-box">
        <div className="text">
          Already have an account?{" "}
          <Link
            href="#"
            className="call-modal login"
            data-bs-toggle="modal"
            data-bs-target="#loginPopupModal"
          >
            Signin
          </Link>
        </div>

        <div className="divider" style={{ width: "100%" }}>
          <span>or</span>
        </div>

        <LoginWithSocial />
      </div>

    </div>


  );
};
<style jsx>{`
        .default-form .form-group {
         bottom-margin: 0px !important ;
        }
      `}</style>
export default Register;