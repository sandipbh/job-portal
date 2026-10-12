"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";

const MESSAGES = {
  not_registered: "Account not found. Please register first.",
  candidate_only: "Social login is available for candidate accounts only.",
  not_verified: "Your account is not verified yet. Please verify and try again.",
  inactive_account: "Please verify your account first.",
};

const setMode = () => {
  document.cookie = "social_auth_mode=login; path=/; max-age=600; SameSite=Lax";
};

const LoginWithSocial = () => {

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("socialError");
    if (code) {
      toast.error(MESSAGES[code] || "Unable to login. Please try again.");
    }
  }, []);

  const loginWithLinkedIn = async () => {
    setMode();
    await signIn("linkedin", {
      callbackUrl: "/candidates-dashboard/dashboard",
    });
  };


  const loginWithGoogle = async () => {
    setMode();
    await signIn("google", {
      callbackUrl: "/candidates-dashboard/dashboard",
    });


  };

  return (
    <div className="btn-box row">
      <div className="col-lg-6 col-md-12">
        <button
          type="button"
          className="theme-btn social-btn-two facebook-btn"
          onClick={loginWithLinkedIn}
        >
          <i className="fab fa-linkedin"></i> Login via Linkedin
        </button>
      </div>
      <div className="col-lg-6 col-md-12">
        <button
          type="button"
          className="theme-btn social-btn-two google-btn"
          onClick={loginWithGoogle}
        >
          <i className="fab fa-google"></i>Login via Gmail
        </button>
      </div>
    </div>
  );
};

export default LoginWithSocial;
