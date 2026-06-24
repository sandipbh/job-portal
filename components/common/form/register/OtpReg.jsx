"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const OtpReg = () => {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpMail, setOtpMail] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const inputsRefMail = useRef([]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [userUqId, setUserUqId] = useState("");

  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const fetchOtpUserData = async () => {
    if (typeof window === "undefined") return null;

    try {
      const response = await fetch("/api/otp-user-data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch OTP user data:", error);
      return null;
    }
  };

  const loadOtpUserData = async () => {
    if (typeof window === "undefined") return;

    const email = window.localStorage.getItem("otpUserEmail") || "";
    const mobile = window.localStorage.getItem("otpUserMobile") || "";
    const localUqId = window.localStorage.getItem("otpUserUqId") || "";

    setUserEmail(email);
    setUserMobile(mobile);
    setUserUqId(localUqId);

    const cookieData = await fetchOtpUserData();
    if (cookieData) {
      if (cookieData.otpUserEmail) {
        setUserEmail(cookieData.otpUserEmail);
        window.localStorage.setItem("otpUserEmail", cookieData.otpUserEmail);
      }
      if (cookieData.otpUserMobile) {
        setUserMobile(cookieData.otpUserMobile);
        window.localStorage.setItem("otpUserMobile", cookieData.otpUserMobile);
      }
      if (cookieData.otpUserUqId) {
        setUserUqId(cookieData.otpUserUqId);
        window.localStorage.setItem("otpUserUqId", cookieData.otpUserUqId);
      }
    }
  };

  useEffect(() => {
    loadOtpUserData();

    const modalEl = document.getElementById("otpModal");
    if (!modalEl) return;

    const handleModalShow = () => {
      loadOtpUserData();
      setOtp(["", "", "", "", "", ""]);
      setOtpMail(["", "", "", "", "", ""]);
      setTimeLeft(30);
      setCanResend(false);
    };

    const handleDataUpdated = () => {
      loadOtpUserData();
    };

    modalEl.addEventListener("show.bs.modal", handleModalShow);
    window.addEventListener("otpUserDataUpdated", handleDataUpdated);

    return () => {
      modalEl.removeEventListener("show.bs.modal", handleModalShow);
      window.removeEventListener("otpUserDataUpdated", handleDataUpdated);
    };
  }, []);

  useEffect(() => {
    const modalEl = document.getElementById("otpModal");
    if (!modalEl) return;

    const closeBtn = modalEl.querySelector(".closed-modal");
    const handleCloseClick = () => {
      if (typeof window === "undefined") return;

      if (window.bootstrap) {
        const modalInstance =
          window.bootstrap.Modal.getInstance(modalEl) ||
          new window.bootstrap.Modal(modalEl);
        modalInstance.hide();
        return;
      }

      modalEl.classList.remove("show");
      modalEl.style.display = "none";
      modalEl.setAttribute("aria-hidden", "true");
      modalEl.removeAttribute("aria-modal");

      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.parentNode?.removeChild(backdrop);
      }
    };

    closeBtn?.addEventListener("click", handleCloseClick);

    return () => {
      closeBtn?.removeEventListener("click", handleCloseClick);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      setCanResend(true);
      return;
    }
    // console.log("Time left for resend:", window.localStorage.getItem("otpUserUqId") || "No UqId");

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleChangeMail = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtpMail = [...otpMail];
    newOtpMail[index] = value;
    setOtpMail(newOtpMail);

    if (value && index < 5) {
      inputsRefMail.current[index + 1].focus();
    }
  };

  // 🔁 RESEND FUNCTION
  const handleResend = async () => {
    if (!canResend || resendLoading) return;

    if (!userEmail || !userMobile) {
      toast.error("Unable to resend OTP: missing registered contact.");
      return;
    }

    setResendLoading(true);


    try {
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          mobile: userMobile,
          uqid: userUqId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Unable to resend OTP.");
        return;
      }

      toast.success(data.message || "OTP resent successfully.");
      setTimeLeft(30);
      setCanResend(false);
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Unable to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async () => {
    const mobileOtp = otp.join("");
    const emailOtp = otpMail.join("");

    if (mobileOtp.length !== 6) {
      toast.error("Enter both 6-digit Mobile OTP codes.");
      return;
    }
    if (emailOtp.length !== 6) {
      toast.error("Enter both 6-digit Email OTP codes.");
      return;
    }

    setLoading(true);


    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobileOtp, emailOtp, uqid: userUqId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "OTP verification failed.");
        return;
      }
      if (response.ok) {
        toast.success(data.message || "OTP verified successfully.");
        router.push("/regsuccess");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Unable to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      <div className="otp-container">
        <div className="otp-card">

          <h2>Verify Mobile Number</h2>
          <p className="sub-text" style={{ marginBottom: "5px" }}>Your code was sent to your mobile <b>+91 {userMobile}  </b></p>

          <div className="otp-boxes">
            {otp.map((val, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={val}
                maxLength={1}
                onChange={(e) => handleChange(e.target.value, i)}
              />
            ))}
          </div>

          <h2>Verify Email</h2>
          <p className="sub-text" style={{ marginBottom: "5px" }}>Your code was sent to your email <b>{userEmail}</b></p>

          <div className="otp-boxes">
            {otpMail.map((val, i) => (
              <input
                key={i}
                ref={(el) => (inputsRefMail.current[i] = el)}
                value={val}
                maxLength={1}
                onChange={(e) => handleChangeMail(e.target.value, i)}
              />
            ))}
          </div>

          <button
            type="button"
            className="verify-btn"
            disabled={loading}
            onClick={handleVerify}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <p className="resend">
            {canResend ? (
              <>
                Didn’t receive code?{" "}
                <span onClick={handleResend}>
                  {resendLoading ? "Resending..." : "Request again"}
                </span>
              </>
            ) : (
              <>Resend code in <b>{timeLeft}</b></>
            )}
          </p>

          <div className="divider"></div>

          <h3>Great, now you can</h3>

          <ul>
            <li>✔ Build your profile and let recruiters find you</li>
            <li>✔ Get job postings delivered right to your email</li>
            <li>✔ Find a job and grow your career</li>
          </ul>

        </div>
      </div>
    </>
  );
};

export default OtpReg;