'use client';
import { useState, useEffect } from "react";

import axios from "axios";
import Link from "next/link";

import { useRouter } from "next/navigation";


const Index = () => {

  const router = useRouter();

  useEffect(() => {
    getProfileDetails();
  }, []);

  const getProfileDetails = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include", // IMPORTANT
      });

      if (res.ok) {
        window.location.href = "/login";
      }

    } catch (error) {
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

      <h3>Logout {process.env.NEXT_PUBLIC_APP_NAME} </h3>


    </div>
  );
};

export default Index;
