"use client";
import Link from "next/link";
import globalData from "@/lib/global";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {  toast } from 'react-toastify';

const ForgetPassword = () => {

 const router = useRouter();
  const [email, setEmail] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("candidate");
 

  const handleLogin = async (e) => { 

    e.preventDefault();
    setError("");

     if (!email){
       //toast.error("Please enter email address");
         setError("Please enter email address");
      return false;
     }  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)){
      setError("Please enter valid email address");
      //toast.error("Please enter valid email address");
      return false;
    } 
 

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/get-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email,  role }), 
        
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to get password");
        setLoading(false);
        return;
      }
      toast.success("Your details have been sent to your email address. Please check your inbox.");
        
      
      router.push("/login"); 

    } catch (err) {
      setError("Something went wrong");
    }

    setLoading(false);
  };
 
  return (
    <div className="form-inner">
      <h3>Get Your Password</h3>

      {/* <!--Login Form--> */}
      <form method="post" onSubmit={handleLogin}>
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
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your registered email"
              required
            />
             
        </div>
         
        <div className="form-group mt-4">

      <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="theme-btn btn-style-one"
          >
            {loading ? "Getting password..." : "Get Password"}
          </button>  
        </div>
        {/* login */}
      </form>
      {/* End form */}

      <div className="bottom-box ">
        <div className="text">
          Already have an account? <Link href="/login">Login</Link>
        </div>
 
      </div>
      {/* End bottom-box LoginWithSocial */}
    </div>
  );
};

export default ForgetPassword;
