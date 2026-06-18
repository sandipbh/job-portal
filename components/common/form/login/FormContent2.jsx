"use client";
import Link from "next/link";
import LoginWithSocial from "./LoginWithSocial";
import globalData from "@/lib/global";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FormContent2 = () => {

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("candidate");

  const [showPassword, setShowPassword] = useState(false);

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),

      });

      const data = await res.json();

      if (!res.success) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      console.log("Login success:", JSON.stringify(data));


      const roleType = data.roleType?.trim().toLowerCase();

      console.log("Login success roleType:", roleType);

      if (roleType === "employer") {
        router.push("/employers-dashboard/dashboard");
        return;
      } else if (roleType === "candidate") {
        router.push("/candidates-dashboard/dashboard");
        return;
      } else {
        router.push("/home-10");
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
          {/* <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            /> */}
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

        <div className="form-group ">

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="theme-btn btn-style-one"
          >
            {loading ? "Logging in..." : "Login"}
          </button>


          <button type="button"
            onClick={handleLogout}
            className="btheme-btn btn-style-two"
          > Logout </button>

          <button type="button"
            onClick={logoutAllDevices}
            className="btheme-btn btn-style-two"
          > Logout All Devices </button>




        </div>
        {/* login */}
      </form>
      {/* End form */}

      <div className="bottom-box">
        <div className="text">
          Don&apos;t have an account? <Link href="/register">Signup</Link>
        </div>
        {/* <div className="divider">
          <span>or</span>
        </div> */}

        {/* <LoginWithSocial /> */}
      </div>
      {/* End bottom-box LoginWithSocial */}
    </div>
  );
};

export default FormContent2;
