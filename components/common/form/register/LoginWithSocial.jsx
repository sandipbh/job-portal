"use client";
import { signIn } from "next-auth/react";

const LoginWithSocial = () => {

  const loginWithLinkedIn = async () => {
    await signIn("linkedin", {
      callbackUrl: "/candidates-dashboard/dashboard",
    });
  };


  const loginWithGoogle = async () => {

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
          <i className="fab fa-linkedin"></i> Sign up via Linkedin
        </button>
      </div>
      <div className="col-lg-6 col-md-12">
        <button
          type="button"
          className="theme-btn social-btn-two google-btn"
          onClick={loginWithGoogle}
        >
          <i className="fab fa-google"></i>Sign up via Gmail
        </button>
      </div>
    </div>
  );
};

export default LoginWithSocial;
