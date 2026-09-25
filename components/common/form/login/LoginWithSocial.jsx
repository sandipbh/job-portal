"use client";

import { signIn } from "next-auth/react";

const LoginWithSocial = () => {
  const handleGoogleLogin = async (event) => {
    event.preventDefault();

    await signIn("google", {
      callbackUrl: "/",
    });
  };

  return (
    <div className="btn-box row">
      <div className="col-lg-6 col-md-12">
        <a href="#" className="theme-btn social-btn-two facebook-btn">
          <i className="fab fa-linkedin"></i> Log In via Linkedin
        </a>
      </div>
      <div className="col-lg-6 col-md-12">
        <button
          type="button"
          className="theme-btn social-btn-two google-btn"
          onClick={handleGoogleLogin}
        >
          <i className="fab fa-google"></i> Log In via Gmail
        </button>
      </div>
    </div>
  );
};

export default LoginWithSocial;
